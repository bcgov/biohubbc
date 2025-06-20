import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { createCollection, findCollections } from '.';
import { SYSTEM_ROLE } from '../../constants/roles';
import * as db from '../../database/db';
import { CollectionService } from '../../services/collection-service';
import { getSystemUserFromRequest } from '../../utils/request';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';

chai.use(sinonChai);

describe('findCollections', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns paginated collections', async () => {
    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(CollectionService.prototype, 'findCollections').resolves([
      {
        collection_id: 2,
        name: 'Test Collection',
        description: '',
        parent_collection_id: null,
        participants: [],
        subcollections: []
      }
    ]);
    sinon.stub(CollectionService.prototype, 'findCollectionsCount').resolves(1);
    sinon.stub(getSystemUserFromRequest as any).returns({ role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.query = {};

    const requestHandler = findCollections();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledWithMatch({
      collections: [{ collection_id: 1 }],
      pagination: { page: 1, limit: 25, total: 1 }
    });
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(CollectionService.prototype, 'findCollections').rejects(new Error('fail'));
    sinon.stub(CollectionService.prototype, 'findCollectionsCount').resolves(0);
    sinon.stub(getSystemUserFromRequest as any).returns({ role_names: [] });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.query = {};

    const requestHandler = findCollections();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (err) {
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect((err as Error).message).to.equal('fail');
    }
  });
});

describe('createCollection', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('creates a collection successfully', async () => {
    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(CollectionService.prototype, 'createCollection').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.body = { name: 'My Collection' };

    const requestHandler = createCollection();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(201);
    expect(mockRes.json).to.have.been.calledWith();
    expect(mockDBConnection.commit).to.have.been.calledOnce;
  });

  it('handles createCollection error and rolls back', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(CollectionService.prototype, 'createCollection').rejects(new Error('creation failed'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.body = { name: 'Bad Collection' };

    const requestHandler = createCollection();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (err) {
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect((err as Error).message).to.equal('creation failed');
    }
  });
});
