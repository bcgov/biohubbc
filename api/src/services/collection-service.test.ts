import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { CollectionService } from './collection-service';

chai.use(sinonChai);

describe('CollectionService', () => {
  let dbConnection: any;
  let service: CollectionService;

  beforeEach(() => {
    dbConnection = getMockDBConnection();
    sinon.stub(dbConnection, 'sql');
    service = new CollectionService();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should fetch all collections', async () => {
    const mockResponse = [{ collection_id: 1, name: 'Test', objectives: 'Test objectives' }];
    (dbConnection.sql as sinon.SinonStub).resolves({ rows: mockResponse });

    const result = await service.getAllCollections(dbConnection);

    expect(result).to.eql(mockResponse);
    expect(dbConnection.sql).to.have.been.calledOnce;
  });

  it('should create a new collection', async () => {
    const mockResponse = { collection_id: 1, name: 'New Collection', objectives: 'New Objectives' };
    (dbConnection.sql as sinon.SinonStub).resolves({ rows: [mockResponse] });

    const result = await service.createCollection(dbConnection, { name: 'New Collection', objectives: 'New Objectives' });

    expect(result).to.eql(mockResponse);
    expect(dbConnection.sql).to.have.been.calledOnce;
  });

  it('should fetch a collection by ID', async () => {
    const mockResponse = { collection_id: 1, name: 'Test', objectives: 'Test objectives' };
    (dbConnection.sql as sinon.SinonStub).resolves({ rows: [mockResponse] });

    const result = await service.getCollectionById(dbConnection, 1);

    expect(result).to.eql(mockResponse);
    expect(dbConnection.sql).to.have.been.calledOnce;
  });

  it('should update a collection by ID', async () => {
    const mockResponse = { collection_id: 1, name: 'Updated Name', objectives: 'Updated Objectives' };
    (dbConnection.sql as sinon.SinonStub).resolves({ rows: [mockResponse] });

    const result = await service.updateCollection(dbConnection, 1, { name: 'Updated Name', objectives: 'Updated Objectives' });

    expect(result).to.eql(mockResponse);
    expect(dbConnection.sql).to.have.been.calledOnce;
  });

  it('should delete a collection by ID', async () => {
    (dbConnection.sql as sinon.SinonStub).resolves({ rowCount: 1 });

    const result = await service.deleteCollection(dbConnection, 1);

    expect(result).to.be.true;
    expect(dbConnection.sql).to.have.been.calledOnce;
  });

  it('should return false when deleting a non-existent collection', async () => {
    (dbConnection.sql as sinon.SinonStub).resolves({ rowCount: 0 });

    const result = await service.deleteCollection(dbConnection, 999);

    expect(result).to.be.false;
    expect(dbConnection.sql).to.have.been.calledOnce;
  });
});