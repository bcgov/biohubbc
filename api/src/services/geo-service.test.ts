import axios from 'axios';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { BcgwEnvRegionsLayer, BcgwNrmRegionsLayer } from './bcgw-layer-service';
import { Epsg3005, GeoService, WebFeatureService, WebMapService, Wfs, Wms } from './geo-service';

chai.use(sinonChai);

describe('GeoService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('with default options', async () => {
      const geoService = new GeoService();

      expect(geoService).not.to.be.undefined;
      expect(geoService.baseUrl).to.equal('https://openmaps.gov.bc.ca/geo/pub/ows');
    });

    it('with ENV options.baseUrl', async () => {
      process.env.BcgwBaseUrl = 'envBaseURL';

      const geoService = new GeoService();

      expect(geoService).not.to.be.undefined;
      expect(geoService.baseUrl).to.equal('envBaseURL');
    });

    it('with custom options.baseUrl', async () => {
      const geoService = new GeoService({ baseUrl: 'newBaseURL' });

      expect(geoService).not.to.be.undefined;
      expect(geoService.baseUrl).to.equal('newBaseURL');
    });
  });

  describe('_buildURL', async () => {
    it('builds and returns a url', async () => {
      const geoService = new GeoService({ baseUrl: 'www.baseurl.com/ows' });

      const url = geoService._buildURL({ request: 'GetFeature', service: 'WFS', version: '2.0.0' });

      expect(url).to.equal('www.baseurl.com/ows?request=GetFeature&service=WFS&version=2.0.0');
    });
  });

  describe('_externalGet', async () => {
    it('makes a get request', async () => {
      const mockAxiosResponse = { data: 'mockData' };

      const axiosStub = sinon.stub(axios, 'get').resolves(mockAxiosResponse);

      const geoService = new GeoService({ baseUrl: 'www.baseurl.com/ows' });

      const response = await geoService._externalGet('www.baseurl.com/ows');

      expect(axiosStub).to.have.been.calledOnce;
      expect(response).to.equal('mockData');
    });
  });

  describe('_externalPost', async () => {
    it('makes a post request', async () => {
      const mockAxiosResponse = { data: 'mockData' };

      const axiosStub = sinon.stub(axios, 'post').resolves(mockAxiosResponse);

      const geoService = new GeoService({ baseUrl: 'www.baseurl.com/ows' });

      const response = await geoService._externalPost('www.baseurl.com/ows', { bodyData: 'bodyData' });

      expect(axiosStub).to.have.been.calledOnce;
      expect(response).to.equal('mockData');
    });
  });
});

describe('WebFeatureService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getCapabilities', async () => {
    it('makes a WFS getCapabilities get request', async () => {
      const _buildURLSpy = sinon.spy(GeoService.prototype, '_buildURL');
      const _externalGetStub = sinon
        .stub(GeoService.prototype, '_externalGet')
        .resolves('mockGetCapabilitiesResponseData');

      const webFeatureService = new WebFeatureService();

      const response = await webFeatureService.getCapabilities();

      expect(_buildURLSpy).to.have.been.calledOnceWith({
        request: 'GetCapabilities',
        service: Wfs,
        version: '2.0.0'
      });
      expect(_externalGetStub).to.have.been.calledOnceWith(_buildURLSpy.returnValues[0]);
      expect(response).to.equal('mockGetCapabilitiesResponseData');
    });
  });

  describe('getFeature', async () => {
    describe('with no CQL Filter', () => {
      it('makes a WFS getFeature post request', async () => {
        const _buildURLSpy = sinon.spy(GeoService.prototype, '_buildURL');
        const _externalGetStub = sinon
          .stub(GeoService.prototype, '_externalGet')
          .resolves('mockGetFeatureResponseData');

        sinon.stub(GeoService.prototype, '_externalPost').rejects('Should have called _externalGet');

        const webFeatureService = new WebFeatureService();

        const response = await webFeatureService.getFeature({
          typeNames: BcgwEnvRegionsLayer,
          outputFormat: 'json'
        });

        expect(_buildURLSpy).to.have.been.calledOnceWith({
          typeNames: BcgwEnvRegionsLayer,
          outputFormat: 'json',
          request: 'GetFeature',
          service: Wfs,
          version: '2.0.0'
        });
        expect(_externalGetStub).to.have.been.calledOnceWith(_buildURLSpy.returnValues[0]);
        expect(response).to.equal('mockGetFeatureResponseData');
      });
    });

    describe('with CQL Filter', () => {
      it('makes a WFS getFeature post request', async () => {
        const _buildURLSpy = sinon.spy(GeoService.prototype, '_buildURL');
        const _externalPostStub = sinon
          .stub(GeoService.prototype, '_externalPost')
          .resolves('mockGetFeatureResponseData');

        sinon.stub(GeoService.prototype, '_externalGet').rejects('Should have called _externalPost');

        const webFeatureService = new WebFeatureService();

        const response = await webFeatureService.getFeature({
          cql_filter: 'INTERSECTS(GEOMETRY, POLYGON(123,456,789))',
          typeNames: BcgwEnvRegionsLayer,
          outputFormat: 'json'
        });

        expect(_buildURLSpy).to.have.been.calledOnceWith({
          typeNames: BcgwEnvRegionsLayer,
          outputFormat: 'json',
          request: 'GetFeature',
          service: Wfs,
          version: '2.0.0'
        });
        expect(_externalPostStub).to.have.been.calledOnceWith(_buildURLSpy.returnValues[0], {
          cql_filter: 'INTERSECTS(GEOMETRY, POLYGON(123,456,789))'
        });
        expect(response).to.equal('mockGetFeatureResponseData');
      });
    });
  });

  describe('getPropertyValue', async () => {
    describe('with no CQL Filter', () => {
      it('makes a WFS getPropertyValue post request', async () => {
        const _buildURLSpy = sinon.spy(GeoService.prototype, '_buildURL');
        const _externalGetStub = sinon
          .stub(GeoService.prototype, '_externalGet')
          .resolves('mockGetFeatureResponseData');

        sinon.stub(GeoService.prototype, '_externalPost').rejects('Should have called _externalGet');

        const webFeatureService = new WebFeatureService();

        const response = await webFeatureService.getPropertyValue({
          typeNames: BcgwEnvRegionsLayer,
          valueReference: 'REGION_NAME'
        });

        expect(_buildURLSpy).to.have.been.calledOnceWith({
          typeNames: BcgwEnvRegionsLayer,
          valueReference: 'REGION_NAME',
          request: 'GetPropertyValue',
          service: Wfs,
          version: '2.0.0'
        });
        expect(_externalGetStub).to.have.been.calledOnceWith(_buildURLSpy.returnValues[0]);
        expect(response).to.equal('mockGetFeatureResponseData');
      });
    });

    describe('with CQL Filter', () => {
      it('makes a WFS getPropertyValue post request', async () => {
        const _buildURLSpy = sinon.spy(GeoService.prototype, '_buildURL');
        const _externalPostStub = sinon
          .stub(GeoService.prototype, '_externalPost')
          .resolves('mockGetFeatureResponseData');

        sinon.stub(GeoService.prototype, '_externalGet').rejects('Should have called _externalPost');

        const webFeatureService = new WebFeatureService();

        const response = await webFeatureService.getPropertyValue({
          cql_filter: 'INTERSECTS(GEOMETRY, POLYGON(123,456,789))',
          valueReference: 'REGION_NAME',
          typeNames: BcgwEnvRegionsLayer
        });

        expect(_buildURLSpy).to.have.been.calledOnceWith({
          typeNames: BcgwEnvRegionsLayer,
          valueReference: 'REGION_NAME',
          request: 'GetPropertyValue',
          service: Wfs,
          version: '2.0.0'
        });
        expect(_externalPostStub).to.have.been.calledOnceWith(_buildURLSpy.returnValues[0], {
          cql_filter: 'INTERSECTS(GEOMETRY, POLYGON(123,456,789))'
        });
        expect(response).to.equal('mockGetFeatureResponseData');
      });
    });
  });
});

describe('WebMapService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getCapabilities', async () => {
    it('makes a WMS getCapabilities get request', async () => {
      const _buildURLSpy = sinon.spy(GeoService.prototype, '_buildURL');
      const _externalGetStub = sinon
        .stub(GeoService.prototype, '_externalGet')
        .resolves('mockGetCapabilitiesResponseData');

      const webMapService = new WebMapService();

      const response = await webMapService.getCapabilities();

      expect(_buildURLSpy).to.have.been.calledOnceWith({
        request: 'GetCapabilities',
        service: Wms,
        version: '1.3.0'
      });
      expect(_externalGetStub).to.have.been.calledOnceWith(_buildURLSpy.returnValues[0]);
      expect(response).to.equal('mockGetCapabilitiesResponseData');
    });
  });

  describe('getMap', async () => {
    it('makes a WMS getMap get request', async () => {
      const _buildURLSpy = sinon.spy(GeoService.prototype, '_buildURL');
      const _externalGetStub = sinon.stub(GeoService.prototype, '_externalGet').resolves('mockGetMapResponseData');

      const webMapService = new WebMapService();

      const response = await webMapService.getMap({
        bbox: '1,2,3,4',
        crs: Epsg3005,
        format: 'image/png',
        height: 500,
        width: 500,
        layers: BcgwNrmRegionsLayer
      });

      expect(_buildURLSpy).to.have.been.calledOnceWith({
        bbox: '1,2,3,4',
        crs: Epsg3005,
        format: 'image/png',
        height: 500,
        width: 500,
        layers: BcgwNrmRegionsLayer,
        request: 'GetMap',
        service: Wms,
        version: '1.3.0'
      });
      expect(_externalGetStub).to.have.been.calledOnceWith(_buildURLSpy.returnValues[0]);
      expect(response).to.equal('mockGetMapResponseData');
    });
  });
});
