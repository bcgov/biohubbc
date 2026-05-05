import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { PlatformService } from '../../services/platform-service';
import { SurveyService } from '../../services/survey-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { POST, publishSurvey } from './survey';

chai.use(sinonChai);

describe('survey', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema(POST.apiDoc as unknown as object)).to.be.true;
    });
  });

  describe('publishSurvey', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('submits selected data to biohub', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(SurveyService.prototype, 'getSurveyData').resolves({ project_id: 1 } as any);

      sinon
        .stub(PlatformService.prototype, 'submitSurveyToBioHub')
        .resolves({ submission_uuid: '550e8400-e29b-41d4-a716-446655440000' });

      const sampleReq = {
        keycloak_token: {},
        body: {
          projectId: 1,
          surveyId: 1,
          data: {
            submissionComment: 'test'
          }
        },
        params: {}
      } as any;

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

      const { mockNext } = getRequestHandlerMocks();

      const requestHandler = publishSurvey();

      await requestHandler(sampleReq, sampleRes as unknown as any, mockNext);

      expect(actualResult).to.eql({ submission_uuid: '550e8400-e29b-41d4-a716-446655440000' });
    });

    it('catches error, calls rollback, and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(SurveyService.prototype, 'getSurveyData').resolves({ project_id: 1 } as any);

      sinon.stub(PlatformService.prototype, 'submitSurveyToBioHub').rejects(new Error('a test error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.body = {
        projectId: 1,
        surveyId: 1,
        data: {
          submissionComment: 'test'
        }
      };

      try {
        const requestHandler = publishSurvey();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(dbConnectionObj.rollback).to.have.been.called;
        expect(dbConnectionObj.release).to.have.been.called;

        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });

    it('throws bad request when survey does not belong to project', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(SurveyService.prototype, 'getSurveyData').resolves({ project_id: 999 } as any);
      const submitSurveyToBioHubStub = sinon.stub(PlatformService.prototype, 'submitSurveyToBioHub');

      const sampleReq = {
        keycloak_token: {},
        body: {
          projectId: 1,
          surveyId: 1,
          data: {
            submissionComment: 'test'
          }
        },
        params: {}
      } as any;

      const { mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = publishSurvey();
        await requestHandler(sampleReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Invalid project or survey identifier.');
        expect(dbConnectionObj.rollback).to.have.been.called;
        expect(dbConnectionObj.release).to.have.been.called;
        expect(submitSurveyToBioHubStub).to.not.have.been.called;
      }
    });
  });
});
