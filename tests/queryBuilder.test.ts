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
});
