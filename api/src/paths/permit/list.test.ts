import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/custom-error';
import { PermitService } from '../../services/permit-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { getAllPermits } from './list';

chai.use(sinonChai);

describe('permit-list', () => {
  describe('getAllPermits', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('catches error, calls rollback, and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(PermitService.prototype, 'getAllPermits').rejects(new Error('a test error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = getAllPermits();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(dbConnectionObj.rollback).to.have.been.called;
        expect(dbConnectionObj.release).to.have.been.called;
        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });

    it('gets non sample permits', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon
        .stub(PermitService.prototype, 'getAllPermits')
        .resolves([{ id: '1', number: '2', type: '3', coordinator_agency: '4', project_name: '5' }]);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = getAllPermits();

        await requestHandler(mockReq, mockRes, mockNext);
      } catch (actualError) {
        expect.fail();
      }

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql([
        { id: '1', number: '2', type: '3', coordinator_agency: '4', project_name: '5' }
      ]);
    });
  });
});
