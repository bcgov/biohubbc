import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { ErrorService } from '../../services/error-service';
import { ValidationService } from '../../services/validation-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as process from './process';

chai.use(sinonChai);

describe('dwc/process', () => {
  describe('process dwc file', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns a 200 if req.body.occurrence_submission_id exists', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.body = {
        occurrence_submission_id: '123-456-789'
      };
      mockReq['keycloak_token'] = 'token';

      const processFileStub = sinon.stub(ValidationService.prototype, 'processDWCFile').resolves();

      const requestHandler = process.processDWCFile();
      await requestHandler(mockReq, mockRes, mockNext);
      expect(mockRes.statusValue).to.equal(200);
      expect(processFileStub).to.have.been.calledOnceWith(mockReq.body.occurrence_submission_id);
      expect(mockRes.jsonValue).to.eql({ status: 'success' });
    });

    it('catches an error on processDWCFile', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const processFileStub = sinon
        .stub(ValidationService.prototype, 'processDWCFile')
        .throws(new Error('test processDWCFile error'));
      const errorServiceStub = sinon.stub(ErrorService.prototype, 'insertSubmissionStatus').resolves();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq['keycloak_token'] = 'token';

      mockReq.body = {
        occurrence_submission_id: '123-456-789'
      };

      const requestHandler = process.processDWCFile();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(processFileStub).to.have.been.calledOnce;
        expect(errorServiceStub).to.have.been.calledOnce;
        expect(dbConnectionObj.rollback).to.have.been.calledOnce;
        expect(dbConnectionObj.release).to.have.been.calledOnce;
        expect((actualError as Error).message).to.equal('test processDWCFile error');
      }
    });

    it('catches an error on insertSubmissionStatus', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const processFileStub = sinon
        .stub(ValidationService.prototype, 'processDWCFile')
        .throws(new Error('test processDWCFile error'));
      const errorServiceStub = sinon
        .stub(ErrorService.prototype, 'insertSubmissionStatus')
        .throws(new Error('test insertSubmissionStatus error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq['keycloak_token'] = 'token';

      mockReq.body = {
        occurrence_submission_id: '123-456-789'
      };

      const requestHandler = process.processDWCFile();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(processFileStub).to.have.been.calledOnce;
        expect(errorServiceStub).to.have.been.calledOnce;
        expect(dbConnectionObj.rollback).to.have.been.calledOnce;
        expect(dbConnectionObj.release).to.have.been.calledOnce;
        expect((actualError as Error).message).to.equal('test insertSubmissionStatus error');
      }
    });
  });
});
