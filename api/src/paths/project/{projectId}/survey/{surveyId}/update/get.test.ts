import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { SurveyObject } from '../../../../../../models/survey-view';
import { SurveyService } from '../../../../../../services/survey-service';
import { getMockDBConnection } from '../../../../../../__mocks__/db';
import * as get from './get';

chai.use(sinonChai);

describe('getSurveyForUpdate', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when a failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const expectedError = new Error('cannot process request');
    sinon.stub(SurveyService.prototype, 'getSurveyById').rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1,
        surveyId: 2
      }
    } as any;

    try {
      const result = get.getSurveyForUpdate();

      await result(sampleReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should succeed with partial data', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1,
        surveyId: 2
      }
    } as any;

    const getSurveyByIdStub = sinon.stub(SurveyService.prototype, 'getSurveyById').resolves({
      id: 1,
      proprietor: {}
    } as unknown as SurveyObject);

    const expectedResponse = {
      surveyData: {
        id: 1,
        proprietor: {
          survey_data_proprietary: 'false',
          proprietor_type_name: '',
          proprietary_data_category: 0,
          first_nations_name: '',
          first_nations_id: 0,
          category_rationale: '',
          proprietor_name: '',
          disa_required: 'false'
        },
        agreements: {
          sedis_procedures_accepted: 'true',
          foippa_requirements_accepted: 'true'
        }
      }
    };

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

    const result = get.getSurveyForUpdate();

    await result(sampleReq, sampleRes as unknown as any, null as unknown as any);
    expect(actualResult).to.eql(expectedResponse);
    expect(getSurveyByIdStub).to.be.calledOnce;
  });

  it('should succeed with valid data', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1,
        surveyId: 2
      }
    } as any;

    const getSurveyByIdStub = sinon.stub(SurveyService.prototype, 'getSurveyById').resolves({
      id: 1,
      proprietor: { proprietor_type_id: 1, first_nations_id: 1, disa_required: true }
    } as unknown as SurveyObject);

    const expectedResponse = {
      surveyData: {
        id: 1,
        proprietor: {
          survey_data_proprietary: 'true',
          proprietary_data_category: 1,
          proprietor_type_id: 1,
          first_nations_id: 1,
          disa_required: 'true'
        },
        agreements: {
          sedis_procedures_accepted: 'true',
          foippa_requirements_accepted: 'true'
        }
      }
    };

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

    const result = get.getSurveyForUpdate();

    await result(sampleReq, sampleRes as unknown as any, null as unknown as any);
    expect(actualResult).to.eql(expectedResponse);
    expect(getSurveyByIdStub).to.be.calledOnce;
  });
});
