import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { BcgwLayerService } from './bcgw-layer-service';
import { WebFeatureService } from './geo-service';

chai.use(sinonChai);

describe('BcgwLayerService', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('constructs', async () => {
    const service = new BcgwLayerService();

    expect(service).not.to.be.undefined;
  });

  describe('getEnvRegionNames', async () => {
    it('fetches and returns env region names', async () => {
      const wfsGetPropertyResponseXml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <wfs:ValueCollection xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:pub="http://delivery.openmaps.gov.bc.ca/geo/" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 https://openmaps.gov.bc.ca/geo/schemas/wfs/2.0/wfs.xsd">
            <wfs:member>
                <pub:REGION_NAME>Vancouver Island</pub:REGION_NAME>
            </wfs:member>
            <wfs:member>
                <pub:REGION_NAME>Lower Mainland</pub:REGION_NAME>
            </wfs:member>
        </wfs:ValueCollection>
      `;

      const webFeatureServiceStub = sinon
        .stub(WebFeatureService.prototype, 'getPropertyValue')
        .resolves(wfsGetPropertyResponseXml);

      const bcgwLayerService = new BcgwLayerService();

      const geometryWKTString = 'POLYGON(123,456,789)';

      const response = await bcgwLayerService.getEnvRegionNames(geometryWKTString);

      expect(webFeatureServiceStub).to.have.been.calledOnce;
      expect(response).to.eql(['Vancouver Island', 'Lower Mainland']);
    });
  });

  describe('getNrmRegionNames', async () => {
    it('fetches and returns nrm region names', async () => {
      const wfsGetPropertyResponseXml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <wfs:ValueCollection xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:pub="http://delivery.openmaps.gov.bc.ca/geo/" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 https://openmaps.gov.bc.ca/geo/schemas/wfs/2.0/wfs.xsd">
            <wfs:member>
                <pub:REGION_NAME>West Coast Natural Resource Region</pub:REGION_NAME>
            </wfs:member>
            <wfs:member>
                <pub:REGION_NAME>South Coast Natural Resource Region</pub:REGION_NAME>
            </wfs:member>
        </wfs:ValueCollection>
      `;

      const webFeatureServiceStub = sinon
        .stub(WebFeatureService.prototype, 'getPropertyValue')
        .resolves(wfsGetPropertyResponseXml);

      const bcgwLayerService = new BcgwLayerService();

      const geometryWKTString = 'POLYGON(123,456,789)';

      const response = await bcgwLayerService.getNrmRegionNames(geometryWKTString);

      expect(webFeatureServiceStub).to.have.been.calledOnce;
      expect(response).to.eql(['West Coast Natural Resource Region', 'South Coast Natural Resource Region']);
    });
  });
});
