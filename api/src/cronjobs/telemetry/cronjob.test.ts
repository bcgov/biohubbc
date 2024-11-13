import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { TelemetryLotekService } from '../../services/telemetry-services/telemetry-lotek-service';
import { TelemetryVectronicService } from '../../services/telemetry-services/telemetry-vectronic-service';
import * as cronjob from './cronjob';

chai.use(sinonChai);

describe.only('Telemetry Cronjob', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('main', () => {
    it('should run successfully and return results', async () => {
      sinon.stub(cronjob, 'parseArguments').returns({
        concurrently: 2,
        batchSize: 4,
        startDate: undefined,
        endDate: undefined
      });

      const lotekFetchStub = sinon.stub(TelemetryLotekService.prototype, 'fetchDevicesFromLotek');
      const vectronicFetchStub = sinon.stub(TelemetryVectronicService.prototype, 'getDeviceCredentials');

      const lotekProcessStub = sinon.stub(TelemetryLotekService.prototype, 'processTelemetry');
      const vectronicProcessStub = sinon.stub(TelemetryVectronicService.prototype, 'processTelemetry');

      lotekFetchStub.resolves([{ nDeviceID: 1 }] as any);
      vectronicFetchStub.resolves([{ idcollar: 1, collarkey: 'test-collar-key' }] as any);

      const poolStub = sinon.stub(db, 'initDBPool');

      await cronjob.telemetryCronjob();

      expect(lotekFetchStub).to.have.been.calledOnce;
      expect(vectronicFetchStub).to.have.been.calledOnce;

      expect(lotekProcessStub).to.have.been.calledOnceWithExactly([{ serial: 1 }], { concurrently: 2, batchSize: 4 });
      expect(vectronicProcessStub).to.have.been.calledOnceWithExactly([{ serial: 1 }], {
        concurrently: 2,
        batchSize: 4
      });

      expect(poolStub).to.have.been.calledOnce;
    });
  });
});
