import { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { getMockDBConnection } from '../../__mocks__/db';
import { TelemetryDeploymentRepository } from './telemetry-deployment-repository';
import { CreateDeployment, UpdateDeployment } from './telemetry-deployment-repository.interface';

describe('TelemetryDeploymentRepository', () => {
  beforeEach(() => {});

  afterEach(() => {
    sinon.restore();
  });

  describe('createDeployment', () => {
    it('should create a deployment successfully', async () => {
      const mockResponse = {
        rowCount: 1,
        rows: []
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const telemetryDeploymentRepository = new TelemetryDeploymentRepository(mockDbConnection);

      const deployment: CreateDeployment = {
        survey_id: 1,
        critter_id: 1,
        device_id: 1,
        frequency: 1,
        frequency_unit_id: 1,
        attachment_start_date: '2023-01-01',
        attachment_start_time: '12:00:00',
        attachment_end_date: '2023-01-02',
        attachment_end_time: '12:00:00',
        critterbase_start_capture_id: '123-456-789',
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null
      };

      await telemetryDeploymentRepository.createDeployment(deployment);

      expect(mockDbConnection.sql).to.have.been.calledOnce;
    });

    it('should throw an error if the deployment creation fails', async () => {
      const mockResponse = {
        rowCount: 0,
        rows: []
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const telemetryDeploymentRepository = new TelemetryDeploymentRepository(mockDbConnection);

      const deployment: CreateDeployment = {
        survey_id: 1,
        critter_id: 1,
        device_id: 1,
        frequency: 1,
        frequency_unit_id: 1,
        attachment_start_date: '2023-01-01',
        attachment_start_time: '12:00:00',
        attachment_end_date: '2023-01-02',
        attachment_end_time: '12:00:00',
        critterbase_start_capture_id: '123-456-789',
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null
      };

      try {
        await telemetryDeploymentRepository.createDeployment(deployment);
      } catch (error) {
        expect(error).to.be.instanceOf(ApiExecuteSQLError);
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to create deployment');
      }
    });
  });

  describe('getDeploymentsByIds', () => {
    it('should get a deployment by ID successfully', async () => {
      const mockDeploymentRecord = {
        deployment2_id: 1,
        survey_id: 1,
        critter_id: 1,
        device_id: 1,
        frequency: 1,
        frequency_unit_id: 1,
        attachment_start_date: '2023-01-01',
        attachment_start_time: '12:00:00',
        attachment_end_date: '2023-01-02',
        attachment_end_time: '12:00:00',
        critterbase_start_capture_id: '123-456-789',
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null,
        device_make_id: 1,
        model: 'Model',
        critterbase_critter_id: 1
      };

      const mockResponse = {
        rowCount: 1,
        rows: [mockDeploymentRecord]
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const telemetryDeploymentRepository = new TelemetryDeploymentRepository(mockDbConnection);

      const surveyId = 1;
      const deploymentId = 2;

      const response = await telemetryDeploymentRepository.getDeploymentsByIds(surveyId, [deploymentId]);

      expect(response).to.eql([mockDeploymentRecord]);
    });

    it('should throw an error if the deployment is not found', async () => {
      const mockResponse = {
        rowCount: 0,
        rows: []
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const telemetryDeploymentRepository = new TelemetryDeploymentRepository(mockDbConnection);

      const surveyId = 1;
      const deploymentId = 2;

      try {
        await telemetryDeploymentRepository.getDeploymentsByIds(surveyId, [deploymentId]);
      } catch (error) {
        expect(error).to.be.instanceOf(ApiExecuteSQLError);
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to get deployment');
      }
    });
  });

  describe('getDeploymentsForSurveyId', () => {
    it('should get deployments by survey ID successfully', async () => {
      const mockDeploymentRecord = {
        deployment2_id: 1,
        survey_id: 1,
        critter_id: 1,
        device_id: 1,
        frequency: 1,
        frequency_unit_id: 1,
        attachment_start_date: '2023-01-01',
        attachment_start_time: '12:00:00',
        attachment_end_date: '2023-01-02',
        attachment_end_time: '12:00:00',
        critterbase_start_capture_id: '123-456-789',
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null,
        device_make_id: 1,
        model: 'Model',
        critterbase_critter_id: 1
      };

      const mockResponse = {
        rowCount: 1,
        rows: [mockDeploymentRecord]
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const telemetryDeploymentRepository = new TelemetryDeploymentRepository(mockDbConnection);

      const surveyId = 1;

      const response = await telemetryDeploymentRepository.getDeploymentsForSurveyId(surveyId);

      expect(response).to.eql([mockDeploymentRecord]);
    });
  });

  describe('getDeploymentsForCritterId', () => {
    it('should get deployments by critter ID successfully', async () => {
      const mockDeploymentRecord = {
        deployment2_id: 1,
        survey_id: 1,
        critter_id: 1,
        device_id: 1,
        frequency: 1,
        frequency_unit_id: 1,
        attachment_start_date: '2023-01-01',
        attachment_start_time: '12:00:00',
        attachment_end_date: '2023-01-02',
        attachment_end_time: '12:00:00',
        critterbase_start_capture_id: '123-456-789',
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null,
        device_make_id: 1,
        model: 'Model',
        critterbase_critter_id: 1
      };

      const mockResponse = {
        rowCount: 1,
        rows: [mockDeploymentRecord]
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const telemetryDeploymentRepository = new TelemetryDeploymentRepository(mockDbConnection);

      const surveyId = 1;
      const critterId = 2;

      const response = await telemetryDeploymentRepository.getDeploymentsForCritterId(surveyId, critterId);

      expect(response).to.eql([mockDeploymentRecord]);
    });
  });

  describe('updateDeployment', () => {
    it('should update a deployment successfully', async () => {
      const mockResponse = {
        rowCount: 1,
        rows: []
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const telemetryDeploymentRepository = new TelemetryDeploymentRepository(mockDbConnection);

      const updateDeployment: UpdateDeployment = {
        critter_id: 1,
        device_id: 1,
        frequency: 1,
        frequency_unit_id: 1,
        attachment_start_date: '2023-01-01',
        attachment_start_time: '12:00:00',
        attachment_end_date: '2023-01-02',
        attachment_end_time: '12:00:00',
        critterbase_start_capture_id: '123-456-789',
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null
      };

      const surveyId = 1;
      const deploymentId = 2;

      await telemetryDeploymentRepository.updateDeployment(surveyId, deploymentId, updateDeployment);

      expect(mockDbConnection.sql).to.have.been.calledOnce;
    });

    it('should throw an error if the deployment update fails', async () => {
      const mockResponse = {
        rowCount: 0,
        rows: []
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const telemetryDeploymentRepository = new TelemetryDeploymentRepository(mockDbConnection);

      const updateDeployment: UpdateDeployment = {
        critter_id: 1,
        device_id: 1,
        frequency: 1,
        frequency_unit_id: 1,
        attachment_start_date: '2023-01-01',
        attachment_start_time: '12:00:00',
        attachment_end_date: '2023-01-02',
        attachment_end_time: '12:00:00',
        critterbase_start_capture_id: '123-456-789',
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null
      };

      const surveyId = 1;
      const deploymentId = 2;

      try {
        await telemetryDeploymentRepository.updateDeployment(surveyId, deploymentId, updateDeployment);
      } catch (error) {
        expect(error).to.be.instanceOf(ApiExecuteSQLError);
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to update deployment');
      }
    });
  });

  describe('deleteDeployment', () => {
    it('should delete a deployment successfully', async () => {
      const mockResponse = {
        rowCount: 1,
        rows: []
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const telemetryDeploymentRepository = new TelemetryDeploymentRepository(mockDbConnection);

      const surveyId = 1;
      const deploymentId = 2;

      await telemetryDeploymentRepository.deleteDeployment(surveyId, deploymentId);

      expect(mockDbConnection.sql).to.have.been.calledOnce;
    });

    it('should throw an error if the deployment deletion fails', async () => {
      const mockResponse = {
        rowCount: 0,
        rows: []
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const telemetryDeploymentRepository = new TelemetryDeploymentRepository(mockDbConnection);

      const surveyId = 1;
      const deploymentId = 2;

      try {
        await telemetryDeploymentRepository.deleteDeployment(surveyId, deploymentId);
      } catch (error) {
        expect(error).to.be.instanceOf(ApiExecuteSQLError);
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to delete deployment');
      }
    });
  });

  describe('deleteDeployments', () => {
    it('should delete multiple deployments successfully', async () => {
      const mockResponse = {
        rowCount: 3,
        rows: []
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const telemetryDeploymentRepository = new TelemetryDeploymentRepository(mockDbConnection);

      const surveyId = 1;
      const deploymentIds = [1, 2, 3];

      await telemetryDeploymentRepository.deleteDeployments(surveyId, deploymentIds);

      expect(mockDbConnection.knex).to.have.been.calledOnce;
    });

    it('should throw an error if the multiple deployments deletion fails', async () => {
      const mockResponse = {
        rowCount: 2, // rowCount is less than the number of deploymentIds
        rows: []
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const telemetryDeploymentRepository = new TelemetryDeploymentRepository(mockDbConnection);

      const surveyId = 1;
      const deploymentIds = [1, 2, 3];

      try {
        await telemetryDeploymentRepository.deleteDeployments(surveyId, deploymentIds);
      } catch (error) {
        expect(error).to.be.instanceOf(ApiExecuteSQLError);
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to delete deployments');
      }
    });
  });
});
