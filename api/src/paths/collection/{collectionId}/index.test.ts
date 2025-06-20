import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { createSubcollection, deleteCollection, getCollectionById, updateCollection } from '.';
import * as db from '../../../database/db';
import { Collection, IPostCollectionRequest } from '../../../models/collection';
import { CollectionService } from '../../../services/collection-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';

chai.use(sinonChai);

describe('collection/{collectionId}/index', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getCollectionById', () => {
    it('returns collection data', async () => {
      const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });
      const mockCollection: Collection = {
        collection_id: 1,
        name: 'Test Collection',
        description: '',
        parent_collection_id: null,
        participants: [],
        subcollections: []
      };

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      sinon.stub(CollectionService.prototype, 'getCollectionById').resolves(mockCollection);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = { collectionId: '1' };

      const requestHandler = getCollectionById();
      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).to.have.been.calledWith(200);
      expect(mockRes.json).to.have.been.calledWith(mockCollection);
    });

    it('catches and re-throws error in getCollectionById', async () => {
      const mockDBConnection = getMockDBConnection({
        open: sinon.stub(),
        rollback: sinon.stub(),
        release: sinon.stub()
      });

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      sinon.stub(CollectionService.prototype, 'getCollectionById').rejects(new Error('get error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = { collectionId: '1' };

      const requestHandler = getCollectionById();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (err) {
        expect(mockDBConnection.rollback).to.have.been.calledOnce;
        expect(mockDBConnection.release).to.have.been.calledOnce;
        expect((err as Error).message).to.equal('get error');
      }
    });
  });

  describe('updateCollection', () => {
    it('updates the collection and returns 204', async () => {
      const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      sinon.stub(CollectionService.prototype, 'updateCollection').resolves();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = { collectionId: '1' };
      mockReq.body = {
        name: 'Updated Name',
        description: 'Updated description'
      } as IPostCollectionRequest;

      const requestHandler = updateCollection();
      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).to.have.been.calledWith(204);
      expect(mockRes.json).to.have.been.called;
    });

    it('catches and re-throws error in UpdateCollection', async () => {
      const mockDBConnection = getMockDBConnection({
        open: sinon.stub(),
        rollback: sinon.stub(),
        release: sinon.stub()
      });

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      sinon.stub(CollectionService.prototype, 'updateCollection').rejects(new Error('update error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = { collectionId: '1' };
      mockReq.body = { name: 'fail test', description: '' };

      const requestHandler = updateCollection();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (err) {
        expect(mockDBConnection.rollback).to.have.been.calledOnce;
        expect(mockDBConnection.release).to.have.been.calledOnce;
        expect((err as Error).message).to.equal('update error');
      }
    });
  });

  describe('createSubcollection', () => {
    it('creates a subcollection and returns 201', async () => {
      const mockDBConnection = getMockDBConnection({
        open: sinon.stub(),
        commit: sinon.stub(),
        systemUserId: () => 123
      });

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      sinon.stub(CollectionService.prototype, 'createCollection').resolves();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = { collectionId: '5' };
      mockReq.body = { name: 'New Subcollection' };

      const requestHandler = createSubcollection();
      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).to.have.been.calledWith(201);
      expect(mockRes.json).to.have.been.called;
    });

    it('catches and re-throws error in createSubcollection', async () => {
      const mockDBConnection = getMockDBConnection({
        open: sinon.stub(),
        rollback: sinon.stub(),
        release: sinon.stub(),
        systemUserId: () => 1
      });

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      sinon.stub(CollectionService.prototype, 'createCollection').rejects(new Error('create error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = { collectionId: '5' };
      mockReq.body = { name: 'should fail' };

      const requestHandler = createSubcollection();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (err) {
        expect(mockDBConnection.rollback).to.have.been.calledOnce;
        expect(mockDBConnection.release).to.have.been.calledOnce;
        expect((err as Error).message).to.equal('create error');
      }
    });
  });

  describe('deleteCollection', () => {
    it('deletes the collection and returns 200', async () => {
      const mockDBConnection = getMockDBConnection({
        open: sinon.stub(),
        commit: sinon.stub(),
        rollback: sinon.stub()
      });

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      sinon.stub(CollectionService.prototype, 'deleteCollection').resolves();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = { collectionId: '10' };

      const requestHandler = deleteCollection();
      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).to.have.been.calledWith(200);
      expect(mockRes.send).to.have.been.called;
    });

    it('catches and re-throws error in deleteCollection', async () => {
      const mockDBConnection = getMockDBConnection({
        open: sinon.stub(),
        rollback: sinon.stub(),
        release: sinon.stub()
      });

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      sinon.stub(CollectionService.prototype, 'deleteCollection').rejects(new Error('delete error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = { collectionId: '10' };

      const requestHandler = deleteCollection();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (err) {
        expect(mockDBConnection.rollback).to.have.been.calledOnce;
        expect(mockDBConnection.release).to.have.been.calledOnce;
        expect((err as Error).message).to.equal('delete error');
      }
    });
  });
});
