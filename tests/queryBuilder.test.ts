import { MongoSense } from '../src/queryBuilder.js'; 
import { expect } from 'chai';

describe('MongoSense Collection Selector', () => {
  
  // Test single collection
  it('should allow setting a single collection name', () => {
    const builder = MongoSense().collection('users');  // Set collection to 'users'
    expect(builder).to.have.property('collectionNames').that.includes('users');
  });

  // Test multiple collections
  it('should allow setting multiple collection names', () => {
    const builder = MongoSense().collection('users', 'orders');  // Set multiple collections
    expect(builder).to.have.property('collectionNames').that.includes('users');
    expect(builder).to.have.property('collectionNames').that.includes('orders');
  });

  // Test chaining after setting collection
  it('should allow chaining after setting collection', () => {
    const result = MongoSense().collection('users').build();  // Chain and build query
    expect(result.pipeline).to.be.an('array').that.is.empty;  // The pipeline is still empty
    expect(result.collections).to.include('users');  // Verify the collection name
  });

  // Test for $match functionality
  it('should add a $match stage to the pipeline', () => {
    const builder = MongoSense().match({ isActive: true });
    const result = builder.build();

    // Check if the result contains the correct $match stage in the pipeline
    expect(result.pipeline).to.deep.equal([
      { $match: { isActive: true } }
    ]);

    // Check if collections are empty (since no collection is specified)
    expect(result.collections).to.be.an('array').that.is.empty;
  });

  // Test for chaining after $match
  it('should allow chaining after $match', () => {
    const builder = MongoSense()
      .collection('users')
      .match({ isActive: true });

    const result = builder.build();

    // Check if the result contains the correct $match stage in the pipeline
    expect(result.pipeline).to.deep.equal([
      { $match: { isActive: true } }
    ]);

    // Check if collections contains 'users'
    expect(result.collections).to.deep.equal(['users']);
  });

  // Test for $sort functionality
  it('should add a $sort stage to the pipeline', () => {
    const builder = MongoSense().sort({ age: 1 });  // Sort by age in ascending order
    const result = builder.build();

    expect(result.pipeline).to.deep.equal([
      { $sort: { age: 1 } }
    ]);
    expect(result.collections).to.be.an('array').that.is.empty;
  });

  // Test for chaining $match and $sort
  it('should allow chaining $match and $sort stages', () => {
    const builder = MongoSense()
      .collection('users')
      .match({ isActive: true })
      .sort({ age: -1 });  // Sort by age in descending order

    const result = builder.build();

    expect(result.pipeline).to.deep.equal([
      { $match: { isActive: true } },
      { $sort: { age: -1 } }
    ]);
    expect(result.collections).to.deep.equal(['users']);
  });

  it('should add a $limit stage to the pipeline', () => {
    const builder = MongoSense().limit(10);  // Limit to 10 documents
    const result = builder.build();

    expect(result.pipeline).to.deep.equal([
      { $limit: 10 }
    ]);
    expect(result.collections).to.be.an('array').that.is.empty;
  });

  it('should add a $skip stage to the pipeline', () => {
    const builder = MongoSense().skip(20);  // Skip 20 documents
    const result = builder.build();

    expect(result.pipeline).to.deep.equal([
      { $skip: 20 }
    ]);
    expect(result.collections).to.be.an('array').that.is.empty;
  });

  it('should implement pagination with $skip and $limit stages', () => {
    const pageSize = 10;
    const pageNumber = 3;  // For page 3
    const skip = (pageNumber - 1) * pageSize;

    const builder = MongoSense()
      .skip(skip)
      .limit(pageSize);

    const result = builder.build();

    expect(result.pipeline).to.deep.equal([
      { $skip: 20 },  // For page 3 (skipping 20 documents)
      { $limit: 10 }  // Limit to 10 documents
    ]);
    expect(result.collections).to.be.an('array').that.is.empty;
  });

  it('should add a $lookup stage to the pipeline', () => {
    const builder = MongoSense().lookup('orders', '_id', 'userId', 'userOrders');
    const result = builder.build();

    expect(result.pipeline).to.deep.equal([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'userOrders'
        }
      }
    ]);
    expect(result.collections).to.be.an('array').that.is.empty;
  });

  // Test chaining $match and $lookup
  it('should allow chaining $match and $lookup stages', () => {
    const builder = MongoSense()
      .collection('users')
      .match({ isActive: true })
      .lookup('orders', '_id', 'userId', 'userOrders');

    const result = builder.build();

    expect(result.pipeline).to.deep.equal([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'userOrders'
        }
      }
    ]);
    expect(result.collections).to.deep.equal(['users']);
  });


});
