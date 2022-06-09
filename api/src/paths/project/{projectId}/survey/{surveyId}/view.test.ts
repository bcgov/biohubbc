import chai, { expect } from 'chai';
import { describe } from 'mocha';
import OpenAPIResponseValidator, { OpenAPIResponseValidatorArgs } from 'openapi-response-validator';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/custom-error';
import { SurveyService } from '../../../../../services/survey-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';
import { GET, getSurvey } from './view';

chai.use(sinonChai);

describe('survey/view', () => {
  describe('response validation', () => {
    const responseValidator = new OpenAPIResponseValidator((GET.apiDoc as unknown) as OpenAPIResponseValidatorArgs);

    describe('should succeed when', () => {
      it('has valid values', async () => {
        const apiResponse = {
          surveyData: {
            survey_details: {
              survey_name: 'name',
              start_date: '2020-04-04',
              end_date: '2020-05-05',
              biologist_first_name: 'first',
              biologist_last_name: 'last',
              publish_date: '',
              revision_count: 1
            },
            species: {
              focal_species: [1],
              focal_species_names: ['1'],
              ancillary_species: [3],
              ancillary_species_names: ['3']
            },
            permit: {
              permit_number: '123',
              permit_type: 'type'
            },
            funding: {
              funding_sources: [
                {
                  pfs_id: 1,
                  agency_name: 'name',
                  funding_amount: 100,
                  funding_start_date: '2020-04-04',
                  funding_end_date: '2020-05-05'
                }
              ]
            },
            purpose_and_methodology: {
              field_method_id: 1,
              additional_details: 'details',
              intended_outcome_id: 8,
              ecological_season_id: 1,
              vantage_code_ids: [1, 2],
              surveyed_all_areas: 'true'
            },
            proprietor: {
              category_rationale: 'rationale',
              disa_required: true,
              first_nations_id: 1,
              first_nations_name: 'name',
              proprietor_name: 'name',
              proprietor_type_id: 2,
              proprietor_type_name: 'name'
            },
            location: {
              survey_area_name: 'location',
              geometry: []
            }
          },
          surveySupplementaryData: {
            occurrence_submission: {
              id: 1
            },
            summary_result: {
              id: 2
            }
          }
        };

        const response = responseValidator.validateResponse(200, apiResponse);

        expect(response).to.equal(undefined);
      });

      it('contains nullable values where applicable', async () => {
        const apiResponse = {
          surveyData: {
            survey_details: {
              survey_name: 'name',
              start_date: '2020-04-04',
              end_date: '2020-05-05',
              biologist_first_name: 'first',
              biologist_last_name: 'last',
              publish_date: null,
              revision_count: 1
            },
            species: {
              focal_species: [1],
              focal_species_names: ['1'],
              ancillary_species: null,
              ancillary_species_names: null
            },
            permit: {
              permit_number: null,
              permit_type: null
            },
            funding: {
              funding_sources: [
                {
                  pfs_id: null,
                  agency_name: null,
                  funding_amount: null,
                  funding_start_date: null,
                  funding_end_date: null
                }
              ]
            },
            purpose_and_methodology: {
              field_method_id: 1,
              additional_details: null,
              intended_outcome_id: null,
              ecological_season_id: null,
              vantage_code_ids: [],
              surveyed_all_areas: 'false'
            },
            proprietor: null,
            location: {
              survey_area_name: 'location',
              geometry: []
            }
          },
          surveySupplementaryData: {
            occurrence_submission: null,
            summary_result: null
          }
        };

        const response = responseValidator.validateResponse(200, apiResponse);

        expect(response).to.equal(undefined);
      });
    });
  });

  describe('getSurvey', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('fetches a survey', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(SurveyService.prototype, 'getSurveyById').resolves();
      sinon.stub(SurveyService.prototype, 'getSurveySupplementaryDataById').resolves();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        projectId: '1',
        surveyId: '2'
      };

      mockReq.body = {};

      try {
        const requestHandler = getSurvey();

        await requestHandler(mockReq, mockRes, mockNext);
      } catch (actualError) {
        expect.fail();
      }

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.equal({ id: 2 });
    });

    it('catches and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(SurveyService.prototype, 'getSurveyById').rejects(new Error('a test error'));
      sinon.stub(SurveyService.prototype, 'getSurveySupplementaryDataById').resolves();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = getSurvey();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(dbConnectionObj.release).to.have.been.called;

        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
