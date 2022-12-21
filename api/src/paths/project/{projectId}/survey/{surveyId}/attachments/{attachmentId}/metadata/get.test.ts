import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../../database/db';
import { HTTPError } from '../../../../../../../../errors/http-error';
import {
  IProjectReportAttachment,
  IReportAttachmentAuthor,
  ISurveyReportSecurityReason
} from '../../../../../../../../repositories/attachment-repository';
import { AttachmentService } from '../../../../../../../../services/attachment-service';
import { SecuritySearchService } from '../../../../../../../../services/security-search-service';
import { getMockDBConnection } from '../../../../../../../../__mocks__/db';
import * as get from './get';

chai.use(sinonChai);

<<<<<<< HEAD
describe('getSurveyReportDetails', () => {
  afterEach(() => {
    sinon.restore();
  });
=======
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
            authors: []
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
            ]
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
        });
      });

      it('required `metadata` properties are missing', async () => {
        const res = {
          metadata: {},
          authors: []
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
>>>>>>> 4f6ac046158030c698b1238be519a5304210361e

  it('should throw an error if failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockReq = {
      keycloak_token: {},
      params: {
        projectId: 1,
        attachmentId: 2
      },
      body: {}
    } as any;

    const expectedError = new Error('cannot process request');
    sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachmentById').rejects(expectedError);

    try {
      const result = get.getSurveyReportDetails();

      await result(mockReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

<<<<<<< HEAD
  it('should succeed with valid params', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockReq = {
      keycloak_token: {},
      params: {
        projectId: 1,
        attachmentId: 2
      },
      body: {}
    } as any;

    const getSurveyReportAttachmentByIdStub = sinon
      .stub(AttachmentService.prototype, 'getSurveyReportAttachmentById')
      .resolves(({ report: 1 } as unknown) as IProjectReportAttachment);

    const getSurveyAttachmentAuthorsStub = sinon
      .stub(AttachmentService.prototype, 'getSurveyAttachmentAuthors')
      .resolves([({ author: 2 } as unknown) as IReportAttachmentAuthor]);

    const getSurveyReportAttachmentSecurityReasonsStub = sinon
      .stub(AttachmentService.prototype, 'getSurveyReportAttachmentSecurityReasons')
      .resolves([
        ({
          persecution_security_id: 1,
          user_identifier: 'user',
          create_date: 'date'
        } as unknown) as ISurveyReportSecurityReason
      ]);

    const getPersecutionSecurityRulesStub = sinon
      .stub(SecuritySearchService.prototype, 'getPersecutionSecurityRules')
      .resolves([
        {
          reasonTitle: 'title',
          reasonDescription: 'desc',
          expirationDate: 'date'
        }
      ]);

    const expectedResponse = {
      metadata: { report: 1 },
      authors: [{ author: 2 }],
      security_reasons: [
        {
          security_reason_id: 1,
          security_reason_title: 'title',
          security_reason_description: 'desc',
          date_expired: 'date',
          user_identifier: 'user',
          security_date_applied: 'date'
        }
      ]
    };

    let actualResult: any = null;
    const sampleRes = {
      status: () => {
        return {
          json: (response: any) => {
            actualResult = response;
          }
=======
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
          authors: [{ first_name: '', last_name: '' }, {}]
>>>>>>> 4f6ac046158030c698b1238be519a5304210361e
        };
      }
    };

    const result = get.getSurveyReportDetails();
    await result(mockReq, (sampleRes as unknown) as any, (null as unknown) as any);

    expect(actualResult).to.eql(expectedResponse);
    expect(getSurveyReportAttachmentByIdStub).to.be.calledOnce;
    expect(getSurveyAttachmentAuthorsStub).to.be.calledOnce;
    expect(getSurveyReportAttachmentSecurityReasonsStub).to.be.calledOnce;
    expect(getPersecutionSecurityRulesStub).to.be.calledOnce;
  });
});
