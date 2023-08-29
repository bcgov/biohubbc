import { AxiosResponse } from 'axios';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { CritterbaseService, CRITTERBASE_API_HOST, IBulkCreate } from './critterbase-service';
import { KeycloakService } from './keycloak-service';

chai.use(sinonChai);

describe('CritterbaseService', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockUser = { keycloak_guid: 'abc123', username: 'testuser' };

  describe('getUserHeader', () => {
    const cb = new CritterbaseService(mockUser);
    const result = cb.getUserHeader();
    expect(result.user).to.be.a('string');
  });

  describe('getToken', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return a string from the keycloak service', async () => {
      const mockToken = 'abc123';
      const cb = new CritterbaseService(mockUser);
      const getKeycloakServiceTokenStub = sinon
        .stub(KeycloakService.prototype, 'getKeycloakServiceToken')
        .resolves(mockToken);

      const result = await cb.getToken();
      expect(result).to.equal(mockToken);
      expect(getKeycloakServiceTokenStub).to.have.been.calledOnce;
    });
  });

  describe('makeGetRequest', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should make an axios get request', async () => {
      const cb = new CritterbaseService(mockUser);
      const endpoint = '/endpoint';
      const mockResponse = { data: 'data' } as AxiosResponse;

      const mockAxios = sinon.stub(cb.axiosInstance, 'get').resolves(mockResponse);

      const result = await cb.makeGetRequest(endpoint, []);

      expect(result).to.equal(mockResponse.data);
      expect(mockAxios).to.have.been.calledOnceWith(`${CRITTERBASE_API_HOST}${endpoint}?`);
    });

    it('should make an axios get request with params', async () => {
      const cb = new CritterbaseService(mockUser);
      const endpoint = '/endpoint';
      const queryParams = [{ key: 'param', value: 'param' }];
      const mockResponse = { data: 'data' } as AxiosResponse;

      const mockAxios = sinon.stub(cb.axiosInstance, 'get').resolves(mockResponse);

      const result = await cb.makeGetRequest(endpoint, queryParams);

      expect(result).to.equal(mockResponse.data);
      expect(mockAxios).to.have.been.calledOnceWith(`${CRITTERBASE_API_HOST}${endpoint}?param=param`);
    });
  });

  describe('makePostPatchRequest', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should make an axios post/patch request', async () => {
      const cb = new CritterbaseService(mockUser);
      const endpoint = '/endpoint';
      const mockResponse = { data: 'data' } as AxiosResponse;

      const mockAxios = sinon.stub(cb.axiosInstance, 'post').resolves(mockResponse);

      const result = await cb.makePostPatchRequest('post', endpoint, { foo: 'bar' });

      expect(result).to.equal(mockResponse.data);
      expect(mockAxios).to.have.been.calledOnce;
    });
  });

  describe('Critterbase service public methods', () => {
    afterEach(() => {
      sinon.restore();
    });

    const cb = new CritterbaseService(mockUser);

    describe('getLookupValues', async () => {
      const mockGetRequest = sinon.stub(cb, 'makeGetRequest');
      await cb.getLookupValues('colours', []);
      expect(mockGetRequest).to.have.been.calledOnceWith('lookups/colours', [{ key: 'format', value: 'asSelect ' }]);
    });
    describe('getTaxonMeasurements', async () => {
      const mockGetRequest = sinon.stub(cb, 'makeGetRequest');
      await cb.getTaxonMeasurements('asdf');
      expect(mockGetRequest).to.have.been.calledOnceWith('xref/taxon-measurements', [
        { key: 'taxon_id', value: 'asdf ' }
      ]);
    });
    describe('getTaxonBodyLocations', async () => {
      const mockGetRequest = sinon.stub(cb, 'makeGetRequest');
      await cb.getTaxonBodyLocations('asdf');
      expect(mockGetRequest).to.have.been.calledOnceWith('xref/taxon-marking-body-locations', [
        { key: 'taxon_id', value: 'asdf' },
        { key: 'format', value: 'asSelect' }
      ]);
    });
    describe('getQualitativeOptions', async () => {
      const mockGetRequest = sinon.stub(cb, 'makeGetRequest');
      await cb.getQualitativeOptions('asdf');
      expect(mockGetRequest).to.have.been.calledOnceWith('xref/taxon-qualitative-measurement-options', [
        { key: 'taxon_measurement_id', value: 'asdf' },
        { key: 'format', value: 'asSelect' }
      ]);
    });
    describe('getFamilies', async () => {
      const mockGetRequest = sinon.stub(cb, 'makeGetRequest');
      await cb.getFamilies();
      expect(mockGetRequest).to.have.been.calledOnceWith('family', []);
    });
    describe('getCritter', async () => {
      const mockGetRequest = sinon.stub(cb, 'makeGetRequest');
      await cb.getCritter('asdf');
      expect(mockGetRequest).to.have.been.calledOnceWith('critters/' + 'asdf', [{ key: 'format', value: 'detail' }]);
    });
    describe('createCritter', async () => {
      const mockPostPatchRequest = sinon.stub(cb, 'makePostPatchRequest');
      const data: IBulkCreate = {
        locations: [{ latitude: 2, longitude: 2 }],
        critters: [],
        captures: [],
        mortalities: [],
        markings: [],
        qualitative_measurements: [],
        quantitative_measurements: [],
        families: [],
        collections: []
      };
      await cb.createCritter(data);
      expect(mockPostPatchRequest).to.have.been.calledOnceWith('post', 'critters', data);
    });
    describe('signUp', async () => {
      const mockPostPatchRequest = sinon.stub(cb, 'makePostPatchRequest');
      await cb.signUp();
      expect(mockPostPatchRequest).to.have.been.calledOnceWith('post', 'signup');
    });
  });
});
