import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { ErrorService } from '../../services/error-service';
import { ValidationService } from '../../services/validation-service';
import { getMockDBConnection } from '../../__mocks__/db';
import * as scrape_occurrences from './scrape-occurrences';

chai.use(sinonChai);

describe('scrapeAndUpload', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when projectId is missing', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      params: {},
      body: {
        occurrence_submission_id: null
      }
    } as any;

    try {
      const result = scrape_occurrences.scrapeAndUpload();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required parameter `occurrence field`');
    }
  });

  it('should throw an error if failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      params: {},
      body: {
        occurrence_submission_id: 1
      }
    } as any;

    const expectedError = new Error('cannot process request');
    const scrapeOccurrencesStub = sinon.stub(ValidationService.prototype, 'scrapeOccurrences').rejects(expectedError);
    const insertSubmissionStatusStub = sinon.stub(ErrorService.prototype, 'insertSubmissionStatus').resolves();

    const expectedResponse = { status: 'success' };

    let actualResult: any = null;
    const sampleRes = {
      status: () => {
        return {
          json: (response: any) => {
            actualResult = response;
          }
        };
      }
    };

    try {
      const result = scrape_occurrences.scrapeAndUpload();

      await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualResult).to.eql(expectedResponse);

      expect((actualError as HTTPError).message).to.equal(expectedError.message);
      expect(scrapeOccurrencesStub).to.be.calledOnce;
      expect(insertSubmissionStatusStub).to.be.calledOnce;
    }
  });

  it('should succeed with valid params', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      params: {},
      body: {
        occurrence_submission_id: 1
      }
    } as any;

    const scrapeOccurrencesStub = sinon.stub(ValidationService.prototype, 'scrapeOccurrences').resolves();
    sinon.stub(ErrorService.prototype, 'insertSubmissionStatus').resolves();

    const expectedResponse = { status: 'success' };

    let actualResult: any = null;
    const sampleRes = {
      status: () => {
        return {
          json: (response: any) => {
            actualResult = response;
          }
        };
      }
    };

    const result = scrape_occurrences.scrapeAndUpload();

    await result(
      sampleReq,
      (sampleRes as unknown) as any,
      ((() => {
        return true;
      }) as unknown) as any
    );

    expect(actualResult).to.eql(expectedResponse);
    expect(scrapeOccurrencesStub).to.be.calledOnce;
  });
});
