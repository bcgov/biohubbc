import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
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
});
