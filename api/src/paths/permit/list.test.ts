import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import * as db from '../../database/db';
import { ApiGeneralError } from '../../errors/custom-error';
import { IPermitModel } from '../../repositories/permit-repository';
import { PermitService } from '../../services/permit-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as list from './list';

describe('listUserPermits', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns a list of permits', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const mockPermit1: IPermitModel = {
      permit_id: 1,
      survey_id: 1,
      number: '123456',
      type: 'permit type',
      create_date: new Date().toISOString(),
      create_user: 1,
      update_date: null,
      update_user: null,
      revision_count: 0
    };

    const mockPermit2: IPermitModel = {
      permit_id: 2,
      survey_id: 2,
      number: '654321',
      type: 'permit type',
      create_date: new Date().toISOString(),
      create_user: 2,
      update_date: new Date().toISOString(),
      update_user: 2,
      revision_count: 1
    };

    sinon.stub(PermitService.prototype, 'getPermitByUser').resolves([mockPermit1, mockPermit2]);

    const requestHandler = list.listUserPermits();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.jsonValue).to.eql({ permits: [mockPermit1, mockPermit2] });
  });

  it('should throw an error if getPermitByUser throws an Error', async () => {
    const dbConnectionObj = getMockDBConnection({
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {};

    sinon.stub(PermitService.prototype, 'getPermitByUser').throws(('error' as unknown) as ApiGeneralError);

    try {
      const requestHandler = list.listUserPermits();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(dbConnectionObj.commit).to.not.be.called;
      expect(dbConnectionObj.rollback).to.be.calledOnce;
      expect(dbConnectionObj.release).to.be.calledOnce;
    }
  });
});
