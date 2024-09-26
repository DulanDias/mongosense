# MongoSense Query Builder

**MongoSense** is a flexible and easy-to-use MongoDB aggregation pipeline builder. It supports chaining, conditional stage inclusion, and logging for debugging purposes. Build complex pipelines easily with methods that map directly to MongoDB’s aggregation framework.

## Features
- **Chaining**: Chain multiple aggregation stages easily.
- **Conditional Query**: Skip stages when conditions aren't met (e.g., when parameters are `null` or `undefined`).
- **Logging**: Enable `debugMode` to log the pipeline construction process for debugging.
- **MongoDB Aggregation Stages**: Supports all major MongoDB aggregation stages.

## Installation

```bash
npm install mongosense
```

## MongoSense Factory Function

The `MongoSense()` function is a factory that creates and returns an instance of the `MongoSenseQueryBuilder` class. This builder provides a flexible way to construct MongoDB aggregation pipelines using chained methods.

The `MongoSenseQueryBuilder` class provides the following key methods:

- `collection()`: Select one or more collections.
- `match()`: Add a `$match` stage to filter documents.
- `sort()`: Add a `$sort` stage to order documents.
- `limit()`: Add a `$limit` stage to restrict the number of documents.
- `skip()`: Add a `$skip` stage to skip a number of documents.
- `lookup()`: Add a `$lookup` stage for left outer joins.
- `addFields()`, `$bucket()`, `$bucketAuto()`, `$count()`, `$facet()`, `$project()`, `$unwind()`, `$out()`, `$replaceRoot()`, `$merge()`, `$redact()`, `$sample()`.

## Usage Example

```typescript
import { MongoSense } from 'mongosense';

const builder = new MongoSense(true)  // Enable debug mode
  .collection('users')
  .match({ isActive: true })  // Add $match stage
  .addFields({ fullName: { $concat: ['$firstName', ' ', '$lastName'] } })  // Add $addFields stage
  .project({ firstName: 1, lastName: 1, fullName: 1 })  // Add $project stage
  .unwind('$orders')  // Add $unwind stage
  .count('orderCount')  // Add $count stage
  .sample(10)  // Add $sample stage
  .build();

console.log(builder);
```

### Output:
```json
{
  "pipeline": [
    { "$match": { "isActive": true } },
    { "$addFields": { "fullName": { "$concat": ["$firstName", " ", "$lastName"] } } },
    { "$project": { "firstName": 1, "lastName": 1, "fullName": 1 } },
    { "$unwind": "$orders" },
    { "$count": "orderCount" },
    { "$sample": { "size": 10 } }
  ],
  "collections": ["users"]
}
```

## API Documentation

### `MongoSense(debugMode: boolean = false)`
Creates a new instance of the MongoSenseQueryBuilder.

- **Parameters**:
  - `debugMode`: When set to `true`, enables logging of pipeline construction. Default is `false`.

### Collection Selector

The `collection()` method allows you to specify one or more MongoDB collections that the query will target. This is useful for operations like `$lookup` or for multi-collection queries.

```typescript
// Example: Single Collection
const builder = MongoSense().collection('users');

// Example: Multiple Collections
const builder = MongoSense().collection('users', 'orders');
```

You can also chain the collection selector with other methods, as shown:
```typescript
const pipeline = MongoSense()
  .collection('users')
  .build();
```

### $match Stage

The `match()` method is used to add a `$match` stage to the MongoDB aggregation pipeline. It allows you to filter documents based on a given set of criteria.

```typescript
// Example
const pipeline = MongoSense()
  .collection('users')  // Select the 'users' collection
  .match({ isActive: true })  // Filter for active users
  .build();

console.log(pipeline);

// Output:
// [
//   { $match: { isActive: true } }
// ]
```

* Parameters:
    * criteria: An object representing the filter criteria. This is similar to the MongoDB find() query.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.

### $sort Stage

The `sort()` method is used to add a `$sort` stage to the MongoDB aggregation pipeline. It allows you to sort documents based on specific fields in either ascending or descending order.

#### Example:

```typescript
const pipeline = MongoSense()
  .collection('users')  // Select the 'users' collection
  .match({ isActive: true })  // Filter for active users
  .sort({ age: 1 })  // Sort by age in ascending order
  .build();

console.log(pipeline);
// Output:
// [
//   { $match: { isActive: true } },
//   { $sort: { age: 1 } }
// ]
```

* Parameters:
    * sortCriteria: An object specifying the field names as keys and the sort order as values. Use 1 for ascending and -1 for descending.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.

### $limit and $skip Stages

The `limit()` and `skip()` methods are used to add `$limit` and `$skip` stages to the MongoDB aggregation pipeline. These stages are essential for pagination, where `skip()` is used to skip a certain number of documents and `limit()` is used to return a limited number of documents.

```typescript
// Example:

const pageSize = 10;
const pageNumber = 3;  // For page 3
const skip = (pageNumber - 1) * pageSize;

const pipeline = MongoSense()
  .collection('users')  // Select the 'users' collection
  .skip(skip)  // Skip the first 20 documents (for page 3)
  .limit(pageSize)  // Return 10 documents
  .build();

console.log(pipeline);
// Output:
// [
//   { $skip: 20 },
//   { $limit: 10 }
// ]
```

* Parameters:
    * limit: The number of documents to return.
    * skip: The number of documents to skip.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.

#### Pagination Logic:
When implementing pagination, you typically calculate how many documents to skip based on the current page number and the page size (number of items per page). Here's the formula:

* Skip Formula: skip = (pageNumber - 1) * pageSize
* Limit Formula: limit = pageSize
With the skip() and limit() methods, you can easily create a paginated query.

### $lookup Stage

The `lookup()` method is used to add a `$lookup` stage to the MongoDB aggregation pipeline. This stage performs a left outer join with another collection, allowing you to merge documents from two collections.

```typescript
// Example:
const pipeline = MongoSense()
  .collection('users')  // Select the 'users' collection
  .lookup('orders', '_id', 'userId', 'userOrders')  // Join with the 'orders' collection
  .build();

console.log(pipeline);
// Output:
// [
//   {
//     $lookup: {
//       from: 'orders',
//       localField: '_id',
//       foreignField: 'userId',
//       as: 'userOrders'
//     }
//   }
// ]
```
* Parameters:
    * from: The target collection to join with.
    * localField: The field from the current collection to match with the foreignField.
    * foreignField: The field from the target collection to match with the localField.
    * as: The name of the field where the joined documents will be stored.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.

### $group Stage

The `group()` method is used to add a `$group` stage to the MongoDB aggregation pipeline. This stage allows you to group documents by a specified key and perform various aggregation operations, such as `$sum`, `$avg`, `$min`, and `$max`.


```typescript
// Example:
const pipeline = MongoSense()
  .collection('sales')  // Select the 'sales' collection
  .group({ category: "$category" }, { totalSales: { $sum: "$amount" } })  // Group by category and sum total sales
  .build();

console.log(pipeline);
// Output:
// [
//   {
//     $group: {
//       _id: { category: "$category" },
//       totalSales: { $sum: "$amount" }
//     }
//   }
// ]
```
* Parameters:
    * groupBy: Specifies the field (or fields) to group by.
    * accumulations: Defines the aggregation operations, such as $sum, $avg, $min, or $max.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.

### $addFields Stage

The `addFields()` method is used to add new fields to documents in the MongoDB aggregation pipeline.

```typescript
// Example
const pipeline = MongoSense()
  .collection('users')  // Select the 'users' collection
  .addFields({ fullName: { $concat: ['$firstName', ' ', '$lastName'] } })  // Add a fullName field
  .build();

console.log(pipeline);

// Output:
// [
//   { $addFields: { fullName: { $concat: ['$firstName', ' ', '$lastName'] } } }
// ]
```

* Parameters:
    * `fields`: An object defining the new fields to add.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.


### $bucket Stage

The `bucket()` method is used to group documents into user-defined buckets based on a specified field.

```typescript
// Example
const pipeline = MongoSense()
  .collection('sales')  // Select the 'sales' collection
  .bucket({
    groupBy: "$amount",
    boundaries: [0, 100, 200, 300, 400],
    default: "Other",
    output: {
      count: { $sum: 1 },
      totalAmount: { $sum: "$amount" }
    }
  })  // Group sales by amount
  .build();

console.log(pipeline);

// Output:
// [
//   { $bucket: { groupBy: "$amount", boundaries: [0, 100, 200, 300, 400], default: "Other", output: { count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } } }
// ]
```

* Parameters:
    * `bucketSpec`: The bucket specification object.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.


### $bucketAuto Stage

The `bucketAuto()` method is used to automatically group documents into a specified number of buckets based on a field.

```typescript
// Example
const pipeline = MongoSense()
  .collection('sales')  // Select the 'sales' collection
  .bucketAuto({
    groupBy: "$amount",
    buckets: 4,
    output: {
      count: { $sum: 1 },
      totalAmount: { $sum: "$amount" }
    }
  })  // Automatically group sales into 4 buckets
  .build();

console.log(pipeline);

// Output:
// [
//   { $bucketAuto: { groupBy: "$amount", buckets: 4, output: { count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } } }
// ]
```

* Parameters:
    * `bucketAutoSpec`: The auto bucket specification object.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.


### $count Stage

The `count()` method is used to count the number of documents that pass through the pipeline.

```typescript
// Example
const pipeline = MongoSense()
  .collection('users')  // Select the 'users' collection
  .count('userCount')  // Count the number of users
  .build();

console.log(pipeline);

// Output:
// [
//   { $count: "userCount" }
// ]
```

* Parameters:
    * `field`: The name of the field where the count will be stored.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.


### $facet Stage

The `facet()` method is used to run multiple aggregation pipelines in parallel and merge the results.

```typescript
// Example
const pipeline = MongoSense()
  .collection('users')  // Select the 'users' collection
  .facet({
    ageFacet: [
      { $match: { age: { $gte: 18 } } },
      { $count: "adultCount" }
    ],
    locationFacet: [
      { $match: { location: { $exists: true } } },
      { $count: "locationCount" }
    ]
  })  // Run two pipelines: one to count adults, one to count users with locations
  .build();

console.log(pipeline);

// Output:
// [
//   { $facet: { ageFacet: [{ $match: { age: { $gte: 18 } } }, { $count: "adultCount" }], locationFacet: [{ $match: { location: { $exists: true } } }, { $count: "locationCount" }] } }
// ]
```

* Parameters:
    * `facetSpec`: An object containing multiple pipelines to run in parallel.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.


### $project Stage

The `project()` method is used to include, exclude, or add new fields to documents in the MongoDB aggregation pipeline.

```typescript
// Example
const pipeline = MongoSense()
  .collection('users')  // Select the 'users' collection
  .project({ firstName: 1, lastName: 1, fullName: { $concat: ['$firstName', ' ', '$lastName'] } })  // Include fullName field
  .build();

console.log(pipeline);

// Output:
// [
//   { $project: { firstName: 1, lastName: 1, fullName: { $concat: ['$firstName', ' ', '$lastName'] } } }
// ]
```

* Parameters:
    * `projection`: An object specifying the fields to include, exclude, or compute.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.


### $unwind Stage

The `unwind()` method is used to deconstruct an array field into separate documents.

```typescript
// Example
const pipeline = MongoSense()
  .collection('users')  // Select the 'users' collection
  .unwind('$orders')  // Unwind the 'orders' array field
  .build();

console.log(pipeline);

// Output:
// [
//   { $unwind: "$orders" }
// ]
```

* Parameters:
    * `path`: The path to the array field to unwind.
    * `options`: Additional unwind options (optional).
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.


### $out Stage

The `out()` method is used to write the results of the pipeline to a specified collection.

```typescript
// Example
const pipeline = MongoSense()
  .collection('users')  // Select the 'users' collection
  .out('usersArchive')  // Write the output to the 'usersArchive' collection
  .build();

console.log(pipeline);

// Output:
// [
//   { $out: "usersArchive" }
// ]
```

* Parameters:
    * `collection`: The name of the collection to output the results to.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.


### $replaceRoot Stage

The `replaceRoot()` method is used to replace the root document with a new document.

```typescript
// Example
const pipeline = MongoSense()
  .collection('users')  // Select the 'users' collection
  .replaceRoot({ newRoot: "$contactInfo" })  // Replace root with the 'contactInfo' document
  .build();

console.log(pipeline);

// Output:
// [
//   { $replaceRoot: { newRoot: "$contactInfo" } }
// ]
```

* Parameters:
    * `newRoot`: The document that will replace the root.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.


### $merge Stage

The `merge()` method is used to merge the pipeline output into an existing collection.

```typescript
// Example
const pipeline = MongoSense()
  .collection('users')  // Select the 'users' collection
  .merge({
    into: "archivedUsers",
    whenMatched: "merge",
    whenNotMatched: "insert"
  })  // Merge output into the 'archivedUsers' collection
  .build();

console.log(pipeline);

// Output:
// [
//   { $merge: { into: "archivedUsers", whenMatched: "merge", whenNotMatched: "insert" } }
// ]
```

* Parameters:
    * `mergeSpec`: The merge specification.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.


### $redact Stage

The `redact()` method is used to restrict the content of documents based on some criteria.

```typescript
// Example
const pipeline = MongoSense()
  .collection('users')  // Select the 'users' collection
  .redact({
    $cond: {
      if: { $eq: ['$role', 'admin'] },
      then: "$$DESCEND",
      else: "$$PRUNE"
    }
  })  // Restrict access to admin documents
  .build();

console.log(pipeline);

// Output:
// [
//   { $redact: { $cond: { if: { $eq: ['$role', 'admin'] }, then: "$$DESCEND", else: "$$PRUNE" } } }
// ]
```

* Parameters:
    * `redactExpr`: The redact expression object.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.


### $sample Stage

The `sample()` method is used to randomly select a specified number of documents from the collection.

```typescript
// Example
const pipeline = MongoSense()
  .collection('users')  // Select the 'users' collection
  .sample(10)  // Randomly select 10 documents
  .build();

console.log(pipeline);

// Output:
// [
//   { $sample: { size: 10 } }
// ]
```

* Parameters:
    * `size`: The number of documents to randomly select.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.


### Conditional Query Construction

MongoSense allows for dynamic and flexible query building with conditional stages. You can add stages like `$match`, `$sort`, `$limit`, `$skip`, `$lookup`, `$group`, `$addFields`, `$bucket`, `$bucketAuto`, `$count`, `$facet`, `$project`, `$unwind`, `$out`, `$replaceRoot`, `$merge`, `$redact`, and `$sample` only if the input is provided. If `null` or `undefined` is passed, the stage is skipped.

```typescript
// Example:
const pipeline = MongoSense()
  .collection('users')
  .match({ isActive: true })  // Add $match stage if criteria is provided
  .sort(null)  // Skip $sort stage if no sorting is needed
  .limit(10)  // Add $limit stage if provided
  .addFields(null)  // Skip $addFields stage if no fields are provided
  .sample(10)  // Add $sample stage if size is provided
  .build();

console.log(pipeline);
// Output:
// [
//   { $match: { isActive: true } },
//   { $limit: 10 },
//   { $sample: { size: 10 } }
// ]
```

* Conditional Stages:
    * If you pass `null` or `undefined` to any method, the corresponding stage will be skipped.
* Supported Stages:
    * `$match`, `$sort`, `$limit`, `$skip`, `$lookup`, `$group`, `$addFields`, `$bucket`, `$bucketAuto`, `$count`, `$facet`, `$project`, `$unwind`, `$out`, `$replaceRoot`, `$merge`, `$redact`, and `$sample`.
* Returns: The instance of the MongoSenseQueryBuilder for method chaining.

## Contributing
We welcome contributions! If you find a bug or have a feature request, please open an issue. Pull requests are also welcome.

To contribute:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a pull request

## License
This repository is licensed under the **MIT License**. See the [LICENSE](./LICENSE.md) file for more details.

### Additional License Considerations:
- **Open Source Licensing**: Your project is under the **MIT License**, which is one of the most permissive open-source licenses. It allows others to freely use, modify, and distribute your code as long as they include the original license and copyright notice.
- **Attribution**: The only requirement is attribution, meaning users must keep your copyright notice and the license terms in any distributed version of your code.
- **Warranty Disclaimer**: The license disclaims any warranties, protecting you from legal liability if the software doesn’t work as intended.