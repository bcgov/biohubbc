import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { HistoryPublishService } from '../../../services/history-publish-service';
import { PlatformService } from '../../../services/platform-service';
import { KeycloakUserInformation } from '../../../utils/keycloak-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import { resolveSubmissionToSurvey } from '../resolveSubmissionToSurvey';
import { GET, getSubmissionHistory } from './history';

chai.use(sinonChai);

describe('submission/{submissionId}/history', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema(GET.apiDoc as unknown as object)).to.be.true;
    });
  });

  describe('resolveSubmissionToSurvey', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns 400 when submissionId is missing', async () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = {};
      mockReq.keycloak_token = {} as KeycloakUserInformation;

      await resolveSubmissionToSurvey(mockReq, mockRes as any, mockNext);

      expect(mockRes.statusValue).to.equal(400);
      expect(mockRes.jsonValue).to.eql({ message: 'submissionId is required' });
      expect(mockNext).to.not.have.been.called;
    });

    it('returns 404 when submission has no publish record', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(HistoryPublishService.prototype, 'getSurveyMetadataPublishRecordBySubmissionUuid').resolves(null);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = { submissionId: '550e8400-e29b-41d4-a716-446655440000' };
      mockReq.keycloak_token = {} as KeycloakUserInformation;

      await resolveSubmissionToSurvey(mockReq, mockRes as any, mockNext);

      expect(mockRes.statusValue).to.equal(404);
      expect(mockRes.jsonValue).to.eql({ message: 'Submission not found' });
      expect(mockNext).to.not.have.been.called;
    });

    it('sets survey_id_for_submission and calls next when record exists', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon
        .stub(HistoryPublishService.prototype, 'getSurveyMetadataPublishRecordBySubmissionUuid')
        .resolves({ survey_id: 42 } as any);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = { submissionId: '550e8400-e29b-41d4-a716-446655440000' };
      mockReq.keycloak_token = {} as KeycloakUserInformation;

      await resolveSubmissionToSurvey(mockReq, mockRes as any, mockNext);

      expect(mockReq.survey_id_for_submission).to.equal(42);
      expect(mockNext).to.have.been.calledOnce;
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
          id: 123
        }
      ];
      sinon.stub(PlatformService.prototype, 'getSubmissionHistory').resolves(mockHistory);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = { submissionId: '550e8400-e29b-41d4-a716-446655440000' };
      mockReq.keycloak_token = {} as KeycloakUserInformation;

      const handler = getSubmissionHistory();
      await handler(mockReq, mockRes as any, mockNext);

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql(mockHistory);
    });

    it('rethrows error and calls connection.release', async () => {
      const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(PlatformService.prototype, 'getSubmissionHistory').rejects(new Error('BioHub error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = { submissionId: '550e8400-e29b-41d4-a716-446655440000' };
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
