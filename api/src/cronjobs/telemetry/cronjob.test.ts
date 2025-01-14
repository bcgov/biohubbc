import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { TelemetryLotekService } from '../../services/telemetry-services/telemetry-lotek-service';
import { TelemetryVectronicService } from '../../services/telemetry-services/telemetry-vectronic-service';
import { getMockDBConnection } from '../../__mocks__/db';
import * as cronjob from './cronjob';

chai.use(sinonChai);

describe('Telemetry Cronjob', () => {
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

      sinon.stub(db, 'initDBPool').returns(undefined);

      const mockConnection = getMockDBConnection({
        open: sinon.stub(),
        release: sinon.stub()
      });

      sinon.stub(db, 'getAPIUserDBConnection').returns(mockConnection);

      const lotekFetchStub = sinon.stub(TelemetryLotekService.prototype, 'fetchDevicesFromLotek');
      const vectronicFetchStub = sinon.stub(TelemetryVectronicService.prototype, 'getDeviceCredentials');

      const lotekProcessStub = sinon.stub(TelemetryLotekService.prototype, 'processTelemetry');
      const vectronicProcessStub = sinon.stub(TelemetryVectronicService.prototype, 'processTelemetry');

      lotekFetchStub.resolves([{ nDeviceID: 1 }] as any);
      vectronicFetchStub.resolves([{ idcollar: 1, collarkey: 'test-collar-key' }] as any);

      lotekProcessStub.resolves([{ task: { serial: 1 }, value: { new: 1, created: 1 } }]);
      vectronicProcessStub.resolves([{ task: { serial: 1, key: 'test-collar-key' }, value: { new: 1, created: 1 } }]);

      await cronjob.telemetryCronjob();

      expect(mockConnection.open).to.have.been.calledOnceWithExactly({ transaction: false });

      expect(lotekFetchStub).to.have.been.calledOnce;
      expect(vectronicFetchStub).to.have.been.calledOnce;

      expect(lotekProcessStub).to.have.been.calledOnceWithExactly([{ serial: 1 }], {
        concurrently: 2,
        batchSize: 4,
        startDate: undefined,
        endDate: undefined
      });

      expect(vectronicProcessStub).to.have.been.calledOnceWithExactly([{ serial: 1, key: 'test-collar-key' }], {
        concurrently: 2,
        batchSize: 4,
        startDate: undefined,
        endDate: undefined
      });
    });

    it('should always release the connection', async () => {
      sinon.stub(cronjob, 'parseArguments').returns({
        concurrently: 2,
        batchSize: 4,
        startDate: undefined,
        endDate: undefined
      });

      sinon.stub(db, 'initDBPool').returns(undefined);

      const mockConnection = getMockDBConnection({
        open: sinon.stub(),
        release: sinon.stub()
      });

      sinon.stub(db, 'getAPIUserDBConnection').returns(mockConnection);

      sinon.stub(TelemetryLotekService.prototype, 'fetchDevicesFromLotek').rejects('failed');

      try {
        await cronjob.telemetryCronjob();
        expect.fail();
      } catch (err) {
        expect(mockConnection.open).to.have.been.calledOnce;
        expect(mockConnection.release).to.have.been.calledOnce;
      }
    });
  });
});
