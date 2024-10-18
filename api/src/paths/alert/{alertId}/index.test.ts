import chai, { expect } from 'chai';
import { afterEach, describe, it } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { deleteAlert } from '.';
import { getAlerts } from '..';
import { SYSTEM_IDENTITY_SOURCE } from '../../../constants/database';
import { SYSTEM_ROLE } from '../../../constants/roles';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/http-error';
import { IAlertSeverity, IAlertStatus } from '../../../models/alert-view';
import { AlertService } from '../../../services/alert-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
chai.use(sinonChai);

describe('getAlerts', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('as a system user', () => {
    it('returns a single system alert', async () => {
      const mockAlert = {
        alert_id: 1,
        name: 'Alert 1',
        message: 'Message 1',
        alert_type_id: 1,
        severity: 'error' as IAlertSeverity,
        status: 'active' as IAlertStatus,
        data: null,
        record_end_date: null
      };

      const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      sinon.stub(AlertService.prototype, 'getAlertById').resolves(mockAlert);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params.alertId = '1';
      mockReq.system_user = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [3],
        role_names: [SYSTEM_ROLE.SYSTEM_ADMIN],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null
      };

      const requestHandler = getAlerts();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql(mockAlert);
      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.commit).to.have.been.calledOnce;
    });

    it('handles errors gracefully', async () => {
      const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      sinon.stub(AlertService.prototype, 'getAlertById').rejects(new Error('a test error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params.alertId = '1';
      const requestHandler = getAlerts();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(mockDBConnection.rollback).to.have.been.calledOnce;
        expect(mockDBConnection.release).to.have.been.calledOnce;
        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});

describe('deleteAlert', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('as a system user', () => {
    it('rejects an unauthorized request', async () => {
      const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      sinon.stub(AlertService.prototype, 'deleteAlert').resolves(1);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params.alertId = '1';
      mockReq.system_user = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [1],
        role_names: [SYSTEM_ROLE.PROJECT_CREATOR], // Creators cannot delete alerts
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null
      };

      const requestHandler = deleteAlert();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(mockDBConnection.rollback).to.have.been.calledOnce;
        expect(mockDBConnection.release).to.have.been.calledOnce;
        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });

  describe('as a system admin user', () => {
    it('deletes an alert and returns the alert id', async () => {
      const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      sinon.stub(AlertService.prototype, 'deleteAlert').resolves(1);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params.alertId = '1';
      mockReq.system_user = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [1],
        role_names: [SYSTEM_ROLE.SYSTEM_ADMIN],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null
      };

      const requestHandler = deleteAlert();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql({ alert_id: 1 });
      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.commit).to.have.been.calledOnce;
    });

    it('handles errors gracefully', async () => {
      const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      sinon.stub(AlertService.prototype, 'deleteAlert').rejects(new Error('a test error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params.alertId = '1';
      const requestHandler = deleteAlert();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(mockDBConnection.rollback).to.have.been.calledOnce;
        expect(mockDBConnection.release).to.have.been.calledOnce;
        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
