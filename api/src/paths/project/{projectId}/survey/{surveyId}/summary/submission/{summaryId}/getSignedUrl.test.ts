import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../../database/db';
import { HTTP400, HTTPError } from '../../../../../../../../errors/http-error';
import { SummaryService } from '../../../../../../../../services/summary-service';
import * as file_utils from '../../../../../../../../utils/file-utils';
import { getMockDBConnection } from '../../../../../../../../__mocks__/db';
import * as get_signed_url from './getSignedUrl';

chai.use(sinonChai);

describe('getSingleSubmissionURL', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      surveyId: 2,
      summaryId: 3
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
      const result = get_signed_url.getSingleSummarySubmissionURL();

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

  it('should throw an error when surveyId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = get_signed_url.getSingleSummarySubmissionURL();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, surveyId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `surveyId`');
    }
  });

  it('should throw an error when summaryId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = get_signed_url.getSingleSummarySubmissionURL();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, summaryId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `summaryId`');
    }
  });

  it('should throw a 400 error when no submission URL is found', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon
      .stub(SummaryService.prototype, 'findSummarySubmissionById')
      .throws(new HTTP400('Failed to query survey summary submission table'));

    try {
      const result = get_signed_url.getSingleSummarySubmissionURL();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to query survey summary submission table');
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
      sql: mockQuery
    });

    sinon.stub(file_utils, 'getS3SignedURL').resolves(null);

    const result = get_signed_url.getSingleSummarySubmissionURL();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(null);
  });

  it('should return the signed url response on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ key: 's3Key' }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      sql: mockQuery
    });

    sinon.stub(SummaryService.prototype, 'findSummarySubmissionById').resolves({
      survey_summary_submission_id: 1,
      survey_id: 1,
      source: 'source',
      event_timestamp: null,
      delete_timestamp: null,
      key: 'myurlsigned.com',
      file_name: 'filename',
      create_user: 1,
      update_date: null,
      update_user: null,
      revision_count: 1,
      summary_template_species_id: 1
    });
    sinon.stub(file_utils, 'getS3SignedURL').resolves('myurlsigned.com');

    const result = get_signed_url.getSingleSummarySubmissionURL();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql('myurlsigned.com');
  });
});
