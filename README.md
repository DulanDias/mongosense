


### MongoSense - Collection Selector

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