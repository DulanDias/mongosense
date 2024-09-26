


### Collection Selector

The `collection` method allows you to specify one or more MongoDB collections that the query will target. This is useful for operations like `$lookup` or for multi-collection queries.

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