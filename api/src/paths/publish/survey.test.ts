import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { SYSTEM_IDENTITY_SOURCE } from '../../constants/database';
import { dbDependencies as db } from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { PlatformService } from '../../services/platform-service';
import { SurveyService } from '../../services/survey-service';
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
    const systemUser = {
      user_guid: '11111111-1111-1111-1111-111111111111',
      user_identifier: 'JSMITH',
      identity_source: SYSTEM_IDENTITY_SOURCE.IDIR
    };

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
        system_user: systemUser,
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
      expect(PlatformService.prototype.submitSurveyToBioHub).to.have.been.calledOnceWith(
        1,
        {
          submissionComment: 'test'
        },
        [
          {
            guid: systemUser.user_guid,
            identifier: systemUser.user_identifier,
            identitySource: systemUser.identity_source
          }
        ]
      );
    });

    it('catches error, calls rollback, and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(SurveyService.prototype, 'getSurveyData').resolves({ project_id: 1 } as any);

      sinon.stub(PlatformService.prototype, 'submitSurveyToBioHub').rejects(new Error('a test error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.system_user = systemUser as any;
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
        system_user: systemUser,
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
