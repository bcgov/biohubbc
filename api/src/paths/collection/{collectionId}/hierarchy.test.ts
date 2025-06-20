import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { CollectionService } from '../../../services/collection-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import { getCollectionParentsById } from './hierarchy';

chai.use(sinonChai);

describe('getCollectionParentsById', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns collection hierarchy as expected', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub()
    });

    const mockHierarchy = {
      collection_id: 1,
      name: 'Test Collection',
      description: '',
      parent_collection_id: null,
      participants: [],
      subcollections: [
        {
          collection_id: 2,
          name: 'Test Collection',
          description: '',
          parent_collection_id: null,
          participants: [],
          subcollections: []
        }
      ]
    };

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(CollectionService.prototype, 'getCollectionParentsById').resolves(mockHierarchy);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = { collectionId: '2' };

    const requestHandler = getCollectionParentsById();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledWith({ hierarchy: mockHierarchy });
    expect(mockDBConnection.commit).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(CollectionService.prototype, 'getCollectionParentsById').rejects(new Error('test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = { collectionId: '999' };

    const requestHandler = getCollectionParentsById();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (err) {
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect((err as Error).message).to.equal('test error');
    }
  });
});
