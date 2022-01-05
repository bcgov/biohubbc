import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as delete_attachment from './delete';
import * as db from '../../../../../database/db';
import project_queries from '../../../../../queries/project';
import security_queries from '../../../../../queries/security';
import SQL from 'sql-template-strings';
import * as file_utils from '../../../../../utils/file-utils';
import { DeleteObjectOutput } from 'aws-sdk/clients/s3';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import { HTTPError } from '../../../../../errors/custom-error';

chai.use(sinonChai);

describe('deleteAttachment', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      attachmentId: 2
    },
    body: {
      attachmentType: 'Image',
      securityToken: 'token'
    }
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        },
        send: () => {
          // do nothing
        }
      };
    }
  };

  it('should throw an error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_attachment.deleteAttachment();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should throw an error when attachmentId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_attachment.deleteAttachment();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, attachmentId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `attachmentId`');
    }
  });

  it('should throw an error when attachmentType is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_attachment.deleteAttachment();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, attachmentType: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required body param `attachmentType`');
    }
  });

  it('should throw a 400 error when no sql statement returned for unsecureAttachmentRecordSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(security_queries, 'unsecureAttachmentRecordSQL').returns(null);

    try {
      const result = delete_attachment.deleteAttachment();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL unsecure record statement');
    }
  });

  it('should throw a 400 error when fails to unsecure attachment record', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({ rowCount: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(security_queries, 'unsecureAttachmentRecordSQL').returns(SQL`something`);

    try {
      const result = delete_attachment.deleteAttachment();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to unsecure record');
    }
  });

  it('should throw a 400 error when no sql statement returned for deleteProjectAttachmentSQL', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(security_queries, 'unsecureAttachmentRecordSQL').returns(SQL`something`);
    sinon.stub(project_queries, 'deleteProjectAttachmentSQL').returns(null);

    try {
      const result = delete_attachment.deleteAttachment();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete project attachment statement');
    }
  });

  it('should return null when deleting file from S3 fails', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({ rowCount: 1 })
      .onSecondCall()
      .resolves({ rowCount: 1, rows: [{ key: 's3Key' }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(security_queries, 'unsecureAttachmentRecordSQL').returns(SQL`something`);
    sinon.stub(project_queries, 'deleteProjectAttachmentSQL').returns(SQL`some query`);
    sinon.stub(file_utils, 'deleteFileFromS3').resolves(null);

    const result = delete_attachment.deleteAttachment();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(null);
  });

  it('should return null response on success when type is not Report', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({ rowCount: 1 })
      .onSecondCall()
      .resolves({ rows: [{ key: 's3Key' }], rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(security_queries, 'unsecureAttachmentRecordSQL').returns(SQL`something`);
    sinon.stub(project_queries, 'deleteProjectAttachmentSQL').returns(SQL`some query`);
    sinon.stub(file_utils, 'deleteFileFromS3').resolves('non null response' as DeleteObjectOutput);

    const result = delete_attachment.deleteAttachment();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(null);
  });

  it('should return null response on success when type is Report', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({ rowCount: 1 })
      .onSecondCall()
      .resolves({ rowCount: 1 })
      .onThirdCall()
      .resolves({ rows: [{ key: 's3Key' }], rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(security_queries, 'unsecureAttachmentRecordSQL').returns(SQL`something`);
    sinon.stub(project_queries, 'deleteProjectReportAttachmentSQL').returns(SQL`some query`);
    sinon.stub(file_utils, 'deleteFileFromS3').resolves('non null response' as DeleteObjectOutput);

    const result = delete_attachment.deleteAttachment();

    await result(
      { ...sampleReq, body: { ...sampleReq.body, attachmentType: 'Report' } },
      sampleRes as any,
      (null as unknown) as any
    );

    expect(actualResult).to.equal(null);
  });
});
