import { EmbeddingDataGenerator } from './embedding-data-generator';

async function main() {
  const generator = new EmbeddingDataGenerator();

  // Generate mock trades for testing
  console.log('Generating mock trades...');
  const mockTrades = generator.generateMockTrades(1000);

  // Generate training pairs
  console.log('Creating contrastive pairs...');
  const pairs = await generator.generateFromTrades(mockTrades);

  // Save in both formats
  await generator.savePairs(pairs);
  await generator.exportJSONL(pairs);

  console.log(`✓ Generated ${pairs.length} embedding training pairs`);
  console.log('Ready for training with: python scripts/train_crypto_embeddings.py');
}

main().catch(console.error);
