import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';
import { dbDependencies as db } from '../../../../../../../database/db';
import { PlatformService } from '../../../../../../../services/platform-service';
import { KeycloakUserInformation } from '../../../../../../../utils/keycloak-utils';
import { GET, getSubmissionHistory } from './history';

chai.use(sinonChai);

describe('project/{projectId}/survey/{surveyId}/submission/{submissionId}/history', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema(GET.apiDoc as unknown as object)).to.be.true;
    });
  });

  describe('getSubmissionHistory', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns 200 with history array', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const mockHistory = [
        {
          submissionUploadId: 'upload-uuid-1',
          status: 'submitted',
          createDate: '2024-01-01T00:00:00Z',
          submissionId: 123
        }
      ];
      sinon.stub(PlatformService.prototype, 'getSubmissionHistoryForSurvey').resolves(mockHistory);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = {
        surveyId: '42',
        submissionId: '550e8400-e29b-41d4-a716-446655440000'
      };
      mockReq.keycloak_token = {} as KeycloakUserInformation;

      const handler = getSubmissionHistory();
      await handler(mockReq, mockRes as any, mockNext);

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql(mockHistory);
    });

    it('returns 404 when submission is not found for survey', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(PlatformService.prototype, 'getSubmissionHistoryForSurvey').resolves(null);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = {
        surveyId: '42',
        submissionId: '550e8400-e29b-41d4-a716-446655440000'
      };
      mockReq.keycloak_token = {} as KeycloakUserInformation;

      const handler = getSubmissionHistory();
      await handler(mockReq, mockRes as any, mockNext);

      expect(mockRes.statusValue).to.equal(404);
      expect(mockRes.jsonValue).to.eql({ message: 'Submission not found for survey' });
    });

    it('rethrows error and calls connection.release', async () => {
      const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(PlatformService.prototype, 'getSubmissionHistoryForSurvey').rejects(new Error('BioHub error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = {
        surveyId: '42',
        submissionId: '550e8400-e29b-41d4-a716-446655440000'
      };
      mockReq.keycloak_token = {} as KeycloakUserInformation;

      const handler = getSubmissionHistory();

      try {
        await handler(mockReq, mockRes as any, mockNext);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('BioHub error');
        expect(dbConnectionObj.release).to.have.been.called;
      }
    });
  });
});
