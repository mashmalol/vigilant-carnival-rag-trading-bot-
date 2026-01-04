"""
Fine-tune embedding model for crypto trading using Sentence Transformers
Trains on contrastive pairs to understand crypto-specific terminology
"""

from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader
import json
import os

class CryptoEmbeddingTrainer:
    def __init__(self, base_model='all-MiniLM-L6-v2', output_dir='./models/crypto-embeddings-v1'):
        self.base_model = base_model
        self.output_dir = output_dir
        self.model = None
        
    def load_training_data(self, filepath='./training-data/embeddings/crypto_pairs.json'):
        """Load training pairs from JSON file"""
        with open(filepath, 'r') as f:
            data = json.load(f)
        return data
    
    def prepare_examples(self, data):
        """Convert JSON data to InputExamples for training"""
        examples = []
        
        for item in data:
            # Triplet format: (anchor, positive, negative)
            example = InputExample(
                texts=[item['anchor'], item['positive'], item['negative']]
            )
            examples.append(example)
        
        print(f"Prepared {len(examples)} training examples")
        return examples
    
    def train(self, training_data_path='./training-data/embeddings/crypto_pairs.json', 
              epochs=10, batch_size=16, warmup_steps=100):
        """Train the embedding model"""
        
        # Load base model
        print(f"Loading base model: {self.base_model}")
        self.model = SentenceTransformer(self.base_model)
        
        # Load and prepare training data
        data = self.load_training_data(training_data_path)
        train_examples = self.prepare_examples(data)
        
        # Create DataLoader
        train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=batch_size)
        
        # Use Triplet Loss for contrastive learning
        train_loss = losses.TripletLoss(model=self.model)
        
        # Training
        print(f"Starting training for {epochs} epochs...")
        self.model.fit(
            train_objectives=[(train_dataloader, train_loss)],
            epochs=epochs,
            warmup_steps=warmup_steps,
            output_path=self.output_dir,
            show_progress_bar=True
        )
        
        print(f"Training complete! Model saved to {self.output_dir}")
    
    def test_embeddings(self):
        """Test the trained model on crypto-specific examples"""
        if self.model is None:
            self.model = SentenceTransformer(self.output_dir)
        
        test_sentences = [
            "BTCUSDT bullish breakout with high volume",
            "Bitcoin USD showing strong upward momentum",  # Should be similar to above
            "ETHUSDT bearish consolidation pattern",       # Should be dissimilar
            "RSI oversold on 4h chart",
            "4-hour RSI below 30 indicating oversold",     # Should be similar to above
            "MACD bullish crossover signal"                 # Should be dissimilar
        ]
        
        embeddings = self.model.encode(test_sentences)
        
        print("\nTest Embeddings Shape:", embeddings.shape)
        print("\nSimilarity Matrix:")
        
        from sklearn.metrics.pairwise import cosine_similarity
        
        similarity_matrix = cosine_similarity(embeddings)
        
        # Print with sentence labels
        for i, sent in enumerate(test_sentences):
            print(f"\n{i}: {sent[:50]}...")
            for j in range(len(test_sentences)):
                if i != j:
                    print(f"  vs {j}: {similarity_matrix[i][j]:.3f}")

if __name__ == "__main__":
    # Example usage
    trainer = CryptoEmbeddingTrainer()
    
    # Train the model
    trainer.train(
        training_data_path='./training-data/embeddings/crypto_pairs.json',
        epochs=10,
        batch_size=16
    )
    
    # Test embeddings
    trainer.test_embeddings()
