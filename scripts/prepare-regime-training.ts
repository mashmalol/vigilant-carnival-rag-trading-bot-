import { RegimeDataGenerator } from './regime-data-generator';

async function main() {
  const generator = new RegimeDataGenerator();

  // Generate mock historical price data
  console.log('Generating historical candles...');
  const candles = generator.generateMockCandles(730); // 2 years

  // Label regimes
  console.log('Labeling market regimes...');
  const examples = await generator.generateFromPriceData(candles);

  // Save training data
  await generator.saveTrainingData(examples);

  console.log(`✓ Generated ${examples.length} regime training examples`);
  
  // Show distribution
  const distribution = examples.reduce((acc, ex) => {
    acc[ex.output] = (acc[ex.output] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\nRegime distribution:');
  Object.entries(distribution).forEach(([regime, count]) => {
    console.log(`  ${regime}: ${count} (${(count/examples.length*100).toFixed(1)}%)`);
  });

  console.log('\nReady for training with: python scripts/train_regime_classifier.py');
}

main().catch(console.error);
