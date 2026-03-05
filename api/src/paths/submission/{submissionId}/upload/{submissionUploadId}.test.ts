import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { PlatformService } from '../../../../services/platform-service';
import { KeycloakUserInformation } from '../../../../utils/keycloak-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import { DELETE, deleteSubmissionUpload } from './{submissionUploadId}';

chai.use(sinonChai);

describe('submission/{submissionId}/upload/{submissionUploadId}', () => {
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
      sinon.stub(PlatformService.prototype, 'deleteSubmissionUpload').resolves();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = {
        submissionId: '550e8400-e29b-41d4-a716-446655440000',
        submissionUploadId: 'upload-uuid-123'
      };
      mockReq.keycloak_token = {} as KeycloakUserInformation;

      const handler = deleteSubmissionUpload();
      await handler(mockReq, mockRes as any, mockNext);

      expect(mockRes.statusValue).to.equal(204);
      expect(mockRes.sendValue).to.equal(undefined);
    });

    it('rethrows error and calls connection.release', async () => {
      const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(PlatformService.prototype, 'deleteSubmissionUpload').rejects(new Error('BioHub delete failed'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = {
        submissionId: '550e8400-e29b-41d4-a716-446655440000',
        submissionUploadId: 'upload-uuid-123'
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
