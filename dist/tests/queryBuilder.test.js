import { MongoSense } from '../src/queryBuilder.js';
import { IntelliOptimizer } from '../src/intelli.js';
import { expect } from 'chai';
import sinon from 'sinon';
import { MongoClient } from 'mongodb';
describe('MongoSense Collection Selector', () => {
    // Test single collection
    it('should allow setting a single collection name', () => {
        const builder = MongoSense().collection('users'); // Set collection to 'users'
        expect(builder).to.have.property('collectionNames').that.includes('users');
    });
    // Test multiple collections
    it('should allow setting multiple collection names', () => {
        const builder = MongoSense().collection('users', 'orders'); // Set multiple collections
        expect(builder).to.have.property('collectionNames').that.includes('users');
        expect(builder).to.have.property('collectionNames').that.includes('orders');
    });
    // Test chaining after setting collection
    it('should allow chaining after setting collection', () => {
        const result = MongoSense().collection('users').build(); // Chain and build query
        expect(result.pipeline).to.be.an('array').that.is.empty; // The pipeline is still empty
        expect(result.collections).to.include('users'); // Verify the collection name
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
        const builder = MongoSense().sort({ age: 1 }); // Sort by age in ascending order
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
            .sort({ age: -1 }); // Sort by age in descending order
        const result = builder.build();
        expect(result.pipeline).to.deep.equal([
            { $match: { isActive: true } },
            { $sort: { age: -1 } }
        ]);
        expect(result.collections).to.deep.equal(['users']);
    });
    it('should add a $limit stage to the pipeline', () => {
        const builder = MongoSense().limit(10); // Limit to 10 documents
        const result = builder.build();
        expect(result.pipeline).to.deep.equal([
            { $limit: 10 }
        ]);
        expect(result.collections).to.be.an('array').that.is.empty;
    });
    it('should add a $skip stage to the pipeline', () => {
        const builder = MongoSense().skip(20); // Skip 20 documents
        const result = builder.build();
        expect(result.pipeline).to.deep.equal([
            { $skip: 20 }
        ]);
        expect(result.collections).to.be.an('array').that.is.empty;
    });
    it('should implement pagination with $skip and $limit stages', () => {
        const pageSize = 10;
        const pageNumber = 3; // For page 3
        const skip = (pageNumber - 1) * pageSize;
        const builder = MongoSense()
            .skip(skip)
            .limit(pageSize);
        const result = builder.build();
        expect(result.pipeline).to.deep.equal([
            { $skip: 20 }, // For page 3 (skipping 20 documents)
            { $limit: 10 } // Limit to 10 documents
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
    it('should add a $group stage to the pipeline with $sum aggregation', () => {
        const builder = MongoSense().group({ category: "$category" }, { totalSales: { $sum: "$amount" } });
        const result = builder.build();
        expect(result.pipeline).to.deep.equal([
            {
                $group: {
                    _id: { category: "$category" },
                    totalSales: { $sum: "$amount" }
                }
            }
        ]);
        expect(result.collections).to.be.an('array').that.is.empty;
    });
    it('should add a $group stage with $avg aggregation', () => {
        const builder = MongoSense().group({ category: "$category" }, { avgPrice: { $avg: "$price" } });
        const result = builder.build();
        expect(result.pipeline).to.deep.equal([
            {
                $group: {
                    _id: { category: "$category" },
                    avgPrice: { $avg: "$price" }
                }
            }
        ]);
        expect(result.collections).to.be.an('array').that.is.empty;
    });
    // Test chaining $match, $sort, and $group
    it('should allow chaining $match, $sort, and $group stages', () => {
        const builder = MongoSense()
            .collection('sales')
            .match({ isActive: true })
            .sort({ date: 1 })
            .group({ category: "$category" }, { totalSales: { $sum: "$amount" } });
        const result = builder.build();
        expect(result.pipeline).to.deep.equal([
            { $match: { isActive: true } },
            { $sort: { date: 1 } },
            {
                $group: {
                    _id: { category: "$category" },
                    totalSales: { $sum: "$amount" }
                }
            }
        ]);
        expect(result.collections).to.deep.equal(['sales']);
    });
    it('should skip $match stage if criteria is null', () => {
        const builder = MongoSense().match(null);
        const result = builder.build();
        expect(result.pipeline).to.deep.equal([]);
    });
    it('should add $match stage if criteria is provided', () => {
        const builder = MongoSense().match({ isActive: true });
        const result = builder.build();
        expect(result.pipeline).to.deep.equal([
            { $match: { isActive: true } }
        ]);
    });
    it('should skip $sort stage if sortCriteria is null', () => {
        const builder = MongoSense().sort(null);
        const result = builder.build();
        expect(result.pipeline).to.deep.equal([]);
    });
    it('should add $sort stage if sortCriteria is provided', () => {
        const builder = MongoSense().sort({ age: 1 });
        const result = builder.build();
        expect(result.pipeline).to.deep.equal([
            { $sort: { age: 1 } }
        ]);
    });
    it('should allow conditional $match, $sort, and $limit stages', () => {
        const builder = MongoSense()
            .match({ isActive: true }) // Add $match
            .sort(null) // Skip $sort
            .limit(10); // Add $limit
        const result = builder.build();
        expect(result.pipeline).to.deep.equal([
            { $match: { isActive: true } },
            { $limit: 10 }
        ]);
    });
    it('should log actions when debugMode is true', () => {
        const builder = MongoSense(true) // Enable debugMode
            .collection('users')
            .match({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(10);
        const logs = builder.viewLogs();
        expect(logs).to.be.an('array').that.is.not.empty;
        expect(logs[0]).to.contain('Selected collections: users');
    });
    it('should not log actions when debugMode is false', () => {
        const builder = MongoSense(false) // Disable debugMode
            .collection('users')
            .match({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(10);
        const logs = builder.viewLogs();
        expect(logs).to.be.an('array').that.is.empty;
    });
    it('should add stages only when parameters are provided', () => {
        const builder = MongoSense(true)
            .match({ isActive: true }) // Should be added
            .addFields(null) // Should be skipped
            .project({ firstName: 1 }) // Should be added
            .unwind(null) // Should be skipped
            .sample(10); // Should be added
        const result = builder.build();
        expect(result.pipeline).to.deep.equal([
            { $match: { isActive: true } },
            { $project: { firstName: 1 } },
            { $sample: { size: 10 } }
        ]);
    });
    let mockClient;
    let mockDb;
    let optimizer;
    let builder;
    beforeEach(() => {
        mockClient = sinon.createStubInstance(MongoClient);
        mockDb = {
            collection: sinon.stub().returns({
                indexStats: sinon.stub().returns({ toArray: sinon.stub().resolves([{ key: { isActive: 1 } }]) }),
                createIndex: sinon.stub().resolves('createdIndex')
            }),
            command: sinon.stub().resolves({ collStats: {} })
        };
        mockClient.db = sinon.stub().returns(mockDb);
        optimizer = new IntelliOptimizer(mockClient);
        builder = MongoSense(true, optimizer);
    });
    it('should optimize the pipeline by reordering stages', async () => {
        builder.collection('users')
            .match({ isActive: true })
            .sort({ createdAt: -1 });
        await builder.optimize();
        const pipeline = builder.build().pipeline;
        // Ensure that $match is followed by $sort
        expect(pipeline[0]).to.have.property('$match');
        expect(pipeline[1]).to.have.property('$sort');
    });
    it('should create recommended indexes', async () => {
        builder.collection('users')
            .match({ isActive: true })
            .sort({ createdAt: -1 });
        await builder.optimize();
        const createdIndexes = await builder.createIndexes();
        expect(createdIndexes).to.not.be.empty;
    });
    afterEach(() => {
        sinon.restore();
    });
});
