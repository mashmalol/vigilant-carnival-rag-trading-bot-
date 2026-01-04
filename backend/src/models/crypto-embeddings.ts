/**
 * Local crypto-specific embedding model
 * Fine-tuned on trading terminology for better RAG similarity
 */
export class CryptoEmbeddingModel {
  private model: any = null;
  private modelPath: string;

  constructor(modelPath: string = './models/crypto-embeddings-v1') {
    this.modelPath = modelPath;
  }

  /**
   * Initialize the model (loads from disk)
   */
  async initialize(): Promise<void> {
    try {
      // Use ONNX runtime for fast inference
      const { pipeline } = await import('@xenova/transformers');
      
      this.model = await pipeline('feature-extraction', this.modelPath, {
        quantized: true // Use quantized model for speed
      });

      console.log('✓ Crypto embedding model loaded');
    } catch (error) {
      console.error('Failed to load crypto embedding model:', error);
      console.warn('⚠ Falling back to generic embeddings');
      throw error;
    }
  }

  /**
   * Generate embedding for crypto trading text
   */
  async encode(text: string): Promise<number[]> {
    if (!this.model) {
      throw new Error('Model not initialized. Call initialize() first.');
    }

    try {
      const output = await this.model(text, {
        pooling: 'mean',
        normalize: true
      });

      // Convert to regular array
      return Array.from(output.data as Float32Array);
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * Batch encode multiple texts
   */
  async encodeBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (const text of texts) {
      const embedding = await this.encode(text);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have same dimension');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Find most similar text from a list
   */
  async findMostSimilar(query: string, candidates: string[]): Promise<{
    text: string;
    similarity: number;
    index: number;
  }> {
    const queryEmbedding = await this.encode(query);
    const candidateEmbeddings = await this.encodeBatch(candidates);

    let maxSimilarity = -1;
    let maxIndex = 0;

    for (let i = 0; i < candidateEmbeddings.length; i++) {
      const similarity = this.cosineSimilarity(queryEmbedding, candidateEmbeddings[i]);
      
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        maxIndex = i;
      }
    }

    return {
      text: candidates[maxIndex],
      similarity: maxSimilarity,
      index: maxIndex
    };
  }
}
