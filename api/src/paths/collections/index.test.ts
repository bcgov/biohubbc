import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Request, Response } from 'express';
import * as db from '../../database/db';
import * as collectionService from '../../services/collection-service';
import * as index from './index';

chai.use(sinonChai);

describe('Collections API', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockDBConnection: any;

  beforeEach(() => {
    req = {};
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    mockDBConnection = {
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub(),
    };

    sinon.stub(db, 'getAPIUserDBConnection').returns(mockDBConnection);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('GET /api/collection', () => {
    it('should fetch all collections and return 200', async () => {
      const mockCollections = [{ collection_id: 1, name: 'Test', objectives: 'Test objectives' }];
      sinon.stub(collectionService.CollectionService.prototype, 'getAllCollections').resolves(mockCollections);

      await index.GET(req as Request, res as Response);

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.commit).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith(mockCollections);
    });

    it('should handle errors and return 500', async () => {
      sinon.stub(collectionService.CollectionService.prototype, 'getAllCollections').throws(new Error('Test error'));

      await index.GET(req as Request, res as Response);

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith({ error: 'Failed to fetch collections' });
    });
  });

  describe('POST /api/collection', () => {
    it('should create a new collection and return 201', async () => {
      req.body = { name: 'New Collection', objectives: 'New Objectives' };
      const mockCollection = { collection_id: 1, name: 'New Collection', objectives: 'New Objectives' };
      sinon.stub(collectionService.CollectionService.prototype, 'createCollection').resolves(mockCollection);

      await index.POST(req as Request, res as Response);

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.commit).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(201);
      expect(res.json).to.have.been.calledWith(mockCollection);
    });

    it('should handle errors and return 500', async () => {
      req.body = { name: 'New Collection', objectives: 'New Objectives' };
      sinon.stub(collectionService.CollectionService.prototype, 'createCollection').throws(new Error('Test error'));

      await index.POST(req as Request, res as Response);

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith({ error: 'Failed to create collection' });
    });
  });

  describe('GET /api/collection/:collection_id', () => {
    it('should fetch a collection by ID and return 200', async () => {
      req.params = { collection_id: '1' };
      const mockCollection = { collection_id: 1, name: 'Test', objectives: 'Test objectives' };
      sinon.stub(collectionService.CollectionService.prototype, 'getCollectionById').resolves(mockCollection);

      await index.GET_BY_ID(req as Request, res as Response);

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.commit).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith(mockCollection);
    });

    it('should handle errors and return 500', async () => {
      req.params = { collection_id: '1' };
      sinon.stub(collectionService.CollectionService.prototype, 'getCollectionById').throws(new Error('Test error'));

      await index.GET_BY_ID(req as Request, res as Response);

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith({ error: 'Failed to fetch collection' });
    });
  });

  describe('PUT /api/collection/:collection_id', () => {
    it('should update a collection and return 200', async () => {
      req.params = { collection_id: '1' };
      req.body = { name: 'Updated Name', objectives: 'Updated Objectives' };
      const mockUpdatedCollection = { collection_id: 1, name: 'Updated Name', objectives: 'Updated Objectives' };
      sinon.stub(collectionService.CollectionService.prototype, 'updateCollection').resolves(mockUpdatedCollection);

      await index.PUT(req as Request, res as Response);

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.commit).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith(mockUpdatedCollection);
    });

    it('should handle errors and return 500', async () => {
      req.params = { collection_id: '1' };
      req.body = { name: 'Updated Name', objectives: 'Updated Objectives' };
      sinon.stub(collectionService.CollectionService.prototype, 'updateCollection').throws(new Error('Test error'));

      await index.PUT(req as Request, res as Response);

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith({ error: 'Failed to update collection' });
    });
  });

  describe('DELETE /api/collection/:collection_id', () => {
    it('should delete a collection and return 204', async () => {
      req.params = { collection_id: '1' };
      sinon.stub(collectionService.CollectionService.prototype, 'deleteCollection').resolves(true);

      await index.DELETE(req as Request, res as Response);

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.commit).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(204);
      expect(res.json).to.not.have.been.called;
    });

    it('should handle errors and return 500', async () => {
      req.params = { collection_id: '1' };
      sinon.stub(collectionService.CollectionService.prototype, 'deleteCollection').throws(new Error('Test error'));

      await index.DELETE(req as Request, res as Response);

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith({ error: 'Failed to delete collection' });
    });
  });
});