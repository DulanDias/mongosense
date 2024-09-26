import { MongoClient } from 'mongodb';

/**
 * IntelliOptimizer provides intelligence for optimizing MongoDB aggregation pipelines
 * and recommending or creating indexes based on query patterns.
 */
export class IntelliOptimizer {
  private db: any;

  /**
   * Constructs an IntelliOptimizer instance.
   * @param dbConnection - The MongoClient instance used for querying the MongoDB database.
   */
  constructor(private dbConnection: MongoClient) {
    this.db = dbConnection.db();  // Connect to the database instance
  }

  /**
   * Analyze the collection stats and recommend indexes based on query patterns.
   * 
   * @param collectionName - The name of the collection to analyze.
   * @param queryFields - Fields used in $match or $sort stages that might benefit from indexing.
   * @returns Recommendations for index creation.
   */
  async analyzeAndRecommendIndexes(collectionName: string, queryFields: string[]): Promise<string[]> {
    const stats = await this.db.command({ collStats: collectionName });
    const indexStats: IndexStats[] = await this.db.collection(collectionName).indexStats().toArray();

    const indexRecommendations: string[] = [];

    // Suggest an index if the field is not already indexed
    for (const field of queryFields) {
      const hasIndex = indexStats.some((index: IndexStats) => index.key[field] !== undefined);
      if (!hasIndex) {
        indexRecommendations.push(field);
      }
    }

    return indexRecommendations;
  }

  /**
   * Automatically create indexes for recommended fields.
   * 
   * @param collectionName - The name of the collection to create indexes on.
   * @param fields - The fields to index.
   * @returns An array of created indexes.
   */
  async createIndexes(collectionName: string, fields: string[]): Promise<string[]> {
    const collection = this.db.collection(collectionName);
    const createdIndexes = [];

    for (const field of fields) {
      const indexName = await collection.createIndex({ [field]: 1 });
      createdIndexes.push(indexName);
    }

    return createdIndexes;
  }

  /**
   * Optimize the pipeline by reordering stages for better performance.
   * Moves $match and $sort to the beginning of the pipeline where possible.
   * 
   * @param pipeline - The aggregation pipeline to optimize.
   * @returns Optimized pipeline.
   */
  optimizePipeline(pipeline: any[]): any[] {
    const matchStages = pipeline.filter(stage => stage.$match);
    const sortStages = pipeline.filter(stage => stage.$sort);
    const otherStages = pipeline.filter(stage => !stage.$match && !stage.$sort);

    // Return optimized pipeline: $match and $sort first
    return [...matchStages, ...sortStages, ...otherStages];
  }
}

// Export IntelliOptimizer class to be used in other modules
export default IntelliOptimizer;