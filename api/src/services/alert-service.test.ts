import chai, { expect } from 'chai';
import { afterEach, describe, it } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { AlertRecordWithStatus, IAlertCreateObject, IAlertFilterObject, IAlertSeverity } from '../models/alert-view';
import { AlertRepository } from '../repositories/alert-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { AlertService } from './alert-service';

chai.use(sinonChai);

describe('AlertService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getAlerts', () => {
    it('returns an array of alerts', async () => {
      const mockDBConnection = getMockDBConnection();
      const alertService = new AlertService(mockDBConnection);

      const mockAlerts: AlertRecordWithStatus[] = [
        {
          alert_id: 1,
          name: 'Alert 1',
          message: 'Message 1',
          alert_type_id: 1,
          data: {},
          severity: 'error' as IAlertSeverity,
          status: 'active',
          record_end_date: null,
          create_date: '2020-01-01T10:10:10'
        }
      ];

      const alertStub = sinon.stub(AlertRepository.prototype, 'getAlerts').resolves(mockAlerts);

      const filterObject: IAlertFilterObject = {};

      const response = await alertService.getAlerts(filterObject);

      expect(response).to.eql(mockAlerts);
      expect(alertStub).to.have.been.calledOnceWith(filterObject);
    });
  });

  describe('getAlertsCount', () => {
    it('returns total count of alerts', async () => {
      const mockDBConnection = getMockDBConnection();
      const alertService = new AlertService(mockDBConnection);

      const mockAlertsCount = 10;

      const getAlertsCountStub = sinon.stub(AlertRepository.prototype, 'getAlertsCount').resolves(mockAlertsCount);

      const filterObject: IAlertFilterObject = {};

      const response = await alertService.getAlertsCount(filterObject);

      expect(response).to.eql(mockAlertsCount);
      expect(getAlertsCountStub).to.have.been.calledOnceWith(filterObject);
    });
  });

  describe('getAlertById', () => {
    it('returns a specific alert by its Id', async () => {
      const mockDBConnection = getMockDBConnection();
      const alertService = new AlertService(mockDBConnection);

      const mockAlert: AlertRecordWithStatus = {
        alert_id: 1,
        name: 'Alert 1',
        message: 'Message 1',
        alert_type_id: 1,
        data: {},
        severity: 'error' as IAlertSeverity,
        status: 'active',
        record_end_date: null,
        create_date: '2020-01-01T10:10:10'
      };

      const getAlertByIdStub = sinon.stub(AlertRepository.prototype, 'getAlertById').resolves(mockAlert);

      const response = await alertService.getAlertById(1);

      expect(response).to.eql(mockAlert);
      expect(getAlertByIdStub).to.have.been.calledOnceWith(1);
    });
  });

  describe('createAlert', () => {
    it('creates an alert and returns its Id', async () => {
      const mockDBConnection = getMockDBConnection();
      const alertService = new AlertService(mockDBConnection);

      const mockAlertId = 1;
      const mockAlert: IAlertCreateObject = {
        name: 'New Alert',
        message: 'New alert message',
        alert_type_id: 1,
        data: {},
        severity: 'error' as IAlertSeverity,
        record_end_date: null
      };

      const createAlertStub = sinon.stub(AlertRepository.prototype, 'createAlert').resolves(mockAlertId);

      const response = await alertService.createAlert(mockAlert);

      expect(response).to.equal(mockAlertId);
      expect(createAlertStub).to.have.been.calledOnceWith(mockAlert);
    });
  });

  describe('updateAlert', () => {
    it('updates an alert and returns its Id', async () => {
      const mockDBConnection = getMockDBConnection();
      const alertService = new AlertService(mockDBConnection);

      const mockAlertId = 1;
      const mockAlert: AlertRecordWithStatus = {
        alert_id: mockAlertId,
        name: 'Updated Alert',
        message: 'Updated message',
        alert_type_id: 1,
        data: {},
        severity: 'error' as IAlertSeverity,
        status: 'active',
        record_end_date: null,
        create_date: '2020-01-01T10:10:10'
      };

      const updateAlertStub = sinon.stub(AlertRepository.prototype, 'updateAlert').resolves(mockAlertId);

      const response = await alertService.updateAlert(mockAlert);

      expect(response).to.equal(mockAlertId);
      expect(updateAlertStub).to.have.been.calledOnceWith(mockAlert);
    });
  });

  describe('deleteAlert', () => {
    it('deletes an alert and returns its Id', async () => {
      const mockDBConnection = getMockDBConnection();
      const alertService = new AlertService(mockDBConnection);

      const mockAlertId = 1;

      const alertStub = sinon.stub(AlertRepository.prototype, 'deleteAlert').resolves(mockAlertId);

      const response = await alertService.deleteAlert(mockAlertId);

      expect(response).to.equal(mockAlertId);
      expect(alertStub).to.have.been.calledOnceWith(mockAlertId);
    });
  });
});
