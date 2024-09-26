/**
 * MongoSenseQueryBuilder is a utility class that helps to construct MongoDB aggregation pipelines
 * through a series of chained methods that correspond to MongoDB stages.
 */
class MongoSenseQueryBuilder {
    /**
       * Constructs a new MongoSenseQueryBuilder instance.
       *
       * @param debugMode - A boolean flag to enable logging for debugging purposes.
       * @param intelli - An optional IntelliOptimizer instance for query optimization.
       */
    constructor(debugMode = false, intelli) {
        this.pipeline = []; // Store aggregation pipeline stages
        this.collectionNames = []; // Store collection names
        this.logs = []; // Store logs for debugging purposes
        this.debugMode = debugMode;
        this.intelli = intelli; // IntelliOptimizer for optimization (optional)
    }
    /**
       * Conditionally log a message if debugMode is enabled.
       *
       * @param message - The message to log.
       */
    log(message) {
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
    collection(...collections) {
        this.collectionNames.push(...collections); // Store collection names
        this.log(`Selected collections: ${collections.join(', ')}`);
        return this; // Return this for chaining
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
    match(criteria) {
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
    sort(sortCriteria) {
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
    limit(limit) {
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
    skip(skip) {
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
    lookup(from, localField, foreignField, as) {
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
    group(groupBy, accumulations) {
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
    addFields(fields) {
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
    bucket(bucketSpec) {
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
    bucketAuto(bucketAutoSpec) {
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
    count(field) {
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
    facet(facetSpec) {
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
    project(projection) {
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
    unwind(path, options) {
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
    out(collection) {
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
    replaceRoot(newRoot) {
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
    merge(mergeSpec) {
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
    redact(redactExpr) {
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
    sample(size) {
        if (size) {
            this.pipeline.push({ $sample: { size } });
            this.log(`Added $sample stage: ${size}`);
        }
        return this;
    }
    /**
     * Optimize the pipeline using the Intelli engine (if available).
     * This includes reordering stages and analyzing index needs.
     *
     * @returns The optimized pipeline.
     */
    async optimize() {
        if (this.intelli) {
            // Optimize pipeline ordering (e.g., moving $match/$sort earlier)
            this.pipeline = this.intelli.optimizePipeline(this.pipeline);
            this.log('Pipeline optimized by Intelli.');
            // Suggest or create indexes based on fields in $match and $sort stages
            const queryFields = this.extractFieldsFromPipeline(['$match', '$sort']);
            for (const collection of this.collectionNames) {
                const recommendations = await this.intelli.analyzeAndRecommendIndexes(collection, queryFields);
                this.log(`Recommended indexes for ${collection}: ${recommendations.join(', ')}`);
            }
        }
        return this;
    }
    /**
     * Extract fields from specific stages of the pipeline (e.g., $match, $sort).
     *
     * @param stageNames - An array of stage names to extract fields from.
     * @returns An array of field names used in the specified stages.
     */
    extractFieldsFromPipeline(stageNames) {
        const fields = [];
        for (const stage of this.pipeline) {
            for (const stageName of stageNames) {
                if (stage[stageName]) {
                    fields.push(...Object.keys(stage[stageName]));
                }
            }
        }
        return fields;
    }
    /**
       * Automatically create indexes for recommended fields.
       *
       * @returns The instance of MongoSenseQueryBuilder after creating indexes.
       */
    async createIndexes() {
        if (this.intelli) {
            const queryFields = this.extractFieldsFromPipeline(['$match', '$sort']);
            for (const collection of this.collectionNames) {
                const createdIndexes = await this.intelli.createIndexes(collection, queryFields);
                this.log(`Indexes created for ${collection}: ${createdIndexes.join(', ')}`);
            }
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
            pipeline: this.pipeline, // The constructed aggregation pipeline stages
            collections: this.collectionNames // Return both pipeline and collection names
        };
    }
}
/**
 * Factory function to create a new instance of MongoSenseQueryBuilder.
 *
 * @param debugMode - Optional flag to enable logging. Default is `false`.
 * @param intelli - Optional IntelliOptimizer instance for query optimization.
 * @returns An instance of MongoSenseQueryBuilder.
 */
export function MongoSense(debugMode = false, intelli) {
    return new MongoSenseQueryBuilder(debugMode, intelli);
}
export { MongoSenseQueryBuilder };
