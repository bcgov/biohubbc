import { AxiosResponse } from 'axios';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { CritterbaseService, CRITTERBASE_API_HOST, ICritter } from './critterbase-service';
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
    expect(result).to.be.a('string');
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

      const result = await cb._makeGetRequest(endpoint, []);

      expect(result).to.equal(mockResponse.data);
      expect(mockAxios).to.have.been.calledOnceWith(`${CRITTERBASE_API_HOST}${endpoint}?`);
    });

    it('should make an axios get request with params', async () => {
      const cb = new CritterbaseService(mockUser);
      const endpoint = '/endpoint';
      const queryParams = [{ key: 'param', value: 'param' }];
      const mockResponse = { data: 'data' } as AxiosResponse;

      const mockAxios = sinon.stub(cb.axiosInstance, 'get').resolves(mockResponse);

      const result = await cb._makeGetRequest(endpoint, queryParams);

      expect(result).to.equal(mockResponse.data);
      expect(mockAxios).to.have.been.calledOnceWith(`${CRITTERBASE_API_HOST}${endpoint}?param=param`);
    });
  });

  describe('Critterbase service public methods', () => {
    afterEach(() => {
      sinon.restore();
    });

    const cb = new CritterbaseService(mockUser);

    describe('getLookupValues', () => {
      it('should retrieve matching lookup values', async () => {
        const mockGetRequest = sinon.stub(cb, '_makeGetRequest');
        const mockParams = [{ key: 'format', value: 'asSelect ' }];
        await cb.getLookupValues('colours', mockParams);
        expect(mockGetRequest).to.have.been.calledOnceWith('/lookups/colours', mockParams);
      });
    });

    describe('getTaxonMeasurements', () => {
      it('should retrieve taxon measurements', async () => {
        const mockGetRequest = sinon.stub(cb, '_makeGetRequest');
        await cb.getTaxonMeasurements('123456');
        expect(mockGetRequest).to.have.been.calledOnceWith('/xref/taxon-measurements', [
          { key: 'tsn', value: '123456' }
        ]);
      });
    });

    describe('getTaxonBodyLocations', () => {
      it('should retrieve taxon body locations', async () => {
        const mockGetRequest = sinon.stub(cb, '_makeGetRequest');
        await cb.getTaxonBodyLocations('asdf');
        expect(mockGetRequest).to.have.been.calledOnceWith('/xref/taxon-marking-body-locations', [
          { key: 'taxon_id', value: 'asdf' },
          { key: 'format', value: 'asSelect' }
        ]);
      });
    });

    describe('getQualitativeOptions', () => {
      it('should retrieve qualitative options', async () => {
        const mockGetRequest = sinon.stub(cb, '_makeGetRequest');
        await cb.getQualitativeOptions('asdf');
        expect(mockGetRequest).to.have.been.calledOnceWith('/xref/taxon-qualitative-measurement-options', [
          { key: 'taxon_measurement_id', value: 'asdf' },
          { key: 'format', value: 'asSelect' }
        ]);
      });
    });

    describe('getFamilies', () => {
      it('should retrieve families', async () => {
        const mockGetRequest = sinon.stub(cb, '_makeGetRequest');
        await cb.getFamilies();
        expect(mockGetRequest).to.have.been.calledOnceWith('/family', []);
      });
    });

    describe('getFamilyById', () => {
      it('should retrieve a family', async () => {
        const mockGetRequest = sinon.stub(cb, '_makeGetRequest');
        await cb.getFamilyById('asdf');
        expect(mockGetRequest).to.have.been.calledOnceWith('/family/' + 'asdf', []);
      });
    });

    describe('getCritter', () => {
      it('should fetch a critter', async () => {
        const mockGetRequest = sinon.stub(cb, '_makeGetRequest');
        await cb.getCritter('asdf');
        expect(mockGetRequest).to.have.been.calledOnceWith('/critters/' + 'asdf', [{ key: 'format', value: 'detail' }]);
      });
    });

    describe('createCritter', () => {
      it('should create a critter', async () => {
        const data: ICritter = {
          wlh_id: 'aaaa',
          animal_id: 'aaaa',
          sex: 'male',
          itis_tsn: 1,
          itis_scientific_name: 'Name',
          critter_comment: 'None.'
        };
        const axiosStub = sinon.stub(cb.axiosInstance, 'post').resolves({ data: [] });

        await cb.createCritter(data);
        expect(axiosStub).to.have.been.calledOnceWith('/critters/create', data);
      });
    });

    describe('signUp', () => {
      it('should sign up a user', async () => {
        const axiosStub = sinon.stub(cb.axiosInstance, 'post').resolves({ data: [] });
        await cb.signUp();
        expect(axiosStub).to.have.been.calledOnceWith('/signup');
      });
    });
  });
});
