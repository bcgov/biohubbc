import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../../__mocks__/db';
import * as db from '../../../../../../../../database/db';
import { PlatformService } from '../../../../../../../../services/platform-service';
import { KeycloakUserInformation } from '../../../../../../../../utils/keycloak-utils';
import { DELETE, deleteSubmissionUpload } from './{submissionUploadId}';

chai.use(sinonChai);

describe('project/{projectId}/survey/{surveyId}/submission/{submissionId}/upload/{submissionUploadId}', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema(DELETE.apiDoc as unknown as object)).to.be.true;
    });
  });

  describe('deleteSubmissionUpload', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns 204 when delete succeeds', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(PlatformService.prototype, 'deleteSubmissionUploadForSurvey').resolves(true);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = {
        surveyId: '42',
        submissionId: '550e8400-e29b-41d4-a716-446655440000',
        submissionUploadId: '550e8400-e29b-41d4-a716-446655440001'
      };
      mockReq.keycloak_token = {} as KeycloakUserInformation;

      const handler = deleteSubmissionUpload();
      await handler(mockReq, mockRes as any, mockNext);

      expect(mockRes.statusValue).to.equal(204);
      expect(mockRes.sendValue).to.equal(undefined);
    });

    it('returns 404 when submission is not found for survey', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(PlatformService.prototype, 'deleteSubmissionUploadForSurvey').resolves(false);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = {
        surveyId: '42',
        submissionId: '550e8400-e29b-41d4-a716-446655440000',
        submissionUploadId: '550e8400-e29b-41d4-a716-446655440001'
      };
      mockReq.keycloak_token = {} as KeycloakUserInformation;

      const handler = deleteSubmissionUpload();
      await handler(mockReq, mockRes as any, mockNext);

      expect(mockRes.statusValue).to.equal(404);
      expect(mockRes.jsonValue).to.eql({ message: 'Submission not found for survey' });
    });

    it('rethrows error and calls connection.release', async () => {
      const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon
        .stub(PlatformService.prototype, 'deleteSubmissionUploadForSurvey')
        .rejects(new Error('BioHub delete failed'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = {
        surveyId: '42',
        submissionId: '550e8400-e29b-41d4-a716-446655440000',
        submissionUploadId: '550e8400-e29b-41d4-a716-446655440001'
      };
      mockReq.keycloak_token = {} as KeycloakUserInformation;

      const handler = deleteSubmissionUpload();

      try {
        await handler(mockReq, mockRes as any, mockNext);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('BioHub delete failed');
        expect(dbConnectionObj.release).to.have.been.called;
      }
    });
  });
});
