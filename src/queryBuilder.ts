class MongoSenseQueryBuilder {
  private pipeline: any[] = [];  // Store aggregation pipeline stages
  private collectionNames: string[] = [];  // Store collection names
  private logs: string[] = [];  // Store logs for debugging purposes
  private debugMode: boolean;  // Enable or disable logging

  constructor(debugMode = false) {
    this.debugMode = debugMode;  // Initialize debugMode, default is false
  }

  /**
     * Conditionally log a message if debugMode is enabled.
     * 
     * @param message - The message to log.
     */
    private log(message: string) {
      if (this.debugMode) {
          this.logs.push(message);
      }
  }

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
    this.log(`Selected collections: ${collections.join(', ')}`);
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
      this.log(`Added $match stage: ${JSON.stringify(criteria)}`);
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
      this.log(`Added $sort stage: ${JSON.stringify(sortCriteria)}`);
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
      this.log(`Added $limit stage: ${limit}`);
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
      this.log(`Added $skip stage: ${skip}`);
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
      this.log(`Added $lookup stage: { from: ${from}, localField: ${localField}, foreignField: ${foreignField}, as: ${as} }`);
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
      this.log(`Added $group stage: { _id: ${JSON.stringify(groupBy)}, accumulations: ${JSON.stringify(accumulations)} }`);
    }
    return this;
  }

  /**
   * Add a $addFields stage to add new fields to documents.
   * 
   * @param fields - An object defining the new fields to add. Skipped if null or undefined.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   */
  addFields(fields: Record<string, any> | null | undefined) {
    if (fields) {
      this.pipeline.push({ $addFields: fields });
      this.log(`Added $addFields stage: ${JSON.stringify(fields)}`);
    }
    return this;
  }

  /**
   * Add a $bucket stage to group documents into buckets based on a specified field.
   * 
   * @param bucketSpec - The bucket specification. Skipped if null or undefined.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   */
  bucket(bucketSpec: Record<string, any> | null | undefined) {
    if (bucketSpec) {
      this.pipeline.push({ $bucket: bucketSpec });
      this.log(`Added $bucket stage: ${JSON.stringify(bucketSpec)}`);
    }
    return this;
  }

  /**
   * Add a $bucketAuto stage to group documents into buckets automatically.
   * 
   * @param bucketAutoSpec - The auto bucket specification. Skipped if null or undefined.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   */
  bucketAuto(bucketAutoSpec: Record<string, any> | null | undefined) {
    if (bucketAutoSpec) {
      this.pipeline.push({ $bucketAuto: bucketAutoSpec });
      this.log(`Added $bucketAuto stage: ${JSON.stringify(bucketAutoSpec)}`);
    }
    return this;
  }

  /**
   * Add a $count stage to count the number of documents that pass through the pipeline.
   * 
   * @param field - The name of the field that will store the count result. Skipped if null or undefined.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   */
  count(field: string | null | undefined) {
    if (field) {
      this.pipeline.push({ $count: field });
      this.log(`Added $count stage: ${field}`);
    }
    return this;
  }

  /**
   * Add a $facet stage to create multiple pipelines that run in parallel.
   * 
   * @param facetSpec - The facet specification. Skipped if null or undefined.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   */
  facet(facetSpec: Record<string, any> | null | undefined) {
    if (facetSpec) {
      this.pipeline.push({ $facet: facetSpec });
      this.log(`Added $facet stage: ${JSON.stringify(facetSpec)}`);
    }
    return this;
  }

  /**
   * Add a $project stage to include, exclude, or add new fields to documents.
   * 
   * @param projection - The projection specification. Skipped if null or undefined.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   */
  project(projection: Record<string, any> | null | undefined) {
    if (projection) {
      this.pipeline.push({ $project: projection });
      this.log(`Added $project stage: ${JSON.stringify(projection)}`);
    }
    return this;
  }

  /**
   * Add a $unwind stage to deconstruct an array field from the input documents.
   * 
   * @param path - The path to the array field to unwind. Skipped if null or undefined.
   * @param options - Additional unwind options (optional).
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   */
  unwind(path: string | null | undefined, options?: Record<string, any>) {
    if (path) {
      const unwindStage = { $unwind: options ? { path, ...options } : path };
      this.pipeline.push(unwindStage);
      this.log(`Added $unwind stage: ${JSON.stringify(unwindStage)}`);
    }
    return this;
  }

  /**
   * Add a $out stage to write the results of the pipeline to a collection.
   * 
   * @param collection - The collection to output the pipeline results to. Skipped if null or undefined.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   */
  out(collection: string | null | undefined) {
    if (collection) {
      this.pipeline.push({ $out: collection });
      this.log(`Added $out stage: ${collection}`);
    }
    return this;
  }

  /**
   * Add a $replaceRoot stage to replace the root document with a specified document.
   * 
   * @param newRoot - The document that will replace the root. Skipped if null or undefined.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   */
  replaceRoot(newRoot: Record<string, any> | null | undefined) {
    if (newRoot) {
      this.pipeline.push({ $replaceRoot: { newRoot } });
      this.log(`Added $replaceRoot stage: ${JSON.stringify(newRoot)}`);
    }
    return this;
  }

  /**
   * Add a $merge stage to merge the pipeline output into an existing collection.
   * 
   * @param mergeSpec - The merge specification. Skipped if null or undefined.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   */
  merge(mergeSpec: Record<string, any> | null | undefined) {
    if (mergeSpec) {
      this.pipeline.push({ $merge: mergeSpec });
      this.log(`Added $merge stage: ${JSON.stringify(mergeSpec)}`);
    }
    return this;
  }

  /**
   * Add a $redact stage to restrict the content of documents.
   * 
   * @param redactExpr - The redact expression. Skipped if null or undefined.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   */
  redact(redactExpr: Record<string, any> | null | undefined) {
    if (redactExpr) {
      this.pipeline.push({ $redact: redactExpr });
      this.log(`Added $redact stage: ${JSON.stringify(redactExpr)}`);
    }
    return this;
  }

  /**
   * Add a $sample stage to randomly select documents from the collection.
   * 
   * @param size - The number of documents to randomly select. Skipped if null or undefined.
   * @returns The MongoSenseQueryBuilder instance (for chaining).
   */
  sample(size: number | null | undefined) {
    if (size) {
      this.pipeline.push({ $sample: { size } });
      this.log(`Added $sample stage: ${size}`);
    }
    return this;
  }

  /**
     * View the logs recorded during pipeline construction (only available if debugMode is true).
     * 
     * @returns An array of log messages.
     */
  viewLogs() {
    return this.logs;
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
export function MongoSense(debugMode: boolean = false): MongoSenseQueryBuilder {
  return new MongoSenseQueryBuilder(debugMode);
}
