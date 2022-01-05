import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as get_signed_url from './getSignedUrl';
import * as db from '../../../../../database/db';
import project_queries from '../../../../../queries/project';
import SQL from 'sql-template-strings';
import * as file_utils from '../../../../../utils/file-utils';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import { HTTPError } from '../../../../../errors/custom-error';
import { ATTACHMENT_TYPE } from '../../../../../constants/attachments';

chai.use(sinonChai);

describe('getProjectAttachmentSignedURL', () => {
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
    query: {
      attachmentType: 'Other'
    }
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  it('should throw an error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = get_signed_url.getProjectAttachmentSignedURL();

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
      const result = get_signed_url.getProjectAttachmentSignedURL();

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

  it('should return null when getting signed url from S3 fails', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ key: 's3Key' }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_queries, 'getProjectAttachmentS3KeySQL').returns(SQL`some query`);
    sinon.stub(file_utils, 'getS3SignedURL').resolves(null);

    const result = get_signed_url.getProjectAttachmentSignedURL();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(null);
  });

  describe('non report attachments', () => {
    it('should throw a 400 error when no sql statement returned', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      sinon.stub(project_queries, 'getProjectAttachmentS3KeySQL').returns(null);

      try {
        const result = get_signed_url.getProjectAttachmentSignedURL();

        await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to build attachment S3 key SQLstatement');
      }
    });

    it('should return the signed url response on success', async () => {
      const mockQuery = sinon.stub();

      mockQuery.resolves({ rows: [{ key: 's3Key' }] });

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: mockQuery
      });

      sinon.stub(project_queries, 'getProjectAttachmentS3KeySQL').returns(SQL`some query`);
      sinon.stub(file_utils, 'getS3SignedURL').resolves('myurlsigned.com');

      const result = get_signed_url.getProjectAttachmentSignedURL();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult).to.eql('myurlsigned.com');
    });
  });

  describe('report attachments', () => {
    it('should throw a 400 error when no sql statement returned', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      sinon.stub(project_queries, 'getProjectReportAttachmentS3KeySQL').returns(null);

      try {
        const result = get_signed_url.getProjectAttachmentSignedURL();

        await result(
          {
            ...sampleReq,
            query: {
              attachmentType: ATTACHMENT_TYPE.REPORT
            }
          },
          sampleRes as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to build report attachment S3 key SQLstatement');
      }
    });

    it('should return the signed url response on success', async () => {
      const mockQuery = sinon.stub();

      mockQuery.resolves({ rows: [{ key: 's3Key' }] });

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: mockQuery
      });

      sinon.stub(project_queries, 'getProjectReportAttachmentS3KeySQL').returns(SQL`some query`);
      sinon.stub(file_utils, 'getS3SignedURL').resolves('myurlsigned.com');

      const result = get_signed_url.getProjectAttachmentSignedURL();

      await result(
        {
          ...sampleReq,
          query: {
            attachmentType: ATTACHMENT_TYPE.REPORT
          }
        },
        sampleRes as any,
        (null as unknown) as any
      );

      expect(actualResult).to.eql('myurlsigned.com');
    });
  });
});
