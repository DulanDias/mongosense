class MongoSenseQueryBuilder {
  private pipeline: any[] = [];  // Store aggregation pipeline stages
  private collectionNames: string[] = [];  // Store collection names

  /**
   * Select one or more MongoDB collections to build the query on.
   * 
   * You can provide either a single collection name or multiple collection names.
   * This is useful for operations like `$lookup` or multi-collection queries.
   * 
   * @param collections - One or more collection names.
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
   * Conditionally add a $match stage to the pipeline if criteria is provided.
   * If `null` or `undefined` is passed, the $match stage is skipped.
   * 
   * @param criteria - The filter criteria for the $match stage.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   * 
   * @example
   * const query = MongoSense().match({ isActive: true }).build();
   */
  match(criteria: Record<string, any> | null | undefined) {
    if (criteria) {
      this.pipeline.push({ $match: criteria });
    }
    return this;
  }

  /**
   * Conditionally add a $sort stage to the pipeline if sorting criteria is provided.
   * If `null` or `undefined` is passed, the $sort stage is skipped.
   * 
   * @param sortCriteria - An object specifying the fields and their sort order.
   * Example: `{ age: 1 }` for ascending, or `{ age: -1 }` for descending.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   * 
   * @example
   * const query = MongoSense().sort({ age: 1 }).build();
   */
  sort(sortCriteria: Record<string, 1 | -1> | null | undefined) {
    if (sortCriteria) {
      this.pipeline.push({ $sort: sortCriteria });
    }
    return this;
  }

  /**
   * Conditionally add a $limit stage to the pipeline if a valid limit is provided.
   * If `null` or `undefined` is passed, the $limit stage is skipped.
   * 
   * @param limit - The number of documents to return.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   * 
   * @example
   * const query = MongoSense().limit(10).build();
   */
  limit(limit: number | null | undefined) {
    if (limit) {
      this.pipeline.push({ $limit: limit });
    }
    return this;
  }

  /**
   * Conditionally add a $skip stage to the pipeline for pagination.
   * If `null` or `undefined` is passed, the $skip stage is skipped.
   * 
   * @param skip - The number of documents to skip.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   * 
   * @example
   * const query = MongoSense().skip(20).build();
   */
  skip(skip: number | null | undefined) {
    if (skip) {
      this.pipeline.push({ $skip: skip });
    }
    return this;
  }

  /**
   * Conditionally add a $lookup stage to perform a left outer join with another collection.
   * If the `from` collection is `null` or `undefined`, the $lookup stage is skipped.
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
  lookup(from: string | null | undefined, localField: string, foreignField: string, as: string) {
    if (from) {
      this.pipeline.push({
        $lookup: {
          from,
          localField,
          foreignField,
          as
        }
      });
    }
    return this;
  }

  /**
   * Conditionally add a $group stage to perform aggregation if `groupBy` and `accumulations` are provided.
   * If either `groupBy` or `accumulations` is `null` or `undefined`, the $group stage is skipped.
   * 
   * @param groupBy - The field or fields to group by.
   * @param accumulations - An object that defines aggregation operations, such as `$sum`, `$avg`, etc.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   * 
   * @example
   * const query = MongoSense().group({ category: "$category" }, { totalSales: { $sum: "$amount" } }).build();
   */
  group(groupBy: Record<string, any> | null | undefined, accumulations: Record<string, any> | null | undefined) {
    if (groupBy && accumulations) {
      this.pipeline.push({
        $group: { _id: groupBy, ...accumulations }
      });
    }
    return this;
  }

  /**
   * Build and return the constructed aggregation pipeline.
   * 
   * @returns An object containing the pipeline stages and the collection names used.
   * 
   * @example
   * const result = MongoSense().match({ isActive: true }).build();
   * console.log(result.pipeline);  // Outputs the aggregation pipeline
   */
  build() {
    return {
      pipeline: this.pipeline,   // The constructed aggregation pipeline stages
      collections: this.collectionNames  // Return both pipeline and collection names
    };
  }
}

// Export a factory function to create a new MongoSenseQueryBuilder instance
export function MongoSense() {
  return new MongoSenseQueryBuilder();
}
