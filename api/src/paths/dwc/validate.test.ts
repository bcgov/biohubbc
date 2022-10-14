import chai, { expect } from 'chai';
import { describe } from 'mocha';
import OpenAPIRequestValidator, { OpenAPIRequestValidatorArgs } from 'openapi-request-validator';
import OpenAPIResponseValidator, { OpenAPIResponseValidatorArgs } from 'openapi-response-validator';
//import sinon from 'sinon';
import sinonChai from 'sinon-chai';
// import * as db from '../../../database/db';
// import { HTTPError } from '../../../errors/http-error';
// import { DarwinCoreService } from '../../../services/dwc-service';
// import * as fileUtils from '../../../utils/file-utils';
// import * as keycloakUtils from '../../../utils/keycloak-utils';
// import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
// import * as validate from './validate';
import { POST } from './validate';

chai.use(sinonChai);

describe('dwc/validate', () => {
  describe('openApiSchema', () => {
    describe('request validation', () => {
      const requestValidator = new OpenAPIRequestValidator((POST.apiDoc as unknown) as OpenAPIRequestValidatorArgs);

      describe('should throw an error when', () => {
        describe('request body', () => {
          it('is null', async () => {
            const request = {
              headers: {
                'content-type': 'application/json'
              },
              body: {}
            };

            const response = requestValidator.validateRequest(request);

            expect(response.status).to.equal(400);
            expect(response.errors[0].path).to.equal('project_id');
            expect(response.errors[1].path).to.equal('occurrence_submission_id');
            expect(response.errors[0].message).to.equal(`must have required property 'project_id'`);
            expect(response.errors[1].message).to.equal(`must have required property 'occurrence_submission_id'`);
            expect(response.errors[2]).to.be.undefined;
          });

          it('is missing required fields', async () => {
            const request = {
              headers: {
                'content-type': 'application/json'
              },

              body: { project_id: 1 }
            };

            const response = requestValidator.validateRequest(request);

            expect(response.status).to.equal(400);
            expect(response.errors[0].path).to.equal('occurrence_submission_id');
            expect(response.errors[0].message).to.equal(`must have required property 'occurrence_submission_id'`);
          });

          it('fields are undefined', async () => {
            const request = {
              headers: {
                'content-type': 'application/json'
              },

              body: { project_id: undefined, occurrence_submission_id: undefined }
            };

            const response = requestValidator.validateRequest(request);

            expect(response.status).to.equal(400);
            expect(response.errors[0].path).to.equal('project_id');
            expect(response.errors[1].path).to.equal('occurrence_submission_id');
            expect(response.errors[0].message).to.equal(`must have required property 'project_id'`);
            expect(response.errors[1].message).to.equal(`must have required property 'occurrence_submission_id'`);
            expect(response.errors[2]).to.be.undefined;
          });
        });

        describe('project_id and occurrence_submission_id', () => {
          it('have invalid type', async () => {
            const request = {
              headers: { 'content-type': 'application/json' },
              body: { project_id: 'not a number', occurrence_submission_id: 'not a number' }
            };

            const response = requestValidator.validateRequest(request);

            expect(response.status).to.equal(400);
            expect(response.errors[0].message).to.equal('must be number');
            expect(response.errors[1].message).to.equal('must be number');
          });
        });
      });

      describe('should succeed when', () => {
        it('required values are valid', async () => {
          const request = {
            headers: { 'content-type': 'application/json' },
            body: { media: 'file', data_package_id: '64f47e65-f306-410e-82fa-115f9916910b' }
          };

          const response = requestValidator.validateRequest(request);

          expect(response).to.be.undefined;
        });

        it('required and optional values are valid', async () => {
          const request = {
            headers: { 'content-type': 'multipart/form-data' },
            body: { media: 'file', data_package_id: '64f47e65-f306-410e-82fa-115f9916910b' }
          };

          const response = requestValidator.validateRequest(request);

          expect(response).to.be.undefined;
        });
      });
    });

    describe.only('response validation', () => {
      const responseValidator = new OpenAPIResponseValidator((POST.apiDoc as unknown) as OpenAPIResponseValidatorArgs);

      describe('should throw an error when', () => {
        it('returns a null response', async () => {
          const apiResponse = null;
          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors[0].message).to.equal('must be object');
        });

        // it('returns an empty response', async () => {
        //   const apiResponse = {};
        //   const response = responseValidator.validateResponse(200, apiResponse);

        //   expect(response.message).to.equal('The response was not valid.');
        //   expect(response.errors[0].message).to.equal("must have required property 'data_package_id'");
        // });

        //     describe('data_package_id', () => {
        //       it('is undefined', async () => {
        //         const apiResponse = { data_package_id: undefined };
        //         const response = responseValidator.validateResponse(200, apiResponse);

        //         expect(response.message).to.equal('The response was not valid.');
        //         expect(response.errors[0].message).to.equal("must have required property 'data_package_id'");
        //       });

        //       it('is null', async () => {
        //         const apiResponse = { data_package_id: null };
        //         const response = responseValidator.validateResponse(200, apiResponse);

        //         expect(response.message).to.equal('The response was not valid.');
        //         expect(response.errors[0].message).to.equal('must be string');
        //       });

        //       it('is invalid type', async () => {
        //         const apiResponse = { data_package_id: 123 };
        //         const response = responseValidator.validateResponse(200, apiResponse);

        //         expect(response.message).to.equal('The response was not valid.');
        //         expect(response.errors[0].message).to.equal('must be string');
        //       });
        //     });
      });

      //   describe('should succeed when', () => {
      //     it('required values are valid', async () => {
      //       const apiResponse = { data_package_id: '64f47e65-f306-410e-82fa-115f9916910b' };
      //       const response = responseValidator.validateResponse(200, apiResponse);

      //       expect(response).to.equal(undefined);
      //     });
      //   });
    });
  });

  // describe('intakeDataset', () => {
  //   afterEach(() => {
  //     sinon.restore();
  //   });

  //   it('throws an error when req.files is empty', async () => {
  //     const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

  //     mockReq.files = [];
  //     mockReq.body = {
  //       media: 'file',
  //       data_package_id: '123-456-789'
  //     };

  //     const requestHandler = intake.intakeDataset();

  //     try {
  //       await requestHandler(mockReq, mockRes, mockNext);
  //       expect.fail();
  //     } catch (actualError) {
  //       expect((actualError as HTTPError).status).to.equal(400);
  //       expect((actualError as HTTPError).message).to.equal('Missing required `media`');
  //     }
  //   });

  //   it('throws an error when media file is detected to be malicious', async () => {
  //     const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

  //     mockReq.files = [({ originalname: 'file' } as unknown) as Express.Multer.File];
  //     mockReq.body = {
  //       media: 'file',
  //       data_package_id: '123-456-789'
  //     };

  //     sinon.stub(fileUtils, 'scanFileForVirus').resolves(false);

  //     const requestHandler = intake.intakeDataset();

  //     try {
  //       await requestHandler(mockReq, mockRes, mockNext);
  //       expect.fail();
  //     } catch (actualError) {
  //       expect((actualError as HTTPError).status).to.equal(400);
  //       expect((actualError as HTTPError).message).to.equal('Malicious content detected, upload cancelled');
  //     }
  //   });

  //   it('throws an error when getKeycloakSource returns null', async () => {
  //     const dbConnectionObj = getMockDBConnection();
  //     sinon.stub(db, 'getServiceAccountDBConnection').returns(dbConnectionObj);

  //     const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

  //     mockReq.files = [({ originalname: 'file' } as unknown) as Express.Multer.File];
  //     mockReq.body = {
  //       media: 'file',
  //       data_package_id: '123-456-789'
  //     };

  //     sinon.stub(fileUtils, 'scanFileForVirus').resolves(true);
  //     sinon.stub(keycloakUtils, 'getKeycloakSource').returns(null);

  //     const requestHandler = intake.intakeDataset();

  //     try {
  //       await requestHandler(mockReq, mockRes, mockNext);
  //       expect.fail();
  //     } catch (actualError) {
  //       expect((actualError as Error).message).to.equal('Failed to identify known submission source system');
  //     }
  //   });

  //   it('catches and re-throws an error', async () => {
  //     const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
  //     sinon.stub(db, 'getServiceAccountDBConnection').returns(dbConnectionObj);

  //     const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

  //     const mockFile = ({ originalname: 'file' } as unknown) as Express.Multer.File;
  //     mockReq.files = [mockFile];
  //     mockReq.body = {
  //       media: 'file',
  //       data_package_id: '123-456-789'
  //     };

  //     sinon.stub(fileUtils, 'scanFileForVirus').resolves(true);

  //     sinon.stub(keycloakUtils, 'getKeycloakSource').resolves(true);

  //     sinon.stub(DarwinCoreService.prototype, 'intake').throws(new Error('test error'));

  //     const requestHandler = intake.intakeDataset();

  //     try {
  //       await requestHandler(mockReq, mockRes, mockNext);
  //       expect.fail();
  //     } catch (actualError) {
  //       expect((actualError as Error).message).to.equal('test error');
  //       expect(dbConnectionObj.release).to.have.been.calledOnce;
  //       expect(dbConnectionObj.rollback).to.have.been.calledOnce;
  //     }
  //   });

  //   it('returns 200', async () => {
  //     const dbConnectionObj = getMockDBConnection();
  //     sinon.stub(db, 'getServiceAccountDBConnection').returns(dbConnectionObj);

  //     const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

  //     const mockFile = ({ originalname: 'file' } as unknown) as Express.Multer.File;
  //     const dataPackageId = '123-456-789';

  //     mockReq.files = [mockFile];
  //     mockReq.body = {
  //       media: 'test',
  //       data_package_id: dataPackageId
  //     };

  //     const scanFileForVirusStub = sinon.stub(fileUtils, 'scanFileForVirus').resolves(true);

  //     sinon.stub(keycloakUtils, 'getKeycloakSource').resolves(true);

  //     const intakeStub = sinon.stub(DarwinCoreService.prototype, 'intake').resolves();

  //     const requestHandler = intake.intakeDataset();

  //     await requestHandler(mockReq, mockRes, mockNext);

  //     expect(scanFileForVirusStub).to.have.been.calledOnceWith(mockFile);
  //     expect(intakeStub).to.have.been.calledOnceWith(mockFile, dataPackageId);
  //     expect(mockRes.statusValue).to.equal(200);
  //     expect(mockRes.jsonValue).to.eql({ data_package_id: '123-456-789' });
  //   });
  // });
});
