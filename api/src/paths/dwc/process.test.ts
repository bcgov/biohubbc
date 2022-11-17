import chai, { expect } from 'chai';
import { describe } from 'mocha';
import OpenAPIRequestValidator, { OpenAPIRequestValidatorArgs } from 'openapi-request-validator';
import OpenAPIResponseValidator, { OpenAPIResponseValidatorArgs } from 'openapi-response-validator';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { ErrorService } from '../../services/error-service';
import { ValidationService } from '../../services/validation-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as process from './process';
import { POST } from './validate';

chai.use(sinonChai);

describe('dwc/process', () => {
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
            body: { project_id: 1, occurrence_submission_id: 2 }
          };

          const response = requestValidator.validateRequest(request);

          expect(response).to.be.undefined;
        });
      });
    });

    describe('response validation', () => {
      const responseValidator = new OpenAPIResponseValidator((POST.apiDoc as unknown) as OpenAPIResponseValidatorArgs);

      describe('should succeed when', () => {
        it('returns a null response', async () => {
          const apiResponse = null;
          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors[0].message).to.equal('must be object');
        });

        it('optional values are valid', async () => {
          const apiResponse = { status: 'my status', reason: 'my_reason' };
          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response).to.equal(undefined);
        });
      });

      describe('should fail when', () => {
        it('optional values are invalid', async () => {
          const apiResponse = { status: 1, reason: 1 };
          const response = responseValidator.validateResponse(200, apiResponse);

          expect(response.message).to.equal('The response was not valid.');
          expect(response.errors[0].message).to.equal('must be string');
        });
      });
    });
  });

  describe('process dwc file', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws an error when req.body.occurrence_submission_id is empty', async () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.body = {};

      const requestHandler = process.processDWCFile();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required parameter `occurrence field`');
      }
    });

    it('returns a 200 if req.body.occurrence_submission_id exists', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.body = {
        occurrence_submission_id: '123-456-789'
      };
      mockReq['keycloak_token'] = 'token';

      const processFileStub = sinon.stub(ValidationService.prototype, 'processDWCFile').resolves();

      const requestHandler = process.processDWCFile();
      await requestHandler(mockReq, mockRes, mockNext);
      expect(mockRes.statusValue).to.equal(200);
      expect(processFileStub).to.have.been.calledOnceWith(mockReq.body.occurrence_submission_id);
      expect(mockRes.jsonValue).to.eql({ status: 'success' });
    });

    it('catches an error on processDWCFile', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const processFileStub = sinon
        .stub(ValidationService.prototype, 'processDWCFile')
        .throws(new Error('test processDWCFile error'));
      const errorServiceStub = sinon.stub(ErrorService.prototype, 'insertSubmissionStatus').resolves();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq['keycloak_token'] = 'token';

      mockReq.body = {
        occurrence_submission_id: '123-456-789'
      };

      const requestHandler = process.processDWCFile();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(processFileStub).to.have.been.calledOnce;
        expect(errorServiceStub).to.have.been.calledOnce;
        expect(dbConnectionObj.rollback).to.have.been.calledOnce;
        expect(dbConnectionObj.release).to.have.been.calledOnce;
        expect((actualError as Error).message).to.equal('test processDWCFile error');
      }
    });

    it('catches an error on insertSubmissionStatus', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const processFileStub = sinon
        .stub(ValidationService.prototype, 'processDWCFile')
        .throws(new Error('test processDWCFile error'));
      const errorServiceStub = sinon
        .stub(ErrorService.prototype, 'insertSubmissionStatus')
        .throws(new Error('test insertSubmissionStatus error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq['keycloak_token'] = 'token';

      mockReq.body = {
        occurrence_submission_id: '123-456-789'
      };

      const requestHandler = process.processDWCFile();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(processFileStub).to.have.been.calledOnce;
        expect(errorServiceStub).to.have.been.calledOnce;
        expect(dbConnectionObj.rollback).to.have.been.calledOnce;
        expect(dbConnectionObj.release).to.have.been.calledOnce;
        expect((actualError as Error).message).to.equal('test insertSubmissionStatus error');
      }
    });
  });
});
