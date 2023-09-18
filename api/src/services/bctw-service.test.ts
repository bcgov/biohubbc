import { AxiosResponse } from 'axios';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  BctwService,
  BCTW_API_HOST,
  DEPLOY_DEVICE_ENDPOINT,
  GET_CODE_ENDPOINT,
  GET_COLLAR_VENDORS_ENDPOINT,
  GET_DEPLOYMENTS_BY_CRITTER_ENDPOINT,
  GET_DEPLOYMENTS_BY_DEVICE_ENDPOINT,
  GET_DEPLOYMENTS_ENDPOINT,
  GET_DEVICE_DETAILS,
  HEALTH_ENDPOINT,
  IDeployDevice,
  IDeploymentUpdate,
  UPDATE_DEPLOYMENT_ENDPOINT,
  UPSERT_DEVICE_ENDPOINT
} from './bctw-service';
import { KeycloakService } from './keycloak-service';

chai.use(sinonChai);

describe('BctwService', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockUser = { keycloak_guid: 'abc123', username: 'testuser' };

  describe('getUserHeader', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return a JSON string', async () => {
      const bctwService = new BctwService(mockUser);
      const result = bctwService.getUserHeader();
      expect(result).to.be.a('string');
      expect(JSON.parse(result)).to.deep.equal(mockUser);
    });
  });

  describe('getToken', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return a string from the keycloak service', async () => {
      const mockToken = 'abc123';
      const bctwService = new BctwService(mockUser);
      const getKeycloakServiceTokenStub = sinon
        .stub(KeycloakService.prototype, 'getKeycloakServiceToken')
        .resolves(mockToken);

      const result = await bctwService.getToken();
      expect(result).to.equal(mockToken);
      expect(getKeycloakServiceTokenStub).to.have.been.calledOnce;
    });
  });

  describe('_makeGetRequest', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should make an axios get request', async () => {
      const bctwService = new BctwService(mockUser);
      const endpoint = '/endpoint';
      const mockResponse = { data: 'data' } as AxiosResponse;

      const mockAxios = sinon.stub(bctwService.axiosInstance, 'get').resolves(mockResponse);

      const result = await bctwService._makeGetRequest(endpoint);

      expect(result).to.equal(mockResponse.data);
      expect(mockAxios).to.have.been.calledOnceWith(`${BCTW_API_HOST}${endpoint}`);
    });

    it('should make an axios get request with params', async () => {
      const bctwService = new BctwService(mockUser);
      const endpoint = '/endpoint';
      const queryParams = { param: 'param' };
      const mockResponse = { data: 'data' } as AxiosResponse;

      const mockAxios = sinon.stub(bctwService.axiosInstance, 'get').resolves(mockResponse);

      const result = await bctwService._makeGetRequest(endpoint, queryParams);

      expect(result).to.equal(mockResponse.data);
      expect(mockAxios).to.have.been.calledOnceWith(`${BCTW_API_HOST}${endpoint}?param=${queryParams['param']}`);
    });
  });

  describe('BctwService public methods', () => {
    afterEach(() => {
      sinon.restore();
    });

    const bctwService = new BctwService(mockUser);
    const mockDevice: IDeployDevice = {
      device_id: 1,
      frequency: 100,
      device_make: 'Lotek',
      device_model: 'model',
      attachment_start: '2020-01-01',
      attachment_end: '2020-01-02',
      critter_id: 'abc123'
    };
    const mockDeployment: IDeploymentUpdate = {
      deployment_id: 'adcd',
      attachment_start: '2020-01-01',
      attachment_end: '2020-01-02'
    };

    describe('deployDevice', () => {
      it('should send a post request', async () => {
        const mockAxios = sinon.stub(bctwService.axiosInstance, 'post');

        await bctwService.deployDevice(mockDevice);

        expect(mockAxios).to.have.been.calledOnceWith(DEPLOY_DEVICE_ENDPOINT, mockDevice);
      });
    });

    describe('getDeployments', () => {
      it('should send a get request', async () => {
        const mockGetRequest = sinon.stub(bctwService, '_makeGetRequest');

        await bctwService.getDeployments();

        expect(mockGetRequest).to.have.been.calledOnceWith(GET_DEPLOYMENTS_ENDPOINT);
      });
    });

    describe('updateDeployment', () => {
      it('should send a patch request', async () => {
        const mockAxios = sinon.stub(bctwService.axiosInstance, 'patch');

        await bctwService.updateDeployment(mockDeployment);

        expect(mockAxios).to.have.been.calledOnceWith(UPDATE_DEPLOYMENT_ENDPOINT, mockDeployment);
      });
    });

    describe('getCollarVendors', () => {
      it('should send a get request', async () => {
        const mockGetRequest = sinon.stub(bctwService, '_makeGetRequest');

        await bctwService.getCollarVendors();

        expect(mockGetRequest).to.have.been.calledOnceWith(GET_COLLAR_VENDORS_ENDPOINT);
      });
    });

    describe('getHealth', () => {
      it('should send a get request', async () => {
        const mockGetRequest = sinon.stub(bctwService, '_makeGetRequest');

        await bctwService.getHealth();

        expect(mockGetRequest).to.have.been.calledOnceWith(HEALTH_ENDPOINT);
      });
    });

    describe('getCode', () => {
      it('should send a get request', async () => {
        const mockGetRequest = sinon.stub(bctwService, '_makeGetRequest');

        await bctwService.getCode('codeHeader');

        expect(mockGetRequest).to.have.been.calledOnceWith(GET_CODE_ENDPOINT, { codeHeader: 'codeHeader' });
      });
    });

    describe('getDeploymentsByCritterId', () => {
      it('should send a get request', async () => {
        const mockGetRequest = sinon.stub(bctwService, '_makeGetRequest');

        await bctwService.getDeploymentsByCritterId(['abc123']);

        expect(mockGetRequest).to.have.been.calledOnceWith(GET_DEPLOYMENTS_BY_CRITTER_ENDPOINT, {
          critter_ids: ['abc123']
        });
      });
    });

    describe('getDeviceDetails', () => {
      it('should send a get request', async () => {
        const mockGetRequest = sinon.stub(bctwService, '_makeGetRequest');

        await bctwService.getDeviceDetails(123);

        expect(mockGetRequest).to.have.been.calledOnceWith(`${GET_DEVICE_DETAILS}${123}`);
      });
    });

    describe('getDeviceDeployments', () => {
      it('should send a get request', async () => {
        const mockGetRequest = sinon.stub(bctwService, '_makeGetRequest');

        await bctwService.getDeviceDeployments(123);

        expect(mockGetRequest).to.have.been.calledOnceWith(GET_DEPLOYMENTS_BY_DEVICE_ENDPOINT, {
          device_id: '123'
        });
      });
    });

    describe('updateDevice', () => {
      it('should send a post request', async () => {
        const mockAxios = sinon.stub(bctwService.axiosInstance, 'post').resolves({ data: { results: [], errors: [] } });

        const body = {
          device_id: 1,
          collar_id: ''
        };
        await bctwService.updateDevice(body);

        expect(mockAxios).to.have.been.calledOnceWith(UPSERT_DEVICE_ENDPOINT, body);
      });
    });
  });
});
