import chai, { expect } from 'chai';
import { describe } from 'mocha';
import OpenAPIRequestValidator, { OpenAPIRequestValidatorArgs } from 'openapi-request-validator';
import OpenAPIResponseValidator, { OpenAPIResponseValidatorArgs } from 'openapi-response-validator';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as observationRecords from './index';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { ObservationService } from '../../../../../../services/observation-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';

chai.use(sinonChai);

describe.only('insertUpdateSurveyObservations', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe.only('openAPI schema', () => {
    describe('request validation', () => {
      const requestSchema = (observationRecords.PUT.apiDoc as unknown) as OpenAPIRequestValidatorArgs;
      const requestValidator = new OpenAPIRequestValidator(requestSchema);

      describe('should succeed when', () => {
        it('returns an empty array', () => {
          const request = {
            headers: { 'content-type': 'application/json' },
            params: {
              projectId: 4,
              surveyId: 5
            },
            body: { surveyObservations: [] }
          }

          const response = requestValidator.validateRequest(request);

          expect(response).to.equal(undefined);
        });

        it('has valid request values', () => {
          const request = {
            headers: { 'content-type': 'application/json' },
            params: {
              projectId: 4,
              surveyId: 5
            },
            body: {
              surveyObservations: [
                {
                  wldtaxonomic_units_id: 1234,
                  count: 99,
                  latitude: 48.103322,                
                  longitude: -122.798892,
                  observation_date: '1970-01-01',
                  observation_time: '00:00:00',
                }
              ]
            }
          }

          const response = requestValidator.validateRequest(request);

          expect(response).to.equal(undefined);
        });
      });

      describe('should fail when', () => {
        it('is missing projectId', async () => {
          const request = {
            headers: { 'content-type': 'application/json' },
            params: {
              // projectId: 4,
              surveyId: 5
            },
            body: {
              surveyObservations: [
                {
                  wldtaxonomic_units_id: 1234,
                  count: 99,
                  latitude: 48.103322,                
                  longitude: -122.798892,
                  observation_date: '1970-01-01',
                  observation_time: '00:00:00',
                }
              ]
            }
          };

          const response = requestValidator.validateRequest(request);

          expect(response.status).to.equal(400);
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].path).to.equal('projectId');
          expect(response.errors[0].message).to.equal(`must have required property 'projectId'`);
        });

        it('is missing surveyId', async () => {
          const request = {
            headers: { 'content-type': 'application/json' },
            params: {
              projectId: 4,
              // surveyId: 5
            },
            body: {
              surveyObservations: [
                {
                  wldtaxonomic_units_id: 1234,
                  count: 99,
                  latitude: 48.103322,                
                  longitude: -122.798892,
                  observation_date: '1970-01-01',
                  observation_time: '00:00:00',
                }
              ]
            }
          };

          const response = requestValidator.validateRequest(request);

          expect(response.status).to.equal(400);
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].path).to.equal('surveyId');
          expect(response.errors[0].message).to.equal(`must have required property 'surveyId'`);
        });
      
        it('is missing latitude', async () => {
          const request = {
            headers: {
              'content-type': 'application/json'
            },
            params: {
              projectId: 4,
              surveyId: 5
            },
            body: {
              surveyObservations: [
                {
                  wldtaxonomic_units_id: 1234,
                  count: 99,
                  // latitude: 48.103322,                
                  longitude: -122.798892,
                  observation_date: '1970-01-01',
                  observation_time: '00:00:00',
                }
              ]
            }
          };

          const response = requestValidator.validateRequest(request);

          expect(response.status).to.equal(400);
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].path).to.equal('surveyObservations.0.latitude');
          expect(response.errors[0].message).to.equal(`must have required property 'latitude'`);
        });

        it('is missing longitude', async () => {
          const request = {
            headers: {
              'content-type': 'application/json'
            },
            params: {
              projectId: 4,
              surveyId: 5
            },
            body: {
              surveyObservations: [
                {
                  wldtaxonomic_units_id: 1234,
                  count: 99,
                  latitude: 48.103322,                
                  // longitude: -122.798892,
                  observation_date: '1970-01-01',
                  observation_time: '00:00:00',
                }
              ]
            }
          };

          const response = requestValidator.validateRequest(request);

          expect(response.status).to.equal(400);
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].path).to.equal('surveyObservations.0.longitude');
          expect(response.errors[0].message).to.equal(`must have required property 'longitude'`);
        });

        it('is missing wldtaxonomic_units_id', async () => {
          const request = {
            headers: {
              'content-type': 'application/json'
            },
            params: {
              projectId: 4,
              surveyId: 5
            },
            body: {
              surveyObservations: [
                {
                  // wldtaxonomic_units_id: 1234,
                  count: 99,
                  latitude: 48.103322,                
                  longitude: -122.798892,
                  observation_date: '1970-01-01',
                  observation_time: '00:00:00',
                }
              ]
            }
          };

          const response = requestValidator.validateRequest(request);

          expect(response.status).to.equal(400);
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].path).to.equal('surveyObservations.0.wldtaxonomic_units_id');
          expect(response.errors[0].message).to.equal(`must have required property 'wldtaxonomic_units_id'`);
        });

        it('is missing count', async () => {
          const request = {
            headers: {
              'content-type': 'application/json'
            },
            params: {
              projectId: 4,
              surveyId: 5
            },
            body: {
              surveyObservations: [
                {
                  wldtaxonomic_units_id: 1234,
                  // count: 99,
                  latitude: 48.103322,                
                  longitude: -122.798892,
                  observation_date: '1970-01-01',
                  observation_time: '00:00:00',
                }
              ]
            }
          };

          const response = requestValidator.validateRequest(request);

          expect(response.status).to.equal(400);
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].path).to.equal('surveyObservations.0.count');
          expect(response.errors[0].message).to.equal(`must have required property 'count'`);
        });
      });
    });

    describe('response validation', () => {
      const responseSchema = (observationRecords.PUT.apiDoc as unknown) as OpenAPIResponseValidatorArgs;
      const responseValidator = new OpenAPIResponseValidator(responseSchema);

      describe('should succeed when', () => {
        it('returns an empty array', () => {
          const apiResponse = {
            surveyObservations: []
          }

          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response).to.equal(undefined);
        });

        it('has valid request values', () => {
          const apiResponse = {
            surveyObservations: [
              {
                survey_observation_id: 1,
                wldtaxonomic_units_id: 1234,
                count: 99,
                latitude: 48.103322,                
                longitude: -122.798892,
                observation_date: '1970-01-01',
                observation_time: '00:00:00',
                create_user: 1,
                create_date: '1970-01-01',
                update_user: 1,
                update_date: '1970-01-01',
                revision_count: 1
              }
            ]
          }

          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response).to.equal(undefined);
        });
      });

      describe('should fail when', () => {
        it('is missing survey_observation_id', async () => {
          const apiResponse = {
            surveyObservations: [
              {
                // survey_observation_id: 1,
                wldtaxonomic_units_id: 1234,
                count: 99,
                latitude: 48.103322,                
                longitude: -122.798892,
                observation_date: '1970-01-01',
                observation_time: '00:00:00',
                create_user: 1,
                create_date: '1970-01-01',
                update_user: 1,
                update_date: '1970-01-01',
                revision_count: 1
              }
            ]
          }

          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].path).to.equal('surveyObservations/0');
          expect(response.errors[0].message).to.equal(`must have required property 'survey_observation_id'`);
        });

        it('is missing latitude', async () => {
          const apiResponse = {
            surveyObservations: [
              {
                survey_observation_id: 1,
                wldtaxonomic_units_id: 1234,
                count: 99,
                // latitude: 48.103322,                
                longitude: -122.798892,
                observation_date: '1970-01-01',
                observation_time: '00:00:00',
                create_user: 1,
                create_date: '1970-01-01',
                update_user: 1,
                update_date: '1970-01-01',
                revision_count: 1
              }
            ]
          }

          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].path).to.equal('surveyObservations/0');
          expect(response.errors[0].message).to.equal(`must have required property 'latitude'`);
        });

        it('is missing longitude', async () => {
          const apiResponse = {
            surveyObservations: [
              {
                survey_observation_id: 1,
                wldtaxonomic_units_id: 1234,
                count: 99,
                latitude: 48.103322,                
                // longitude: -122.798892,
                observation_date: '1970-01-01',
                observation_time: '00:00:00',
                create_user: 1,
                create_date: '1970-01-01',
                update_user: 1,
                update_date: '1970-01-01',
                revision_count: 1
              }
            ]
          }

          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].path).to.equal('surveyObservations/0');
          expect(response.errors[0].message).to.equal(`must have required property 'longitude'`);
        });

        it('is missing wldtaxonomic_units_id', async () => {
          const apiResponse = {
            surveyObservations: [
              {
                survey_observation_id: 1,
                // wldtaxonomic_units_id: 1234,
                count: 99,
                latitude: 48.103322,                
                longitude: -122.798892,
                observation_date: '1970-01-01',
                observation_time: '00:00:00',
                create_user: 1,
                create_date: '1970-01-01',
                update_user: 1,
                update_date: '1970-01-01',
                revision_count: 1
              }
            ]
          }

          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].path).to.equal('surveyObservations/0');
          expect(response.errors[0].message).to.equal(`must have required property 'wldtaxonomic_units_id'`);
        });

        it('is missing count', async () => {
          const apiResponse = {
            surveyObservations: [
              {
                survey_observation_id: 1,
                wldtaxonomic_units_id: 1234,
                // count: 99,
                latitude: 48.103322,                
                longitude: -122.798892,
                observation_date: '1970-01-01',
                observation_time: '00:00:00',
                create_user: 1,
                create_date: '1970-01-01',
                update_user: 1,
                update_date: '1970-01-01',
                revision_count: 1
              }
            ]
          }

          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].path).to.equal('surveyObservations/0');
          expect(response.errors[0].message).to.equal(`must have required property 'count'`);
        });
      });
    });
  });

  it('inserts and updates survey observations', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const insertUpdateSurveyObservationsStub = sinon
      .stub(ObservationService.prototype, 'insertUpdateDeleteSurveyObservations')
      .resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      // TODO
    };

    try {
      const requestHandler = observationRecords.insertUpdateSurveyObservations();

      await requestHandler(mockReq, mockRes, mockNext);
    } catch (actualError) {
      expect.fail();
    }

    expect(insertUpdateSurveyObservationsStub).to.have.been.calledOnceWith(2, {
      // TODO
    });
    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.jsonValue).to.eql({ id: 2 });
  });

  it('catches and re-throws error', async () => {
    const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(ObservationService.prototype, 'insertUpdateDeleteSurveyObservations').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const requestHandler = observationRecords.insertUpdateSurveyObservations();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(dbConnectionObj.release).to.have.been.called;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
