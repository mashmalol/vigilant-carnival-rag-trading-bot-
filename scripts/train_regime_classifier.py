"""
Fine-tune regime classification model using Mistral 7B
Trains on labeled historical market data to predict bull/bear/sideways/volatile regimes
"""

from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from datasets import Dataset
import json
import torch

class RegimeClassifierTrainer:
    def __init__(self, model_name="mistralai/Mistral-7B-Instruct-v0.2", output_dir="./models/regime-classifier-v1"):
        self.model_name = model_name
        self.output_dir = output_dir
        self.model = None
        self.tokenizer = None
        
    def load_training_data(self, filepath='./training-data/regime/regime_training.jsonl'):
        """Load training data from JSONL file"""
        data = []
        with open(filepath, 'r') as f:
            for line in f:
                data.append(json.loads(line))
        print(f"Loaded {len(data)} training examples")
        return data
    
    def format_prompt(self, example):
        """Format as Mistral instruction-following prompt"""
        prompt = f"""<s>[INST] {example['instruction']}

{example['input']}

Classify the market regime as one of: bull, bear, sideways, or high-volatility [/INST] {example['output']}</s>"""
        return prompt
    
    def prepare_dataset(self, data):
        """Convert data to Hugging Face Dataset"""
        formatted_data = [self.format_prompt(ex) for ex in data]
        
        dataset = Dataset.from_dict({
            'text': formatted_data
        })
        
        return dataset
    
    def tokenize_dataset(self, dataset):
        """Tokenize the dataset"""
        def tokenize_function(examples):
            return self.tokenizer(
                examples['text'],
                truncation=True,
                max_length=512,
                padding='max_length'
            )
        
        tokenized = dataset.map(tokenize_function, batched=True, remove_columns=['text'])
        return tokenized
    
    def train(self, training_data_path='./training-data/regime/regime_training.jsonl',
              epochs=3, batch_size=4, learning_rate=2e-5):
        """Train the regime classification model"""
        
        # Load model and tokenizer
        print(f"Loading model: {self.model_name}")
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_name,
            torch_dtype=torch.float16,
            device_map='auto'
        )
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.tokenizer.pad_token = self.tokenizer.eos_token
        
        # Load and prepare data
        data = self.load_training_data(training_data_path)
        dataset = self.prepare_dataset(data)
        tokenized_dataset = self.tokenize_dataset(dataset)
        
        # Training arguments
        training_args = TrainingArguments(
            output_dir=self.output_dir,
            num_train_epochs=epochs,
            per_device_train_batch_size=batch_size,
            gradient_accumulation_steps=4,
            learning_rate=learning_rate,
            fp16=True,
            logging_steps=10,
            save_strategy="epoch",
            save_total_limit=2,
            warmup_steps=100,
            optim="adamw_torch"
        )
        
        # Data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False
        )
        
        # Trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=tokenized_dataset,
            data_collator=data_collator
        )
        
        # Train
        print("Starting training...")
        trainer.train()
        
        # Save
        print(f"Saving model to {self.output_dir}")
        self.model.save_pretrained(self.output_dir)
        self.tokenizer.save_pretrained(self.output_dir)
        
        print("Training complete!")
    
    def test_classifier(self):
        """Test the trained classifier"""
        if self.model is None:
            print("Loading trained model...")
            self.model = AutoModelForCausalLM.from_pretrained(
                self.output_dir,
                torch_dtype=torch.float16,
                device_map='auto'
            )
            self.tokenizer = AutoTokenizer.from_pretrained(self.output_dir)
        
        test_cases = [
            {
                "input": """Price: $48,230.00
30-day change: 15.30%
Volatility (30d): 2.80%
RSI: 68.5
Volume trend: increasing
Price position: 85.2% of 30-day range
MACD signal: bullish""",
                "expected": "bull"
            },
            {
                "input": """Price: $42,100.00
30-day change: -12.50%
Volatility (30d): 3.20%
RSI: 32.1
Volume trend: decreasing
Price position: 15.8% of 30-day range
MACD signal: bearish""",
                "expected": "bear"
            },
            {
                "input": """Price: $45,000.00
30-day change: -2.10%
Volatility (30d): 1.50%
RSI: 51.0
Volume trend: stable
Price position: 48.5% of 30-day range
MACD signal: neutral""",
                "expected": "sideways"
            }
        ]
        
        print("\n=== Testing Regime Classifier ===\n")
        
        for i, test in enumerate(test_cases):
            prompt = f"""<s>[INST] Analyze market conditions and classify regime:

{test['input']}

Classify the market regime as one of: bull, bear, sideways, or high-volatility [/INST]"""
            
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
            
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=20,
                temperature=0.1,
                do_sample=True
            )
            
            result = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            prediction = result.split("[/INST]")[-1].strip().lower()
            
            # Extract just the regime label
            for regime in ['bull', 'bear', 'sideways', 'high-volatility']:
                if regime in prediction:
                    prediction = regime
                    break
            
            print(f"Test {i+1}:")
            print(f"  Expected: {test['expected']}")
            print(f"  Predicted: {prediction}")
            print(f"  {'✓' if prediction == test['expected'] else '✗'}")
            print()

if __name__ == "__main__":
    trainer = RegimeClassifierTrainer()
    
    # Train
    trainer.train(
        training_data_path='./training-data/regime/regime_training.jsonl',
        epochs=3,
        batch_size=2,
        learning_rate=2e-5
    )
    
    # Test
    trainer.test_classifier()
