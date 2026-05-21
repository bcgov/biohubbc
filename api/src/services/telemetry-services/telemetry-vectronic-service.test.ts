import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../__mocks__/db';
import { envConfigDependencies as env } from '../../utils/env-config';
import { TelemetryVectronicService } from './telemetry-vectronic-service';

chai.use(sinonChai);

describe('TelemetryVectronicService', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('vectronicClient', () => {
    it('should create a new Axios client with the correct base URL', () => {
      sinon.stub(env, 'getEnvironmentVariable').returns('https://api.vectronic-wildlife.com/v2');

      const service = new TelemetryVectronicService(getMockDBConnection());

      expect(service.vectronicClient.defaults.baseURL).to.equal('https://api.vectronic-wildlife.com/v2');
    });
  });

  describe('fetchTelemetryFromVectronic', () => {
    it('should fetch telemetry data from the Vectronic API', async () => {
      const mockAxiosResponse = {
        data: [
          {
            KEY_A: 'valueA'
          }
        ]
      };

      const service = new TelemetryVectronicService(getMockDBConnection());
      const axiosStub = sinon.stub(service.vectronicClient, 'get').resolves(mockAxiosResponse);

      const query = {
        idcollar: 1,
        collarkey: 'test-collar-key',
        beforeAcquisition: '2021-01-01',
        afterAcquisition: '2021-01-01',
        gtId: 1
      };

      const telemetry = await service.fetchTelemetryFromVectronic(query);

      expect(axiosStub).to.have.been.calledOnceWithExactly('/collar/1/gps', {
        params: {
          collarkey: 'test-collar-key',
          beforeAcquisition: '2021-01-01',
          afterAcquisition: '2021-01-01',
          ['gt-id']: 1
        }
      });

      expect(telemetry).to.deep.equal([{ key_a: 'valueA' }]);
    });
  });

  describe('fetchTelemetryCountFromVectronic', () => {
    it('should fetch telemetry count from the Vectronic API', async () => {
      const mockAxiosResponse = {
        data: 1
      };

      const service = new TelemetryVectronicService(getMockDBConnection());
      const axiosStub = sinon.stub(service.vectronicClient, 'get').resolves(mockAxiosResponse);

      const query = {
        idcollar: 1,
        collarkey: 'test-collar-key',
        beforeAcquisition: '2021-01-01',
        afterAcquisition: '2021-01-01',
        gtId: 1
      };

      const telemetry = await service.fetchTelemetryCountFromVectronic(query);

      expect(axiosStub).to.have.been.calledOnceWithExactly('/collar/1/gps/count', {
        params: {
          collarkey: 'test-collar-key',
          beforeAcquisition: '2021-01-01',
          afterAcquisition: '2021-01-01',
          ['gt-id']: 1
        }
      });

      expect(telemetry).to.equal(1);
    });
  });

  describe('getDeviceCredentials', () => {
    it('should fetch Vectronic device credentials', async () => {
      const service = new TelemetryVectronicService(getMockDBConnection());
      const repoStub = sinon
        .stub(service.telemetryVectronicRepository, 'getAllVectronicCredentials')
        .resolves([true] as any);

      const credentials = await service.getDeviceCredentials();

      expect(repoStub).to.have.been.calledOnceWithExactly();
      expect(credentials).to.deep.equal([true]);
    });
  });

  describe('batchCreateTelemetry', () => {
    it('should batch insert telemetry data', async () => {
      const service = new TelemetryVectronicService(getMockDBConnection());
      const telemetry = [{ id: 1 }, { id: 2 }];

      const repoStub = sinon.stub(service.telemetryVectronicRepository, 'createVectronicTelemetry').resolves(1);

      const inserted = await service.batchCreateTelemetry(telemetry as any, 1);

      expect(repoStub.getCall(0)).to.have.been.calledWithExactly([{ id: 1 }]);
      expect(repoStub.getCall(1)).to.have.been.calledWithExactly([{ id: 2 }]);
      expect(repoStub).to.have.been.calledTwice;
      expect(inserted).to.deep.equal(2);
    });
  });

  describe('getDevicesActivityMap', () => {
    it('should return a map of device activity', async () => {
      const service = new TelemetryVectronicService(getMockDBConnection());
      const repoStub = sinon
        .stub(service.telemetryVectronicRepository, 'getDeviceActivityStatistics')
        .resolves([{ serial: 1, telemetry_count: 2, max_idposition: 2 }] as any);

      const activity = await service.getDevicesActivitiesMap();

      expect(repoStub).to.have.been.calledOnceWithExactly();
      expect(activity).to.deep.equal(new Map([[1, { telemetryCount: 2, maxIdposition: 2 }]]));
    });
  });

  describe('processTelemetry', () => {
    it('should not fetch telemetry when Vectronic count is equal to SIMS count', async () => {
      const service = new TelemetryVectronicService(getMockDBConnection());
      const tasks = [
        { serial: 1, key: 'key1' },
        { serial: 2, key: 'key2' }
      ];

      const activityStub = sinon.stub(service, 'getDevicesActivitiesMap');
      const countStub = sinon.stub(service, 'fetchTelemetryCountFromVectronic');
      const telemetryStub = sinon.stub(service, 'fetchTelemetryFromVectronic');

      activityStub.resolves(
        new Map([
          [1, { telemetryCount: 2, maxIdposition: 2 }],
          [2, { telemetryCount: 2, maxIdposition: 2 }]
        ])
      );
      countStub.resolves(2);

      const results = await service.processTelemetry(tasks, { concurrently: 1, batchSize: 1 });

      expect(activityStub).to.have.been.calledOnce;

      expect(countStub.getCall(0)).to.have.been.calledWithExactly({ idcollar: 1, collarkey: 'key1' });
      expect(countStub.getCall(1)).to.have.been.calledWithExactly({ idcollar: 2, collarkey: 'key2' });

      expect(telemetryStub).not.to.have.been.called;
      expect(results).to.deep.equal([
        {
          task: { serial: 1, key: 'key1' },
          value: { new: 0, created: 0 }
        },
        {
          task: { serial: 2, key: 'key2' },
          value: { new: 0, created: 0 }
        }
      ]);
    });

    it('should fetch telemetry when Vectronic count is more than SIMS count', async () => {
      const service = new TelemetryVectronicService(getMockDBConnection());
      const tasks = [
        { serial: 1, key: 'key1' },
        { serial: 2, key: 'key2' }
      ];

      const activityStub = sinon.stub(service, 'getDevicesActivitiesMap');
      const countStub = sinon.stub(service, 'fetchTelemetryCountFromVectronic');
      const telemetryStub = sinon.stub(service, 'fetchTelemetryFromVectronic');
      const createStub = sinon.stub(service, 'batchCreateTelemetry');

      activityStub.resolves(
        new Map([
          [1, { telemetryCount: 2, maxIdposition: 3 }],
          [2, { telemetryCount: 2, maxIdposition: 3 }]
        ])
      );
      countStub.resolves(3);

      await service.processTelemetry(tasks, { concurrently: 1, batchSize: 1 });

      expect(activityStub).to.have.been.calledOnce;

      expect(countStub.getCall(0)).to.have.been.calledWithExactly({ idcollar: 1, collarkey: 'key1' });
      expect(countStub.getCall(1)).to.have.been.calledWithExactly({ idcollar: 2, collarkey: 'key2' });

      expect(telemetryStub.getCall(0)).to.have.been.calledWithExactly({
        idcollar: 1,
        collarkey: 'key1',
        afterAcquisition: undefined,
        beforeAcquisition: undefined,
        gtId: 3
      });

      expect(telemetryStub.getCall(1)).to.have.been.calledWithExactly({
        idcollar: 2,
        collarkey: 'key2',
        afterAcquisition: undefined,
        beforeAcquisition: undefined,
        gtId: 3
      });

      expect(createStub).to.have.been.calledTwice;
    });
  });
});
