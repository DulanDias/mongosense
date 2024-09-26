class MongoSenseQueryBuilder {
    private pipeline: any[] = [];  // Store aggregation pipeline stages
    private collectionNames: string[] = [];  // Store collection names
  
    /**
 * Select one or more MongoDB collections to build the query on.
 * 
 * You can provide either a single collection name or multiple collection names.
 * This is useful for operations like `$lookup` or multi-collection queries.
 * 
 * @param collections - An array of collection names or a single collection name.
 * @returns The MongoSenseQueryBuilder instance (for chaining).
 * 
 * @example
 * const builder = MongoSense().collection('users', 'orders');
 */
    collection(...collections: string[]) {
      this.collectionNames.push(...collections);  // Store collection names
      return this;  // Return this for chaining
    }

    /**
     * Add a $match stage to filter documents based on criteria.
     * 
     * @param criteria - An object representing the match conditions.
     * @returns The MongoSenseQueryBuilder instance (for chaining).
     * 
     * @example
     * const query = MongoSense().match({ isActive: true }).build();
     */
    match(criteria: Record<string, any>) {
      this.pipeline.push({ $match: criteria });
      return this;
    }

     /**
     * Add a $sort stage to the pipeline.
     * 
     * @param sortCriteria - An object specifying the fields and their sort order.
     * Example: { age: 1 } for ascending, or { age: -1 } for descending.
     * @returns The MongoSenseQueryBuilder instance (for chaining).
     * 
     * @example
     * const query = MongoSense().sort({ age: 1 }).build();
     */
    sort(sortCriteria: Record<string, 1 | -1>) {
      this.pipeline.push({ $sort: sortCriteria });
      return this;
    }
  
    /**
     * Build and return the aggregation pipeline.
     * 
     * @returns The constructed pipeline (an array of aggregation stages).
     */
    build() {
      return {
        pipeline: this.pipeline,
        collections: this.collectionNames  // Return both pipeline and collection names
      };
    }
  }
  
  // Export a factory function to create a new MongoSenseQueryBuilder instance
  export function MongoSense() {
    return new MongoSenseQueryBuilder();
  }
  