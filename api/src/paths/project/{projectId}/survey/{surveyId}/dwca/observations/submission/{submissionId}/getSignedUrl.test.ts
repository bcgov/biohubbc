import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../../../database/db';
import { HTTPError } from '../../../../../../../../../errors/http-error';
import { IOccurrenceSubmission } from '../../../../../../../../../repositories/occurrence-repository';
import { OccurrenceService } from '../../../../../../../../../services/occurrence-service';
import * as file_utils from '../../../../../../../../../utils/file-utils';
import { getMockDBConnection } from '../../../../../../../../../__mocks__/db';
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
      submissionId: 3
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
      const result = get_signed_url.getSingleSubmissionURL();

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
      const result = get_signed_url.getSingleSubmissionURL();

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

  it('should throw an error when submissionId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = get_signed_url.getSingleSubmissionURL();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, submissionId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `submissionId`');
    }
  });

  it('should return null when getting signed url from S3 fails', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'getS3SignedURL').resolves(null);
    sinon
      .stub(OccurrenceService.prototype, 'getOccurrenceSubmission')
      .resolves(({ input_key: 'string' } as unknown) as IOccurrenceSubmission);

    const result = get_signed_url.getSingleSubmissionURL();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(null);
  });

  it('should return the signed url response on success', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon
      .stub(OccurrenceService.prototype, 'getOccurrenceSubmission')
      .resolves(({ input_key: 'string' } as unknown) as IOccurrenceSubmission);

    sinon.stub(file_utils, 'getS3SignedURL').resolves('myurlsigned.com');

    const result = get_signed_url.getSingleSubmissionURL();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql('myurlsigned.com');
  });
});
