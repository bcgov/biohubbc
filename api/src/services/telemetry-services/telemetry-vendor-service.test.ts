import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { TelemetryManualRepository } from '../../repositories/telemetry-repositories/telemetry-manual-repository';
import { TelemetryVendorRepository } from '../../repositories/telemetry-repositories/telemetry-vendor-repository';
import { getMockDBConnection } from '../../__mocks__/db';
import { TelemetryVendorService } from './telemetry-vendor-service';

chai.use(sinonChai);

describe('TelemetryVendorService', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should create a new TelemetryVendorService', () => {
      const service = new TelemetryVendorService(getMockDBConnection());

      expect(service.vendorRepository).to.be.an.instanceOf(TelemetryVendorRepository);
      expect(service.connection).to.exist;
    });
  });

  describe('getTelemetryForDeployment', () => {
    it('should return telemetry data for a single deployment', async () => {
      const mockDBConnection = getMockDBConnection();
      const repoStub = sinon.stub(TelemetryVendorRepository.prototype, 'getTelemetryByDeploymentIds').resolves([]);

      const service = new TelemetryVendorService(mockDBConnection);

      const data = await service.getTelemetryForDeployment(1, 1);

      expect(repoStub).to.have.been.calledWith(1, [1], undefined);
      expect(data).to.deep.equal([]);
    });
  });

  describe('getTelemetryForDeployments', () => {
    it('should return telemetry data for a single deployment', async () => {
      const mockDBConnection = getMockDBConnection();
      const repoStub = sinon.stub(TelemetryVendorRepository.prototype, 'getTelemetryByDeploymentIds').resolves([]);

      const service = new TelemetryVendorService(mockDBConnection);

      const data = await service.getTelemetryForDeployments(1, [1, 2]);

      expect(repoStub).to.have.been.calledWith(1, [1, 2], undefined);
      expect(data).to.deep.equal([]);
    });
  });

  describe('getTelemetryForCritter', () => {
    it('should return telemetry data for a single critter', async () => {
      const mockDBConnection = getMockDBConnection();
      const repoStub = sinon.stub(TelemetryVendorRepository.prototype, 'getTelemetryByDeploymentIds').resolves([]);

      const service = new TelemetryVendorService(mockDBConnection);

      const deploymentServiceStub = sinon
        .stub(service.deploymentService, 'getDeploymentsForCritterId')
        .resolves([{ deployment2_id: 8 } as any]);

      const data = await service.getTelemetryForCritter(1, 1);

      expect(deploymentServiceStub).to.have.been.calledWith(1, 1);
      expect(repoStub).to.have.been.calledWith(1, [8], undefined);
      expect(data).to.deep.equal([]);
    });
  });

  describe('getTelemetryForSurvey', () => {
    it('should return telemetry data for a survey', async () => {
      const mockDBConnection = getMockDBConnection();
      const repoStub = sinon.stub(TelemetryVendorRepository.prototype, 'getTelemetryByDeploymentIds').resolves([]);

      const service = new TelemetryVendorService(mockDBConnection);

      const deploymentServiceStub = sinon
        .stub(service.deploymentService, 'getDeploymentsForSurveyId')
        .resolves([{ deployment2_id: 8 } as any]);

      const data = await service.getTelemetryForSurvey(1);

      expect(deploymentServiceStub).to.have.been.calledWith(1);
      expect(repoStub).to.have.been.calledWith(1, [8], undefined);
      expect(data).to.deep.equal([]);
    });
  });

  describe('bulkCreateManualTelemetry', () => {
    it('should create manual telemetry records', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new TelemetryVendorService(mockDBConnection);

      const repoStub = sinon.stub(TelemetryManualRepository.prototype, 'bulkCreateManualTelemetry');
      const validateStub = sinon.stub(service.deploymentService, 'getDeploymentsByIds').resolves([true] as any);

      await service.bulkCreateManualTelemetry(1, [
        {
          deployment2_id: 1,
          latitude: 1,
          longitude: 1,
          acquisition_date: '2021-01-01',
          transmission_date: '2021-01-01'
        }
      ]);

      expect(validateStub).to.have.been.calledWith(1, [1]);
      expect(repoStub).to.have.been.calledWith([
        {
          deployment2_id: 1,
          latitude: 1,
          longitude: 1,
          acquisition_date: '2021-01-01',
          transmission_date: '2021-01-01'
        }
      ]);
    });

    it('should throw error when survey missing reference to one or many deployment IDs', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new TelemetryVendorService(mockDBConnection);

      sinon.stub(service.deploymentService, 'getDeploymentsByIds').resolves([]);

      try {
        await service.bulkCreateManualTelemetry(1, [
          {
            deployment2_id: 1,
            latitude: 1,
            longitude: 1,
            acquisition_date: '2021-01-01',
            transmission_date: '2021-01-01'
          }
        ]);
        expect.fail();
      } catch (error: any) {
        expect(error.message).to.equal('Failed to create manual telemetry');
      }
    });
  });

  describe('bulkUpdateManualTelemetry', () => {
    it('should update manual telemetry records', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new TelemetryVendorService(mockDBConnection);

      const repoStub = sinon.stub(TelemetryManualRepository.prototype, 'bulkUpdateManualTelemetry');
      const validateStub = sinon.stub(service.manualRepository, 'getManualTelemetryByIds').resolves([true] as any);

      await service.bulkUpdateManualTelemetry(1, [
        {
          telemetry_manual_id: '09556e24-153b-4dbb-add6-f00e74131e48',
          deployment2_id: 1,
          latitude: 1,
          longitude: 1,
          acquisition_date: '2021-01-01',
          transmission_date: '2021-01-01'
        }
      ]);

      expect(validateStub).to.have.been.calledWith(1, ['09556e24-153b-4dbb-add6-f00e74131e48']);
      expect(repoStub).to.have.been.calledWith([
        {
          telemetry_manual_id: '09556e24-153b-4dbb-add6-f00e74131e48',
          deployment2_id: 1,
          latitude: 1,
          longitude: 1,
          acquisition_date: '2021-01-01',
          transmission_date: '2021-01-01'
        }
      ]);
    });

    it('should throw error when survey missing reference to one or many telemetry manual IDs', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new TelemetryVendorService(mockDBConnection);

      sinon.stub(service.manualRepository, 'getManualTelemetryByIds').resolves([]);

      try {
        await service.bulkUpdateManualTelemetry(1, [
          {
            telemetry_manual_id: '09556e24-153b-4dbb-add6-f00e74131e48',
            deployment2_id: 1,
            latitude: 1,
            longitude: 1,
            acquisition_date: '2021-01-01',
            transmission_date: '2021-01-01'
          }
        ]);
        expect.fail();
      } catch (error: any) {
        expect(error.message).to.equal('Failed to update manual telemetry');
      }
    });
  });

  describe('bulkDeleteManualTelemetry', () => {
    it('should update manual telemetry records', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new TelemetryVendorService(mockDBConnection);

      const repoStub = sinon.stub(TelemetryManualRepository.prototype, 'bulkDeleteManualTelemetry');
      const validateStub = sinon.stub(service.manualRepository, 'getManualTelemetryByIds').resolves([true] as any);

      await service.bulkDeleteManualTelemetry(1, ['09556e24-153b-4dbb-add6-f00e74131e48']);

      expect(validateStub).to.have.been.calledWith(1, ['09556e24-153b-4dbb-add6-f00e74131e48']);
      expect(repoStub).to.have.been.calledWith(['09556e24-153b-4dbb-add6-f00e74131e48']);
    });

    it('should throw error when survey missing reference to one or many telemetry manual IDs', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new TelemetryVendorService(mockDBConnection);

      sinon.stub(service.manualRepository, 'getManualTelemetryByIds').resolves([]);

      try {
        await service.bulkDeleteManualTelemetry(1, ['09556e24-153b-4dbb-add6-f00e74131e48']);
        expect.fail();
      } catch (error: any) {
        expect(error.message).to.equal('Failed to delete manual telemetry');
      }
    });
  });
});
