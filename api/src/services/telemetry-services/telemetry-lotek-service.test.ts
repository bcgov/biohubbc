import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../__mocks__/db';
import { TelemetryLotekService } from './telemetry-lotek-service';

chai.use(sinonChai);

describe.only('TelemetryLotekService', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('lotekCient', () => {
    it('should create a new Axios client with the correct base URL', () => {
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
      const axiosStub = sinon.stub(service.lotekClient, 'post').resolves({ data: { access_token: 'NEW_TOKEN' } });

      process.env.LOTEK_API_USERNAME = 'test-username';
      process.env.LOTEK_API_PASSWORD = 'test-password';

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
});
