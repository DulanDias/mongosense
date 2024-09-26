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
});
