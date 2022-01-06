import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/custom-error';
import project_queries from '../../../../../../queries/project';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import * as update_project_metadata from './update';

chai.use(sinonChai);

describe('updates metadata for a project report', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '',
      attachmentId: '1'
    };
    mockReq.body = {
      attachment_type: 'Report',
      revision_count: 1,
      attachment_meta: {
        title: 'My report',
        year_published: 2000,
        description: 'report abstract',
        authors: [
          {
            first_name: 'John',
            last_name: 'Smith'
          }
        ]
      }
    };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const requestHandler = update_project_metadata.updateProjectAttachmentMetadata();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should throw a 400 error when no attachmentId is provided', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      attachmentId: ''
    };
    mockReq.body = {
      attachment_type: 'Report',
      revision_count: 1,
      attachment_meta: {
        title: 'My report',
        year_published: 2000,
        description: 'report abstract',
        authors: [
          {
            first_name: 'John',
            last_name: 'Smith'
          }
        ]
      }
    };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const requestHandler = update_project_metadata.updateProjectAttachmentMetadata();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `attachmentId`');
    }
  });

  it('should throw a 400 error when attachment_type is invalid', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      attachmentId: '1'
    };
    mockReq.body = {
      attachment_type: 'notAReport',
      revision_count: 1,
      attachment_meta: {
        title: 'My report',
        year_published: 2000,
        description: 'report abstract',
        authors: [
          {
            first_name: 'John',
            last_name: 'Smith'
          }
        ]
      }
    };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const requestHandler = update_project_metadata.updateProjectAttachmentMetadata();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Invalid body param `attachment_type`');
    }
  });

  it('should update a project report metadata, on success', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      attachmentId: '1'
    };
    mockReq.body = {
      attachment_type: 'Report',
      revision_count: 1,
      attachment_meta: {
        title: 'My report',
        year_published: 2000,
        description: 'report abstract',
        authors: [
          {
            first_name: 'John',
            last_name: 'Smith'
          }
        ]
      }
    };

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rowCount: 1,
      rows: [{ id: 1 }]
    });
    mockQuery.onCall(1).resolves({
      rowCount: 1,
      rows: [{ id: 1 }]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    const requestHandler = update_project_metadata.updateProjectAttachmentMetadata();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
  });

  it('should throw a 400 error when updateProjectReportAttachmentMetadataSQL returns null', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      attachmentId: '1'
    };
    mockReq.body = {
      attachment_type: 'Report',
      revision_count: 1,
      attachment_meta: {
        title: 'My report',
        year_published: 2000,
        description: 'report abstract',
        authors: [
          {
            first_name: 'John',
            last_name: 'Smith'
          }
        ]
      }
    };

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rowCount: 1,
      rows: [{ id: 1 }]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    sinon.stub(project_queries, 'updateProjectReportAttachmentMetadataSQL').returns(null);

    const requestHandler = update_project_metadata.updateProjectAttachmentMetadata();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL update attachment report statement');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });

  it('should throw a 400 error when the response is null', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      attachmentId: '1'
    };
    mockReq.body = {
      attachment_type: 'Report',
      revision_count: 1,
      attachment_meta: {
        title: 'My report',
        year_published: 2000,
        description: 'report abstract',
        authors: [
          {
            first_name: 'John',
            last_name: 'Smith'
          }
        ]
      }
    };

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rowCount: null
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    sinon.stub(project_queries, 'updateProjectReportAttachmentMetadataSQL').returns(SQL`something`);

    const requestHandler = update_project_metadata.updateProjectAttachmentMetadata();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to update attachment report record');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });
});
