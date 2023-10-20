import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/http-error';
import { SurveyObject } from '../../../../models/survey-view';
import { PublishStatus } from '../../../../repositories/history-publish-repository';
import { SurveyService } from '../../../../services/survey-service';
import { getMockDBConnection } from '../../../../__mocks__/db';
import * as surveys from './list';

chai.use(sinonChai);

describe('survey list', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when projectId is missing in Path', async () => {
    try {
      const sampleReq = {
        keycloak_token: {},
        body: {},
        params: {
          projectId: null
        }
      } as any;

      const result = surveys.getSurveyList();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should throw an error when a failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const expectedError = new Error('cannot process request');
    sinon.stub(SurveyService.prototype, 'getSurveyIdsByProjectId').rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1
      }
    } as any;

    try {
      const result = surveys.getSurveyList();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should succeed with valid Id', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const getSurveyIdsByProjectIdStub = sinon
      .stub(SurveyService.prototype, 'getSurveyIdsByProjectId')
      .resolves([{ id: 1 }]);

    const getSurveysByIdsStub = sinon
      .stub(SurveyService.prototype, 'getSurveyById')
      .resolves(({ survey_details: { id: 1 } } as unknown) as SurveyObject);

    const getSurveysPublishStub = sinon
      .stub(SurveyService.prototype, 'surveyPublishStatus')
      .resolves(PublishStatus.SUBMITTED);

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1
      }
    } as any;

    const expectedResponse = [
      {
        surveyData: { survey_details: { id: 1 } },
        surveySupplementaryData: { publishStatus: 'SUBMITTED' }
      }
    ];

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

    const result = surveys.getSurveyList();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);

    expect(actualResult).to.eql(expectedResponse);
    expect(getSurveyIdsByProjectIdStub).to.be.calledOnce;
    expect(getSurveysByIdsStub).to.be.calledOnce;
    expect(getSurveysPublishStub).to.be.calledOnce;
  });
});
