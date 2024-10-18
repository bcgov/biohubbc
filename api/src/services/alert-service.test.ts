import chai, { expect } from 'chai';
import { afterEach, describe, it } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { IAlert, IAlertCreateObject, IAlertFilterObject, IAlertSeverity } from '../models/alert-view';
import { AlertRepository } from '../repositories/alert-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { AlertService } from './alert-service';

chai.use(sinonChai);

describe('AlertService', () => {
  let alertService: AlertService;
  let mockAlertRepository: sinon.SinonStubbedInstance<AlertRepository>;

  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    const dbConnection = getMockDBConnection();
    alertService = new AlertService(dbConnection);
    mockAlertRepository = sinon.createStubInstance(AlertRepository);
    alertService.alertRepository = mockAlertRepository; // Inject the mocked repository
  });

  describe('getAlerts', () => {
    it('returns an array of alerts', async () => {
      const mockAlerts: IAlert[] = [
        {
          alert_id: 1,
          name: 'Alert 1',
          message: 'Message 1',
          alert_type_id: 1,
          data: {},
          severity: 'error' as IAlertSeverity,
          status: 'active',
          record_end_date: null
        }
      ];

      mockAlertRepository.getAlerts.resolves(mockAlerts);

      const filterObject: IAlertFilterObject = {}; // Define your filter object as needed

      const response = await alertService.getAlerts(filterObject);

      expect(response).to.eql(mockAlerts);
      expect(mockAlertRepository.getAlerts).to.have.been.calledOnceWith(filterObject);
    });
  });

  describe('getAlertById', () => {
    it('returns a specific alert by its Id', async () => {
      const mockAlert: IAlert = {
        alert_id: 1,
        name: 'Alert 1',
        message: 'Message 1',
        alert_type_id: 1,
        data: {},
        severity: 'error' as IAlertSeverity,
        status: 'active',
        record_end_date: null
      };

      mockAlertRepository.getAlertById.resolves(mockAlert);

      const response = await alertService.getAlertById(1);

      expect(response).to.eql(mockAlert);
      expect(mockAlertRepository.getAlertById).to.have.been.calledOnceWith(1);
    });
  });

  describe('createAlert', () => {
    it('creates an alert and returns its Id', async () => {
      const mockAlertId = 1;
      const mockAlert: IAlertCreateObject = {
        name: 'New Alert',
        message: 'New alert message',
        alert_type_id: 1,
        data: {},
        severity: 'error' as IAlertSeverity,
        record_end_date: null
      };

      mockAlertRepository.createAlert.resolves(mockAlertId);

      const response = await alertService.createAlert(mockAlert);

      expect(response).to.equal(mockAlertId);
      expect(mockAlertRepository.createAlert).to.have.been.calledOnceWith(mockAlert);
    });
  });

  describe('updateAlert', () => {
    it('updates an alert and returns its Id', async () => {
      const mockAlertId = 1;
      const mockAlert: IAlert = {
        alert_id: mockAlertId,
        name: 'Updated Alert',
        message: 'Updated message',
        alert_type_id: 1,
        data: {},
        severity: 'error' as IAlertSeverity,
        status: 'active',
        record_end_date: null
      };

      mockAlertRepository.updateAlert.resolves(mockAlertId);

      const response = await alertService.updateAlert(mockAlert);

      expect(response).to.equal(mockAlertId);
      expect(mockAlertRepository.updateAlert).to.have.been.calledOnceWith(mockAlert);
    });
  });

  describe('deactivateAlert', () => {
    it('deactivates an alert and returns its Id', async () => {
      const mockAlertId = 1;
      mockAlertRepository.deactivateAlert.resolves(mockAlertId);

      const response = await alertService.deactivateAlert(mockAlertId, '2024-01-01');

      expect(response).to.equal(mockAlertId);
      expect(mockAlertRepository.deactivateAlert).to.have.been.calledOnceWith(mockAlertId, '2024-01-01');
    });
  });

  describe('deleteAlert', () => {
    it('deletes an alert and returns its Id', async () => {
      const mockAlertId = 1;
      mockAlertRepository.deleteAlert.resolves(mockAlertId);

      const response = await alertService.deleteAlert(mockAlertId);

      expect(response).to.equal(mockAlertId);
      expect(mockAlertRepository.deleteAlert).to.have.been.calledOnceWith(mockAlertId);
    });
  });
});
