import chai, { expect } from 'chai';
import { describe } from 'mocha';
import OpenAPIRequestValidator, { OpenAPIRequestValidatorArgs } from 'openapi-request-validator';
import OpenAPIResponseValidator, { OpenAPIResponseValidatorArgs } from 'openapi-response-validator';
import sinonChai from 'sinon-chai';
import { GET } from './get';

chai.use(sinonChai);

describe('project/{projectId}/survey/{surveyId}/attachments/{attachmentId}/metadata/get', () => {
  describe('openApiSchema', () => {
    describe('req validation', () => {
      const requestValidator = new OpenAPIRequestValidator((GET.apiDoc as unknown) as OpenAPIRequestValidatorArgs);

      describe('should throw an error', () => {
        it('required path params missing', () => {
          const req = {
            headers: {
              'content-type': 'application/json'
            },
            params: {}
          };

          const result = requestValidator.validateRequest(req);

          expect(result.status).to.equal(400);

          expect(result.errors[0].path).to.equal('projectId');
          expect(result.errors[0].message).to.equal("must have required property 'projectId'");
          expect(result.errors[0].location).to.equal('path');

          expect(result.errors[1].path).to.equal('surveyId');
          expect(result.errors[1].message).to.equal("must have required property 'surveyId'");
          expect(result.errors[1].location).to.equal('path');

          expect(result.errors[2].path).to.equal('attachmentId');
          expect(result.errors[2].message).to.equal("must have required property 'attachmentId'");
          expect(result.errors[2].location).to.equal('path');

          expect(result.errors[3]).to.be.undefined;
        });

        it('path params null', () => {
          const req = {
            headers: {
              'content-type': 'application/json'
            },
            params: {
              projectId: null,
              surveyId: null,
              attachmentId: null
            }
          };

          const result = requestValidator.validateRequest(req);

          expect(result.status).to.equal(400);

          expect(result.errors[0].path).to.equal('projectId');
          expect(result.errors[0].message).to.equal('must be integer');
          expect(result.errors[0].location).to.equal('path');

          expect(result.errors[1].path).to.equal('surveyId');
          expect(result.errors[1].message).to.equal('must be integer');
          expect(result.errors[1].location).to.equal('path');

          expect(result.errors[2].path).to.equal('attachmentId');
          expect(result.errors[2].message).to.equal('must be integer');
          expect(result.errors[2].location).to.equal('path');

          expect(result.errors[3]).to.be.undefined;
        });

        it('path params invalid value', () => {
          const req = {
            headers: {
              'content-type': 'application/json'
            },
            params: {
              projectId: 0,
              surveyId: 0,
              attachmentId: 0
            }
          };

          const result = requestValidator.validateRequest(req);

          expect(result.status).to.equal(400);

          expect(result.errors[0].path).to.equal('projectId');
          expect(result.errors[0].message).to.equal('must be >= 1');
          expect(result.errors[0].location).to.equal('path');

          expect(result.errors[1].path).to.equal('surveyId');
          expect(result.errors[1].message).to.equal('must be >= 1');
          expect(result.errors[1].location).to.equal('path');

          expect(result.errors[2].path).to.equal('attachmentId');
          expect(result.errors[2].message).to.equal('must be >= 1');
          expect(result.errors[2].location).to.equal('path');

          expect(result.errors[3]).to.be.undefined;
        });
      });
    });

    describe('response validation', () => {
      const responseValidator = new OpenAPIResponseValidator((GET.apiDoc as unknown) as OpenAPIResponseValidatorArgs);

      describe('should succeed when', () => {
        it('all required properties are valid', async () => {
          const res = {
            metadata: {
              id: 1,
              title: '',
              last_modified: '',
              description: '',
              year_published: 2022,
              revision_count: 0
            },
            authors: [],
            security_reasons: []
          };

          const result = responseValidator.validateResponse(200, res);

          expect(result).to.be.undefined;
        });

        it('all optional properties are valid', async () => {
          const res = {
            metadata: {
              id: 1,
              title: '',
              last_modified: '',
              description: '',
              year_published: 2022,
              revision_count: 0
            },
            authors: [
              { first_name: '', last_name: '' },
              { first_name: '', last_name: '' }
            ],
            security_reasons: []
          };

          const result = responseValidator.validateResponse(200, res);

          expect(result).to.be.undefined;
        });
      });

      describe('should fail when', () => {
        it('required root properties are missing', async () => {
          const res = {};

          const result = responseValidator.validateResponse(200, res);

          expect(result.message).to.equal('The response was not valid.');

          expect(result.errors[0].path).to.equal('response');
          expect(result.errors[0].message).to.equal("must have required property 'metadata'");

          expect(result.errors[1].path).to.equal('response');
          expect(result.errors[1].message).to.equal("must have required property 'authors'");

          expect(result.errors[2].path).to.equal('response');
          expect(result.errors[2].message).to.equal("must have required property 'security_reasons'");
        });
      });

      it('required `metadata` properties are missing', async () => {
        const res = {
          metadata: {},
          authors: [],
          security_reasons: []
        };

        const result = responseValidator.validateResponse(200, res);

        expect(result.message).to.equal('The response was not valid.');

        expect(result.errors[0].path).to.equal('metadata');
        expect(result.errors[0].message).to.equal("must have required property 'id'");

        expect(result.errors[1].path).to.equal('metadata');
        expect(result.errors[1].message).to.equal("must have required property 'title'");

        expect(result.errors[2].path).to.equal('metadata');
        expect(result.errors[2].message).to.equal("must have required property 'last_modified'");

        expect(result.errors[3].path).to.equal('metadata');
        expect(result.errors[3].message).to.equal("must have required property 'description'");

        expect(result.errors[4].path).to.equal('metadata');
        expect(result.errors[4].message).to.equal("must have required property 'year_published'");

        expect(result.errors[5].path).to.equal('metadata');
        expect(result.errors[5].message).to.equal("must have required property 'revision_count'");
      });

      it('required `author` properties are missing', async () => {
        const res = {
          metadata: {
            id: 1,
            title: '',
            last_modified: '',
            description: '',
            year_published: 2022,
            revision_count: 0
          },
          authors: [{ first_name: '', last_name: '' }, {}],
          security_reasons: []
        };

        const result = responseValidator.validateResponse(200, res);

        expect(result.message).to.equal('The response was not valid.');

        expect(result.errors[0].path).to.equal('authors/1');
        expect(result.errors[0].message).to.equal("must have required property 'first_name'");

        expect(result.errors[1].path).to.equal('authors/1');
        expect(result.errors[1].message).to.equal("must have required property 'last_name'");
      });
    });
  });
});
