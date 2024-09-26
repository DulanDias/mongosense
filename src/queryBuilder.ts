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
     * Add a $limit stage to the pipeline.
     * 
     * @param limit - The number of documents to return.
     * @returns The MongoSenseQueryBuilder instance (for chaining).
     * 
     * @example
     * const query = MongoSense().limit(10).build();
     */
    limit(limit: number) {
      this.pipeline.push({ $limit: limit });
      return this;
    }

    /**
     * Add a $skip stage to implement pagination.
     * 
     * @param skip - The number of documents to skip.
     * @returns The MongoSenseQueryBuilder instance (for chaining).
     * 
     * @example
     * const query = MongoSense().skip(20).build();
     */
    skip(skip: number) {
      this.pipeline.push({ $skip: skip });
      return this;
    }

    /**
     * Add a $lookup stage to perform a left outer join with another collection.
     * 
     * @param from - The target collection to join with.
     * @param localField - The field from the current collection.
     * @param foreignField - The field from the target collection.
     * @param as - The name of the new field to store the joined documents.
     * @returns The MongoSenseQueryBuilder instance (for chaining).
     * 
     * @example
     * const query = MongoSense().lookup('orders', '_id', 'userId', 'userOrders').build();
     */
    lookup(from: string, localField: string, foreignField: string, as: string) {
      this.pipeline.push({
        $lookup: {
          from: from,
          localField: localField,
          foreignField: foreignField,
          as: as
        }
      });
      return this;
    }

    /**
     * Add a $group stage to perform aggregation.
     * 
     * @param groupBy - The field or fields to group by.
     * @param accumulations - An object that defines aggregation operations.
     * @returns The MongoSenseQueryBuilder instance (for chaining).
     * 
     * @example
     * const query = MongoSense().group({ _id: "$category" }, { totalSales: { $sum: "$amount" } }).build();
     */
    group(groupBy: Record<string, any>, accumulations: Record<string, any>) {
      this.pipeline.push({
        $group: { _id: groupBy, ...accumulations }
      });
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
  