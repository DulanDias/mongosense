import { expect } from 'chai';
import { MongoClient } from 'mongodb';
import { IntelliOptimizer } from '../src/intelli.js';
import sinon from 'sinon';

describe('IntelliOptimizer', () => {
  let mockDb: any;
  let mockClient: MongoClient;
  let optimizer: IntelliOptimizer;

  beforeEach(() => {
    // Mock the MongoDB connection and methods
    mockClient = sinon.createStubInstance(MongoClient);
    mockDb = {
      command: sinon.stub(),
      collection: sinon.stub().returns({
        indexStats: sinon.stub().returns({ toArray: sinon.stub().resolves([{ key: { isActive: 1 } }]) }),
        createIndex: sinon.stub().resolves('createdIndex')
      })
    };
    mockClient.db = sinon.stub().returns(mockDb);
    optimizer = new IntelliOptimizer(mockClient);
  });

  it('should recommend indexes based on missing fields', async () => {
    const recommendations = await optimizer.analyzeAndRecommendIndexes('users', ['isActive', 'createdAt']);
    expect(recommendations).to.include('createdAt');
    expect(recommendations).to.not.include('isActive');
  });

  it('should create indexes for recommended fields', async () => {
    const createdIndexes = await optimizer.createIndexes('users', ['createdAt']);
    expect(createdIndexes).to.deep.equal(['createdIndex']);
  });

  afterEach(() => {
    sinon.restore();  // Clean up all stubs
  });
});
