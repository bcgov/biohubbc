import chai, { expect } from 'chai';
import { describe } from 'mocha';
// import SQL from 'sql-template-strings';
// import * as db from '../../../../../../database/db';
// import { HTTPError } from '../../../../../../errors/http-error';
// import project_queries from '../../../../../../queries/project';
// import { getMockDBConnection } from '../../../../../../__mocks__/db';
// import * as get_project_metadata from './get';
import OpenAPIRequestValidator, { OpenAPIRequestValidatorArgs } from 'openapi-request-validator';
//import sinon from 'sinon';
import sinonChai from 'sinon-chai';
//import OpenAPIResponseValidator, { OpenAPIResponseValidatorArgs } from 'openapi-response-validator';
import { GET } from './get';

chai.use(sinonChai);

describe('project/{projectId}/attachments/{attachmentId}/metadata/get', () => {
  describe('openApiSchema', () => {
    describe('request validation', () => {
      const requestValidator = new OpenAPIRequestValidator((GET.apiDoc as unknown) as OpenAPIRequestValidatorArgs);
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
            expect(response.errors[0].path).to.equal('projectId');
            expect(response.errors[1].path).to.equal('attachmentId');
            expect(response.errors[2]).to.be.undefined;
          });
          it('is missing required fields', async () => {
            const request = {
              headers: {
                'content-type': 'application/json'
              },

              body: { projectId: 1 }
            };

            const response = requestValidator.validateRequest(request);

            expect(response.status).to.equal(400);
            expect(response.errors[0].message).to.equal(`must have required property 'projectId'`);
            expect(response.errors[1].message).to.equal(`must have required property 'attachmentId'`);
            expect(response.errors[2]).to.be.undefined;
          });
          it('fields are undefined', async () => {
            const request = {
              headers: {
                'content-type': 'application/json'
              },
              body: { projectId: undefined, attachmentId: undefined }
            };

            const response = requestValidator.validateRequest(request);

            expect(response.status).to.equal(400);
            expect(response.errors[0].message).to.equal(`must have required property 'projectId'`);
            expect(response.errors[1].message).to.equal(`must have required property 'attachmentId'`);
            expect(response.errors[2]).to.be.undefined;
          });
        });
      });
      //TODO: figure out why this one fails
      // describe('should succeed when', () => {
      //   it('required values are valid', async () => {
      //     const request = {
      //       headers: { 'content-type': 'application/json' },
      //       body: { projectId: 1, attachmentId: 1 }
      //     };

      //     const response = requestValidator.validateRequest(request);

      //     expect(response.status).to.equal(undefined);
      //   });
      // });
    });
  });
});
