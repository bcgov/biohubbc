import chai, { expect } from 'chai';
import { describe } from 'mocha';
import OpenAPIRequestValidator, { OpenAPIRequestValidatorArgs } from 'openapi-request-validator';
import OpenAPIResponseValidator, { OpenAPIResponseValidatorArgs } from 'openapi-response-validator';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  MESSAGE_CLASS_NAME,
  SUBMISSION_MESSAGE_TYPE,
  SUBMISSION_STATUS_TYPE
} from '../../../../../../../constants/status';
import * as db from '../../../../../../../database/db';
import {
  IGetLatestSurveyOccurrenceSubmission,
  SurveyRepository
} from '../../../../../../../repositories/survey-repository';
import { SurveyService } from '../../../../../../../services/survey-service';
import { getMockDBConnection } from '../../../../../../../__mocks__/db';
import * as observationSubmission from './get';

chai.use(sinonChai);

describe('getObservationSubmission', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {},
    params: {
      projectId: 1,
      surveyId: 1
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

  afterEach(() => {
    sinon.restore();
  });

  describe('openApiScheme', () => {
    const requestSchema = (observationSubmission.GET.apiDoc as unknown) as OpenAPIRequestValidatorArgs;
    const responseSchema = (observationSubmission.GET.apiDoc as unknown) as OpenAPIResponseValidatorArgs;

    describe('request validation', () => {
      const requestValidator = new OpenAPIRequestValidator(requestSchema);

      describe('should throw an error when', () => {
        describe('projectId', () => {
          it('is missing', () => {
            const request = {
              headers: { 'content-type': 'application/json' },
              params: {
                surveyId: 5
              }
            };

            const response = requestValidator.validateRequest(request);
            expect(response.status).to.equal(400);
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('projectId');
            expect(response.errors[0].message).to.equal("must have required property 'projectId'");
          });

          it('is null', () => {
            const request = {
              headers: { 'content-type': 'application/json' },
              params: {
                projectId: null,
                surveyId: 5
              }
            };

            const response = requestValidator.validateRequest(request);
            expect(response.status).to.equal(400);
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('projectId');
            expect(response.errors[0].message).to.equal('must be number');
          });

          it('is not a number', () => {
            const request = {
              headers: { 'content-type': 'application/json' },
              params: {
                projectId: '12',
                surveyId: 5
              }
            };

            const response = requestValidator.validateRequest(request);
            console.log(JSON.stringify(response));
            expect(response.status).to.equal(400);
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('projectId');
            expect(response.errors[0].message).to.equal('must be number');
          });

          it('is less than 1', () => {
            const request = {
              headers: { 'content-type': 'application/json' },
              params: {
                projectId: 0,
                surveyId: 5
              }
            };

            const response = requestValidator.validateRequest(request);
            expect(response.status).to.equal(400);
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('projectId');
            expect(response.errors[0].message).to.equal('must be >= 1');
          });
        });

        describe('surveyId', () => {
          it('is missing', () => {
            const request = {
              headers: { 'content-type': 'application/json' },
              params: {
                projectId: 2
              }
            };

            const response = requestValidator.validateRequest(request);
            expect(response.status).to.equal(400);
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('surveyId');
            expect(response.errors[0].message).to.equal("must have required property 'surveyId'");
          });

          it('is null', () => {
            const request = {
              headers: { 'content-type': 'application/json' },
              params: {
                projectId: 2,
                surveyId: null
              }
            };

            const response = requestValidator.validateRequest(request);
            expect(response.status).to.equal(400);
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('surveyId');
            expect(response.errors[0].message).to.equal('must be number');
          });

          it('is not a number', () => {
            const request = {
              headers: { 'content-type': 'application/json' },
              params: {
                projectId: 2,
                surveyId: '15'
              }
            };

            const response = requestValidator.validateRequest(request);
            expect(response.status).to.equal(400);
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('surveyId');
            expect(response.errors[0].message).to.equal('must be number');
          });

          it('is less than 1', () => {
            const request = {
              headers: { 'content-type': 'application/json' },
              params: {
                projectId: 2,
                surveyId: 0
              }
            };

            const response = requestValidator.validateRequest(request);

            expect(response.status).to.equal(400);
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('surveyId');
            expect(response.errors[0].message).to.equal('must be >= 1');
          });
        });
      });

      describe('should succeed when', () => {
        it('is provided with valid params', () => {
          const request = {
            headers: { 'content-type': 'application/json' },
            params: {
              projectId: 2,
              surveyId: 5
            }
          };

          const response = requestValidator.validateRequest(request);

          expect(response).to.equal(undefined);
        });
      });
    });

    describe('response validation', () => {
      const responseValidator = new OpenAPIResponseValidator(responseSchema);

      describe('should throw an error when', () => {
        it('returns a non-object response', () => {
          const apiResponse = 'test-response';
          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors.length).to.equal(1);
          expect(response.errors[0].path).to.equal('response');
          expect(response.errors[0].message).to.equal('must be object,null');
        });

        describe('id', () => {
          it('is missing', () => {
            const apiResponse = {
              inputFileName: 'filename.xlsx',
              status: 'validation-status',
              isValidating: false,
              messageTypes: []
            };

            const response = responseValidator.validateResponse(200, apiResponse);
            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('response');
            expect(response.errors[0].message).to.equal("must have required property 'id'");
          });

          it('is null', () => {
            const apiResponse = {
              id: null,
              inputFileName: 'filename.xlsx',
              status: 'validation-status',
              isValidating: false,
              messageTypes: []
            };

            const response = responseValidator.validateResponse(200, apiResponse);
            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors[0].path).to.equal('id');
            expect(response.errors[0].message).to.equal('must be number');
          });

          it('is not a number', () => {
            const apiResponse = {
              id: '12',
              inputFileName: 'filename.xlsx',
              status: 'validation-status',
              isValidating: false,
              messageTypes: []
            };

            const response = responseValidator.validateResponse(200, apiResponse);
            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors[0].path).to.equal('id');
            expect(response.errors[0].message).to.equal('must be number');
          });

          it('is less than 1', () => {
            const apiResponse = {
              id: 0,
              inputFileName: 'filename.xlsx',
              status: 'validation-status',
              isValidating: false,
              messageTypes: []
            };

            const response = responseValidator.validateResponse(200, apiResponse);
            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors[0].path).to.equal('id');
            expect(response.errors[0].message).to.equal('must be >= 1');
          });
        });

        describe('inputFileName', () => {
          it('is missing', () => {
            const apiResponse = {
              id: 1,
              status: 'validation-status',
              isValidating: false,
              messageTypes: []
            };

            const response = responseValidator.validateResponse(200, apiResponse);
            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('response');
            expect(response.errors[0].message).to.equal("must have required property 'inputFileName'");
          });

          it('is null', () => {
            const apiResponse = {
              id: 1,
              inputFileName: null,
              status: 'validation-status',
              isValidating: false,
              messageTypes: []
            };

            const response = responseValidator.validateResponse(200, apiResponse);
            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('inputFileName');
            expect(response.errors[0].message).to.equal('must be string');
          });

          it('is not a string', () => {
            const apiResponse = {
              id: 1,
              inputFileName: { filename: 'filename' },
              status: 'validation-status',
              isValidating: false,
              messageTypes: []
            };

            const response = responseValidator.validateResponse(200, apiResponse);
            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('inputFileName');
            expect(response.errors[0].message).to.equal('must be string');
          });
        });

        describe('status', () => {
          it('is missing', () => {
            const apiResponse = {
              id: 1,
              inputFileName: 'filename.xlsx',
              isValidating: false,
              messageTypes: []
            };

            const response = responseValidator.validateResponse(200, apiResponse);
            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('response');
            expect(response.errors[0].message).to.equal("must have required property 'status'");
          });

          it('is not a string', () => {
            const apiResponse = {
              id: 1,
              inputFileName: 'filename.xlsx',
              status: { status: 'status' },
              isValidating: false,
              messageTypes: []
            };

            const response = responseValidator.validateResponse(200, apiResponse);
            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('status');
            expect(response.errors[0].message).to.equal('must be string,null');
          });
        });

        describe('isValidating', () => {
          it('is missing', () => {
            const apiResponse = {
              id: 1,
              inputFileName: 'filename.xlsx',
              status: 'validation-status',
              messageTypes: []
            };

            const response = responseValidator.validateResponse(200, apiResponse);
            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('response');
            expect(response.errors[0].message).to.equal("must have required property 'isValidating'");
          });

          it('is not a bool', () => {
            const apiResponse = {
              id: 1,
              inputFileName: 'filename.xlsx',
              status: 'validation-status',
              isValidating: 'true',
              messageTypes: []
            };

            const response = responseValidator.validateResponse(200, apiResponse);
            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('isValidating');
            expect(response.errors[0].message).to.equal('must be boolean');
          });
        });

        describe('messageTypes', () => {
          it('is missing', () => {
            const apiResponse = {
              id: 1,
              inputFileName: 'filename.xlsx',
              isValidating: false,
              status: 'validation-status'
            };

            const response = responseValidator.validateResponse(200, apiResponse);
            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('response');
            expect(response.errors[0].message).to.equal("must have required property 'messageTypes'");
          });

          it('is not an array', () => {
            const apiResponse = {
              id: 1,
              inputFileName: 'filename.xlsx',
              status: 'validation-status',
              isValidating: false,
              messageTypes: 'message-types'
            };

            const response = responseValidator.validateResponse(200, apiResponse);
            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].path).to.equal('messageTypes');
            expect(response.errors[0].message).to.equal('must be array');
          });

          describe('messageType', () => {
            it('is not an object', () => {
              const apiResponse = {
                id: 1,
                inputFileName: 'filename.xlsx',
                status: 'validation-status',
                isValidating: false,
                messageTypes: ['message-type']
              };

              const response = responseValidator.validateResponse(200, apiResponse);
              expect(response.message).to.equal('The response was not valid.');
              expect(response.errors.length).to.equal(1);
              expect(response.errors[0].path).to.equal('messageTypes/0');
              expect(response.errors[0].message).to.equal('must be object');
            });

            describe('severityLabel', () => {
              it('is missing', () => {
                const apiResponse = {
                  id: 1,
                  inputFileName: 'filename.xlsx',
                  status: 'validation-status',
                  isValidating: false,
                  messageTypes: [
                    {
                      messageTypeLabel: 'type-label',
                      messageStatus: 'message-status',
                      messages: []
                    }
                  ]
                };

                const response = responseValidator.validateResponse(200, apiResponse);
                expect(response.message).to.equal('The response was not valid.');
                expect(response.errors.length).to.equal(1);
                expect(response.errors[0].path).to.equal('messageTypes/0');
                expect(response.errors[0].message).to.equal("must have required property 'severityLabel'");
              });

              it('is not a string', () => {
                const apiResponse = {
                  id: 1,
                  inputFileName: 'filename.xlsx',
                  status: 'validation-status',
                  isValidating: false,
                  messageTypes: [
                    {
                      severityLabel: { label: 'label ' },
                      messageTypeLabel: 'type-label',
                      messageStatus: 'message-status',
                      messages: []
                    }
                  ]
                };

                const response = responseValidator.validateResponse(200, apiResponse);
                expect(response.message).to.equal('The response was not valid.');
                expect(response.errors.length).to.equal(1);
                expect(response.errors[0].path).to.equal('messageTypes/0/severityLabel');
                expect(response.errors[0].message).to.equal('must be string');
              });
            });

            describe('messageStatus', () => {
              it('is missing', () => {
                const apiResponse = {
                  id: 1,
                  inputFileName: 'filename.xlsx',
                  status: 'validation-status',
                  isValidating: false,
                  messageTypes: [
                    {
                      severityLabel: 'severity-label',
                      messageStatus: 'message-status',
                      messages: []
                    }
                  ]
                };

                const response = responseValidator.validateResponse(200, apiResponse);
                expect(response.message).to.equal('The response was not valid.');
                expect(response.errors.length).to.equal(1);
                expect(response.errors[0].path).to.equal('messageTypes/0');
                expect(response.errors[0].message).to.equal("must have required property 'messageTypeLabel'");
              });

              it('is not a string', () => {
                const apiResponse = {
                  id: 1,
                  inputFileName: 'filename.xlsx',
                  status: 'validation-status',
                  isValidating: false,
                  messageTypes: [
                    {
                      severityLabel: 'severity-label',
                      messageTypeLabel: { label: 'label ' },
                      messageStatus: 'message-status',
                      messages: []
                    }
                  ]
                };

                const response = responseValidator.validateResponse(200, apiResponse);
                expect(response.message).to.equal('The response was not valid.');
                expect(response.errors.length).to.equal(1);
                expect(response.errors[0].path).to.equal('messageTypes/0/messageTypeLabel');
                expect(response.errors[0].message).to.equal('must be string');
              });
            });

            describe('messageStatus', () => {
              it('is missing', () => {
                const apiResponse = {
                  id: 1,
                  inputFileName: 'filename.xlsx',
                  status: 'validation-status',
                  isValidating: false,
                  messageTypes: [
                    {
                      severityLabel: 'severity-label',
                      messageTypeLabel: 'type-label',
                      messages: []
                    }
                  ]
                };

                const response = responseValidator.validateResponse(200, apiResponse);
                expect(response.message).to.equal('The response was not valid.');
                expect(response.errors.length).to.equal(1);
                expect(response.errors[0].path).to.equal('messageTypes/0');
                expect(response.errors[0].message).to.equal("must have required property 'messageStatus'");
              });

              it('is not a string', () => {
                const apiResponse = {
                  id: 1,
                  inputFileName: 'filename.xlsx',
                  status: 'validation-status',
                  isValidating: false,
                  messageTypes: [
                    {
                      severityLabel: 'severity-label',
                      messageTypeLabel: 'type-label',
                      messageStatus: { status: 'status' },
                      messages: []
                    }
                  ]
                };

                const response = responseValidator.validateResponse(200, apiResponse);
                expect(response.message).to.equal('The response was not valid.');
                expect(response.errors.length).to.equal(1);
                expect(response.errors[0].path).to.equal('messageTypes/0/messageStatus');
                expect(response.errors[0].message).to.equal('must be string');
              });
            });

            describe('messages', () => {
              it('is missing', () => {
                const apiResponse = {
                  id: 1,
                  inputFileName: 'filename.xlsx',
                  status: 'validation-status',
                  isValidating: false,
                  messageTypes: [
                    {
                      severityLabel: 'severity-label',
                      messageTypeLabel: 'type-label',
                      messageStatus: 'message-status'
                    }
                  ]
                };

                const response = responseValidator.validateResponse(200, apiResponse);
                expect(response.message).to.equal('The response was not valid.');
                expect(response.errors.length).to.equal(1);
                expect(response.errors[0].path).to.equal('messageTypes/0');
                expect(response.errors[0].message).to.equal("must have required property 'messages'");
              });

              it('is not an array', () => {
                const apiResponse = {
                  id: 1,
                  inputFileName: 'filename.xlsx',
                  status: 'validation-status',
                  isValidating: false,
                  messageTypes: [
                    {
                      severityLabel: 'severity-label',
                      messageTypeLabel: 'type-label',
                      messageStatus: 'message-status',
                      messages: 'messages'
                    }
                  ]
                };

                const response = responseValidator.validateResponse(200, apiResponse);
                expect(response.message).to.equal('The response was not valid.');
                expect(response.errors.length).to.equal(1);
                expect(response.errors[0].path).to.equal('messageTypes/0/messages');
                expect(response.errors[0].message).to.equal('must be array');
              });

              describe('message', () => {
                it('is not an object', () => {
                  const apiResponse = {
                    id: 1,
                    inputFileName: 'filename.xlsx',
                    status: 'validation-status',
                    isValidating: false,
                    messageTypes: [
                      {
                        severityLabel: 'severity-label',
                        messageTypeLabel: 'type-label',
                        messageStatus: 'message-status',
                        messages: ['messages']
                      }
                    ]
                  };

                  const response = responseValidator.validateResponse(200, apiResponse);
                  expect(response.message).to.equal('The response was not valid.');
                  expect(response.errors.length).to.equal(1);
                  expect(response.errors[0].path).to.equal('messageTypes/0/messages/0');
                  expect(response.errors[0].message).to.equal('must be object');
                });

                it('id is missing', () => {
                  const apiResponse = {
                    id: 1,
                    inputFileName: 'filename.xlsx',
                    status: 'validation-status',
                    isValidating: false,
                    messageTypes: [
                      {
                        severityLabel: 'severity-label',
                        messageTypeLabel: 'type-label',
                        messageStatus: 'message-status',
                        messages: [
                          {
                            message: 'test-message'
                          }
                        ]
                      }
                    ]
                  };

                  const response = responseValidator.validateResponse(200, apiResponse);
                  expect(response.message).to.equal('The response was not valid.');
                  expect(response.errors.length).to.equal(1);
                  expect(response.errors[0].path).to.equal('messageTypes/0/messages/0');
                  expect(response.errors[0].message).to.equal("must have required property 'id'");
                });

                it('id is not number', () => {
                  const apiResponse = {
                    id: 1,
                    inputFileName: 'filename.xlsx',
                    status: 'validation-status',
                    isValidating: false,
                    messageTypes: [
                      {
                        severityLabel: 'severity-label',
                        messageTypeLabel: 'type-label',
                        messageStatus: 'message-status',
                        messages: [
                          {
                            id: '12',
                            message: 'test-message'
                          }
                        ]
                      }
                    ]
                  };

                  const response = responseValidator.validateResponse(200, apiResponse);
                  expect(response.message).to.equal('The response was not valid.');
                  expect(response.errors.length).to.equal(1);
                  expect(response.errors[0].path).to.equal('messageTypes/0/messages/0/id');
                  expect(response.errors[0].message).to.equal('must be number');
                });

                it('message is missing', () => {
                  const apiResponse = {
                    id: 1,
                    inputFileName: 'filename.xlsx',
                    status: 'validation-status',
                    isValidating: false,
                    messageTypes: [
                      {
                        severityLabel: 'severity-label',
                        messageTypeLabel: 'type-label',
                        messageStatus: 'message-status',
                        messages: [
                          {
                            id: 1
                          }
                        ]
                      }
                    ]
                  };

                  const response = responseValidator.validateResponse(200, apiResponse);
                  expect(response.message).to.equal('The response was not valid.');
                  expect(response.errors.length).to.equal(1);
                  expect(response.errors[0].path).to.equal('messageTypes/0/messages/0');
                  expect(response.errors[0].message).to.equal("must have required property 'message'");
                });

                it('message is not string', () => {
                  const apiResponse = {
                    id: 1,
                    inputFileName: 'filename.xlsx',
                    status: 'validation-status',
                    isValidating: false,
                    messageTypes: [
                      {
                        severityLabel: 'severity-label',
                        messageTypeLabel: 'type-label',
                        messageStatus: 'message-status',
                        messages: [
                          {
                            id: 1,
                            message: { test: 'test-message' }
                          }
                        ]
                      }
                    ]
                  };

                  const response = responseValidator.validateResponse(200, apiResponse);
                  expect(response.message).to.equal('The response was not valid.');
                  expect(response.errors.length).to.equal(1);
                  expect(response.errors[0].path).to.equal('messageTypes/0/messages/0/message');
                  expect(response.errors[0].message).to.equal('must be string');
                });
              });
            });
          });
        });
      });

      describe('should succeed when', () => {
        it('returns a null response', () => {
          const apiResponse = null;

          const response = responseValidator.validateResponse(200, apiResponse);
          expect(response).to.equal(undefined);
        });

        it('status is null', () => {
          const apiResponse = {
            id: 1,
            status: null,
            inputFileName: 'filename.xlsx',
            isValidating: false,
            messageTypes: []
          };

          const response = responseValidator.validateResponse(200, apiResponse);
          expect(response).to.equal(undefined);
        });

        it('has valid response values', () => {
          const apiResponse = {
            id: 1,
            inputFileName: 'filename.xlsx',
            status: 'validation-status',
            isValidating: false,
            messageTypes: [
              {
                severityLabel: 'severity-label',
                messageTypeLabel: 'type-label',
                messageStatus: 'message-status',
                messages: [
                  {
                    id: 1,
                    message: 'test-message'
                  }
                ]
              }
            ]
          };

          const response = responseValidator.validateResponse(200, apiResponse);
          expect(response).to.equal(undefined);
        });
      });
    });
  });

  it('should return an observation submission, on success with no rejected files', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission').resolves(({
      id: 13,
      input_file_name: 'dwca_moose.zip',
      submission_status_type_name: 'Darwin Core Validated'
    } as unknown) as IGetLatestSurveyOccurrenceSubmission);

    const result = observationSubmission.getOccurrenceSubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      id: 13,
      inputFileName: 'dwca_moose.zip',
      status: 'Darwin Core Validated',
      isValidating: true,
      messageTypes: []
    });
  });

  it('should return an observation submission on success, with rejected files', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission').resolves(({
      id: 13,
      input_file_name: 'dwca_moose.zip',
      submission_status_type_name: 'Rejected'
    } as unknown) as IGetLatestSurveyOccurrenceSubmission);

    sinon.stub(SurveyRepository.prototype, 'getOccurrenceSubmissionMessages').resolves([
      {
        id: 1,
        message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header',
        status: SUBMISSION_STATUS_TYPE.REJECTED,
        type: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER,
        class: MESSAGE_CLASS_NAME.ERROR
      },
      {
        id: 2,
        message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header',
        status: SUBMISSION_STATUS_TYPE.REJECTED,
        type: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER,
        class: MESSAGE_CLASS_NAME.ERROR
      }
    ]);

    const result = observationSubmission.getOccurrenceSubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      id: 13,
      inputFileName: 'dwca_moose.zip',
      status: 'Rejected',
      isValidating: false,
      messageTypes: [
        {
          severityLabel: 'Error',
          messageTypeLabel: 'Missing Required Header',
          messageStatus: 'Rejected',
          messages: [
            {
              id: 1,
              message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header'
            },
            {
              id: 2,
              message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header'
            }
          ]
        }
      ]
    });
  });

  it('should return null if the survey has no observation submission, on success', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon
      .stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission')
      .resolves(({ delete_timestamp: true } as unknown) as IGetLatestSurveyOccurrenceSubmission);

    const result = observationSubmission.getOccurrenceSubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.null;
  });
});
