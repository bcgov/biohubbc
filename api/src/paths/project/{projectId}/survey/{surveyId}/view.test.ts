import chai, { expect } from 'chai';
import { describe } from 'mocha';
import OpenAPIResponseValidator, { OpenAPIResponseValidatorArgs } from 'openapi-response-validator';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/http-error';
import { SurveyObject } from '../../../../../models/survey-view';
import { SurveyService } from '../../../../../services/survey-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';
import { GET, getSurvey } from './view';

chai.use(sinonChai);

describe('survey/{surveyId}/view', () => {
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
              survey_types: [1, 2],
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
            funding_sources: [],
            purpose_and_methodology: {
              additional_details: 'details',
              intended_outcome_id: 8,
              vantage_code_ids: [1, 2],
              surveyed_all_areas: 'true',
              revision_count: 0
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
            partnerships: {
              indigenous_partnerships: [],
              stakeholder_partnerships: []
            },
            locations: [
              {
                survey_location_id: 1,
                name: 'location name',
                description: 'location description',
                geometry: '',
                geography: '',
                geojson: [],
                revision_count: 0
              }
            ],
            site_selection: {
              strategies: ['strat1'],
              stratums: [{ name: 'startum1', description: 'desc' }]
            }
          },
          surveySupplementaryData: {
            survey_metadata_publish: {
              survey_metadata_publish_id: 1,
              survey_id: 1,
              event_timestamp: new Date(),
              queue_id: 1,
              create_date: new Date(),
              create_user: 1,
              update_date: new Date(),
              update_user: 1,
              revision_count: 1
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
              survey_types: [1, 2],
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
            funding_sources: [],
            purpose_and_methodology: {
              additional_details: null,
              intended_outcome_id: null,
              vantage_code_ids: [],
              surveyed_all_areas: 'false',
              revision_count: 0
            },
            proprietor: null,
            partnerships: {
              indigenous_partnerships: [],
              stakeholder_partnerships: []
            },
            locations: [
              {
                survey_location_id: 1,
                name: 'location name',
                description: 'location description',
                geometry: null,
                geography: '',
                geojson: [],
                revision_count: 0
              }
            ],
            site_selection: {
              strategies: ['strat1'],
              stratums: [{ name: 'startum1', description: null }]
            }
          },
          surveySupplementaryData: {
            survey_metadata_publish: null
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

      sinon.stub(SurveyService.prototype, 'getSurveyById').resolves(({ id: 2 } as unknown) as SurveyObject);

      sinon.stub(SurveyService.prototype, 'getSurveySupplementaryDataById').resolves({
        survey_metadata_publish: {
          survey_metadata_publish_id: 1,
          survey_id: 1,
          event_timestamp: '2020-04-04',
          queue_id: 1,
          create_date: '2020-04-04',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 1
        }
      });

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
      expect(mockRes.jsonValue).to.eql({
        surveyData: {
          id: 2
        },
        surveySupplementaryData: {
          survey_metadata_publish: {
            survey_metadata_publish_id: 1,
            survey_id: 1,
            event_timestamp: '2020-04-04',
            queue_id: 1,
            create_date: '2020-04-04',
            create_user: 1,
            update_date: null,
            update_user: null,
            revision_count: 1
          }
        }
      });
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
