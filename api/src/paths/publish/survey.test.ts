import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { PlatformService } from '../../services/platform-service';
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

      sinon.stub(PlatformService.prototype, 'submitSurveyToBioHub').resolves({ submission_uuid: '123-456-789' });

      const sampleReq = {
        keycloak_token: {},
        body: {
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

      expect(actualResult).to.eql({ submission_uuid: '123-456-789' });
    });

    it('catches error, calls rollback, and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(PlatformService.prototype, 'submitSurveyToBioHub').rejects(new Error('a test error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

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
  });
});
