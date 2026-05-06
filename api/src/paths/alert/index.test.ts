import chai, { expect } from 'chai';
import { afterEach, describe, it } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { SYSTEM_IDENTITY_SOURCE } from '../../constants/database';
import { SYSTEM_ROLE } from '../../constants/roles';
import { AlertSeverity } from '../../database-units/alert_severity';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { AlertRecordWithStatus } from '../../models/alert-view';
import { AlertService } from '../../services/alert-service';
import { createAlert, getAlerts } from '../alert';

chai.use(sinonChai);

describe('getAlerts', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('as a system user', () => {
    it('returns a list of system alerts', async () => {
      const mockTotal = 10;
      const mockAlerts: AlertRecordWithStatus[] = [
        {
          alert_id: 1,
          name: 'Alert 1',
          message: 'Message 1',
          alert_type_id: 1,
          severity: AlertSeverity.ERROR,
          status: 'active',
          data: null,
          record_end_date: null,
          create_date: '2020-01-01T10:10:10'
        },
        {
          alert_id: 2,
          name: 'Alert 2',
          message: 'Message 2',
          alert_type_id: 2,
          severity: AlertSeverity.ERROR,
          status: 'active',
          data: null,
          record_end_date: null,
          create_date: '2020-01-01T10:10:10'
        }
      ];
      const mockFilters = { types: 'Surveys', expiresBefore: '2020-01-01', expiresAfter: undefined };
      const mockPaginationParams = { page: '1', limit: '10', sort: undefined, order: undefined };

      const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const getAlertsStub = sinon.stub(AlertService.prototype, 'getAlerts').resolves(mockAlerts);
      const getAlertsCountStub = sinon.stub(AlertService.prototype, 'getAlertsCount').resolves(mockTotal);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
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

      mockReq.query = {
        ...mockFilters,
        ...mockPaginationParams
      };

      const requestHandler = getAlerts();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.commit).to.have.been.calledOnce;

      expect(getAlertsStub).to.have.been.calledOnceWith(mockFilters, {
        ...mockPaginationParams,
        page: Number(mockPaginationParams.page),
        limit: Number(mockPaginationParams.limit)
      });
      expect(getAlertsCountStub).to.have.been.calledOnceWith(mockFilters);

      expect(mockRes.jsonValue.pagination).not.to.be.null;
      expect(mockRes.jsonValue).to.eql({
        alerts: mockAlerts,
        pagination: { total: mockTotal, per_page: 10, current_page: 1, last_page: 1, sort: undefined, order: undefined }
      });
    });

    it('handles errors gracefully', async () => {
      const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      sinon.stub(AlertService.prototype, 'getAlerts').rejects(new Error('a test error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
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

describe('createAlert', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('creates a new alert', async () => {
    const mockAlert = {
      name: 'New Alert',
      message: 'New alert message',
      alert_type_id: 1,
      severity: AlertSeverity.INFO
    };

    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(AlertService.prototype, 'createAlert').resolves(1);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.body = mockAlert;

    const requestHandler = createAlert();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql({ alert_id: 1 });
    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
  });

  it('handles errors gracefully', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(AlertService.prototype, 'createAlert').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = createAlert();

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
