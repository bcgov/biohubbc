import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as env from '../../utils/env-config';
import { getMockDBConnection } from '../../__mocks__/db';
import { TelemetryLotekService } from './telemetry-lotek-service';

chai.use(sinonChai);

describe('TelemetryLotekService', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('lotekCient', () => {
    it('should create a new Axios client with the correct base URL', () => {
      sinon.stub(env, 'getEnvironmentVariable').returns('https://webservice.lotek.com');

      const service = new TelemetryLotekService(getMockDBConnection());

      expect(service.lotekClient.defaults.baseURL).to.equal('https://webservice.lotek.com/API');
    });
  });

  describe('fetchTokenFromLotek', () => {
    it('should return the cached token if exists', async () => {
      const service = new TelemetryLotekService(getMockDBConnection());
      const axiosStub = sinon.stub(service.lotekClient, 'post');

      service.token = 'CACHED_TOKEN';

      const token = await service.fetchTokenFromLotek();

      expect(axiosStub).to.not.have.been.called;
      expect(token).to.equal('CACHED_TOKEN');
    });

    it('should fetch a new token from the Lotek API', async () => {
      const service = new TelemetryLotekService(getMockDBConnection());

      const getEnvStub = sinon.stub(env, 'getEnvironmentVariable');

      getEnvStub.onCall(0).returns('test-username');
      getEnvStub.onCall(1).returns('test-password');

      const axiosStub = sinon.stub(service.lotekClient, 'post').resolves({ data: { access_token: 'NEW_TOKEN' } });

      expect(service.token).to.be.undefined;

      const token = await service.fetchTokenFromLotek();

      expect(axiosStub).to.have.been.calledOnceWithExactly(
        '/user/login',
        {
          username: 'test-username',
          password: 'test-password',
          grant_type: 'password'
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      expect(token).to.equal('NEW_TOKEN');
      expect(service.token).to.equal('NEW_TOKEN');
    });
  });

  describe('fetchDevicesFromLotek', () => {
    it('should fetch devices from the Lotek API', async () => {
      const service = new TelemetryLotekService(getMockDBConnection());
      service.token = 'TEST_TOKEN';

      const axiosStub = sinon.stub(service.lotekClient, 'get').resolves({ data: [{ serial: 1 }] });

      const devices = await service.fetchDevicesFromLotek();

      expect(axiosStub).to.have.been.calledOnceWithExactly('/devices', {
        headers: {
          Authorization: `Bearer TEST_TOKEN`
        }
      });

      expect(devices).to.deep.equal([{ serial: 1 }]);
    });
  });

  describe('fetchTelemetryCountFromLotek', () => {
    it('should fetch telemetry count from the Lotek API', async () => {
      const service = new TelemetryLotekService(getMockDBConnection());
      service.token = 'TEST_TOKEN';

      const axiosStub = sinon.stub(service.lotekClient, 'get').resolves({ data: 'Number of positions: 10' });

      const count = await service.fetchTelemetryCountFromLotek({
        deviceId: 1,
        dtStart: '2021-01-01',
        dtEnd: '2021-01-01'
      });

      expect(axiosStub).to.have.been.calledOnceWithExactly('/gps/count', {
        params: {
          deviceId: 1,
          dtStart: '2021-01-01',
          dtEnd: '2021-01-01'
        },
        headers: {
          Authorization: `Bearer TEST_TOKEN`
        }
      });

      expect(count).to.equal(10);
    });

    it('should convert all numbers correctly from response string', async () => {
      const service = new TelemetryLotekService(getMockDBConnection());
      service.token = 'TEST_TOKEN';

      const axiosStub = sinon.stub(service.lotekClient, 'get');

      axiosStub.onCall(0).resolves({ data: 'Number of positions: 10' });
      const count = await service.fetchTelemetryCountFromLotek({
        deviceId: 1,
        dtStart: '2021-01-01',
        dtEnd: '2021-01-01'
      });
      expect(count).to.equal(10);

      axiosStub.onCall(1).resolves({ data: 'Number of positions: 0' });
      const count1 = await service.fetchTelemetryCountFromLotek({
        deviceId: 1,
        dtStart: '2021-01-01',
        dtEnd: '2021-01-01'
      });
      expect(count1).to.equal(0);

      try {
        axiosStub.onCall(2).resolves({ data: 'Number of positions: ' });
        await service.fetchTelemetryCountFromLotek({
          deviceId: 1,
          dtStart: '2021-01-01',
          dtEnd: '2021-01-01'
        });
        expect.fail();
      } catch (err: any) {
        expect(err.message).to.equal('Failed to fetch device telemetry count from Lotek.');
      }
    });
  });

  describe('getDevicesActivitiesMap', () => {
    it('should return a map of device activities', async () => {
      const service = new TelemetryLotekService(getMockDBConnection());
      const repoStub = sinon
        .stub(service.telemetryLotekRepository, 'getDeviceActivityStatistics')
        .resolves([{ serial: 1, telemetry_count: 2, last_acquisition: '2021-01-01' }]);

      const activity = await service.getDevicesActivitiesMap();

      expect(repoStub).to.have.been.calledOnceWithExactly();
      expect(activity).to.deep.equal(new Map([[1, { telemetryCount: 2, lastAcquisition: '2021-01-01' }]]));
    });
  });

  describe('batchCreateTelemetry', () => {
    it('should batch insert telemetry data', async () => {
      const service = new TelemetryLotekService(getMockDBConnection());
      const telemetry = [{ id: 1 }, { id: 2 }];

      const repoStub = sinon.stub(service.telemetryLotekRepository, 'createLotekTelemetry').resolves(1);

      const inserted = await service.batchCreateTelemetry(telemetry as any, 1);

      expect(repoStub.getCall(0)).to.have.been.calledWithExactly([{ id: 1 }]);
      expect(repoStub.getCall(1)).to.have.been.calledWithExactly([{ id: 2 }]);
      expect(repoStub).to.have.been.calledTwice;
      expect(inserted).to.deep.equal(2);
    });
  });

  describe('processTelemetry', () => {
    it('should not fetch telemetry when Lotek count is equal to SIMS count', async () => {
      const service = new TelemetryLotekService(getMockDBConnection());
      const tasks = [{ serial: 1 }, { serial: 2 }];

      const activityStub = sinon.stub(service, 'getDevicesActivitiesMap');
      const countStub = sinon.stub(service, 'fetchTelemetryCountFromLotek');
      const telemetryStub = sinon.stub(service, 'fetchTelemetryFromLotek');

      activityStub.resolves(
        new Map([
          [1, { telemetryCount: 2, lastAcquisition: '2021-01-01' }],
          [2, { telemetryCount: 2, lastAcquisition: '2021-01-01' }]
        ])
      );
      countStub.resolves(2);

      const results = await service.processTelemetry(tasks, { concurrently: 1, batchSize: 1 });

      expect(activityStub).to.have.been.calledOnce;

      expect(countStub.getCall(0)).to.have.been.calledWithExactly({
        deviceId: 1
      });

      expect(countStub.getCall(1)).to.have.been.calledWithExactly({
        deviceId: 2
      });

      expect(telemetryStub).not.to.have.been.called;
      expect(results).to.deep.equal([
        {
          task: { serial: 1 },
          value: { new: 0, created: 0 }
        },
        {
          task: { serial: 2 },
          value: { new: 0, created: 0 }
        }
      ]);
    });

    it('should fetch telemetry when Lotek count is more than SIMS count', async () => {
      const service = new TelemetryLotekService(getMockDBConnection());
      const tasks = [{ serial: 1 }, { serial: 2 }];

      const activityStub = sinon.stub(service, 'getDevicesActivitiesMap');
      const countStub = sinon.stub(service, 'fetchTelemetryCountFromLotek');
      const telemetryStub = sinon.stub(service, 'fetchTelemetryFromLotek');
      const createStub = sinon.stub(service, 'batchCreateTelemetry');

      activityStub.resolves(
        new Map([
          [1, { telemetryCount: 2, lastAcquisition: '2021-01-01' }],
          [2, { telemetryCount: 2, lastAcquisition: '2021-01-01' }]
        ])
      );

      countStub.resolves(3);
      createStub.resolves(1);

      const results = await service.processTelemetry(tasks, { concurrently: 1, batchSize: 1 });

      expect(activityStub).to.have.been.calledOnce;

      expect(countStub.getCall(0)).to.have.been.calledWithExactly({ deviceId: 1 });
      expect(countStub.getCall(1)).to.have.been.calledWithExactly({ deviceId: 2 });

      expect(telemetryStub.getCall(0)).to.have.been.calledWithExactly({
        deviceId: 1,
        dtStart: '2021-01-01',
        dtEnd: undefined
      });

      expect(telemetryStub.getCall(1)).to.have.been.calledWithExactly({
        deviceId: 2,
        dtStart: '2021-01-01',
        dtEnd: undefined
      });

      expect(results).to.deep.equal([
        {
          task: { serial: 1 },
          value: { new: 1, created: 1 }
        },
        {
          task: { serial: 2 },
          value: { new: 1, created: 1 }
        }
      ]);

      expect(createStub).to.have.been.calledTwice;
    });
  });
});
