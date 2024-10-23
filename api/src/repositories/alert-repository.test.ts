import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { IAlertSeverity } from '../models/alert-view';
import { getMockDBConnection } from '../__mocks__/db';
import { AlertRepository } from './alert-repository';

chai.use(sinonChai);

describe('AlertRepository', () => {
  it('should construct', () => {
    const mockDBConnection = getMockDBConnection();
    const alertRepository = new AlertRepository(mockDBConnection);

    expect(alertRepository).to.be.instanceof(AlertRepository);
  });

  describe('getAlerts', () => {
    it('should return an array of alerts with empty filters', async () => {
      const mockRows = [
        {
          alert_id: 1,
          name: 'Alert 1',
          message: 'This is an alert.',
          alert_type_id: 1,
          data: {},
          severity: 'error' as IAlertSeverity,
          record_end_date: null,
          status: 'active'
        }
      ];
      const mockQueryResponse = { rows: mockRows, rowCount: 1 } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        knex: sinon.stub().resolves(mockQueryResponse)
      });

      const alertRepository = new AlertRepository(mockDBConnection);

      const response = await alertRepository.getAlerts({});

      expect(response).to.be.an('array').that.is.not.empty;
      expect(response[0]).to.have.property('alert_id', 1);
    });

    it('should apply filters when provided', async () => {
      const mockRows = [
        {
          alert_id: 1,
          name: 'Alert 1',
          message: 'This is an alert.',
          alert_type_id: 1,
          data: {},
          severity: 'error',
          record_end_date: null,
          status: 'active'
        }
      ];
      const mockQueryResponse = { rows: mockRows, rowCount: 1 } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        knex: sinon.stub().resolves(mockQueryResponse)
      });

      const alertRepository = new AlertRepository(mockDBConnection);

      const response = await alertRepository.getAlerts({ recordEndDate: '2024-01-01', types: ['type1'] });

      expect(response).to.be.an('array').that.is.not.empty;
    });
  });

  describe('getAlertById', () => {
    it('should return a specific alert by its Id', async () => {
      const mockRows = [
        {
          alert_id: 1,
          name: 'Alert 1',
          message: 'This is an alert.',
          alert_type_id: 1,
          data: {},
          severity: 'error',
          record_end_date: null,
          status: 'active'
        }
      ];
      const mockQueryResponse = { rows: mockRows, rowCount: 1 } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        knex: sinon.stub().resolves(mockQueryResponse)
      });

      const alertRepository = new AlertRepository(mockDBConnection);

      const response = await alertRepository.getAlertById(1);

      expect(response).to.have.property('alert_id', 1);
    });
  });

  describe('updateAlert', () => {
    it('should update an alert and return its Id', async () => {
      const mockRows = [{ alert_id: 1 }];
      const mockQueryResponse = { rows: mockRows } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const alertRepository = new AlertRepository(mockDBConnection);
      const alert = {
        alert_id: 1,
        name: 'Updated Alert',
        message: 'Updated message',
        alert_type_id: 1,
        data: {},
        severity: 'error' as IAlertSeverity,
        record_end_date: null
      };

      const response = await alertRepository.updateAlert(alert);

      expect(response).to.equal(1);
    });
  });

  describe('createAlert', () => {
    it('should create an alert and return its Id', async () => {
      const mockRows = [{ alert_id: 1 }];
      const mockQueryResponse = { rows: mockRows } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const alertRepository = new AlertRepository(mockDBConnection);
      const alert = {
        name: 'New Alert',
        message: 'New alert message',
        alert_type_id: 1,
        data: {},
        severity: 'error' as IAlertSeverity,
        record_end_date: null
      };

      const response = await alertRepository.createAlert(alert);

      expect(response).to.equal(1);
    });
  });

  describe('deactivateAlert', () => {
    it('should deactivate an alert and return its Id', async () => {
      const mockRows = [{ alert_id: 1 }];
      const mockQueryResponse = { rows: mockRows } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const alertRepository = new AlertRepository(mockDBConnection);

      const response = await alertRepository.deactivateAlert(1, '2024-01-01');

      expect(response).to.equal(1);
    });
  });

  describe('deleteAlert', () => {
    it('should delete an alert and return its Id', async () => {
      const mockRows = [{ alert_id: 1 }];
      const mockQueryResponse = { rows: mockRows } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const alertRepository = new AlertRepository(mockDBConnection);

      const response = await alertRepository.deleteAlert(1);

      expect(response).to.equal(1);
    });
  });
});
