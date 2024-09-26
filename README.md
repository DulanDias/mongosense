


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