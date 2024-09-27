import chai, { expect } from 'chai';
import { Feature } from 'geojson';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import {
  BcgwEnvRegionsLayer,
  BcgwLayerService,
  BcgwNrmRegionsLayer,
  BcgwParksAndEcoreservesLayer,
  BcgwWildlifeManagementUnitsLayer,
  RegionDetails
} from './bcgw-layer-service';
import { Srid3005, WebFeatureService } from './geo-service';
import { PostgisService } from './postgis-service';

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

  describe('getParkAndEcoreserveRegionNames', async () => {
    it('fetches and returns parks and ecoreserve names', async () => {
      const wfsGetPropertyResponseXml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <wfs:ValueCollection xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:pub="http://delivery.openmaps.gov.bc.ca/geo/" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 https://openmaps.gov.bc.ca/geo/schemas/wfs/2.0/wfs.xsd">
            <wfs:member>
                <pub:PROTECTED_LANDS_NAME>DISCOVERY ISLAND MARINE PARK</pub:PROTECTED_LANDS_NAME>
            </wfs:member>
            <wfs:member>
                <pub:PROTECTED_LANDS_NAME>BRIDGE RIVER DELTA PARK</pub:PROTECTED_LANDS_NAME>
            </wfs:member>
        </wfs:ValueCollection>
      `;

      const webFeatureServiceStub = sinon
        .stub(WebFeatureService.prototype, 'getPropertyValue')
        .resolves(wfsGetPropertyResponseXml);

      const bcgwLayerService = new BcgwLayerService();

      const geometryWKTString = 'POLYGON(123,456,789)';

      const response = await bcgwLayerService.getParkAndEcoreserveRegionNames(geometryWKTString);

      expect(webFeatureServiceStub).to.have.been.calledOnce;
      expect(response).to.eql(['DISCOVERY ISLAND MARINE PARK', 'BRIDGE RIVER DELTA PARK']);
    });
  });

  describe('getWildlifeManagementUnitRegionNames', async () => {
    it('fetches and returns wildlife management unit names', async () => {
      const wfsGetPropertyResponseXml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <wfs:ValueCollection xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:pub="http://delivery.openmaps.gov.bc.ca/geo/" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs/2.0 https://openmaps.gov.bc.ca/geo/schemas/wfs/2.0/wfs.xsd">
            <wfs:member>
                <pub:WILDLIFE_MGMT_UNIT_ID>1-6</pub:WILDLIFE_MGMT_UNIT_ID>
            </wfs:member>
            <wfs:member>
                <pub:WILDLIFE_MGMT_UNIT_ID>1-8</pub:WILDLIFE_MGMT_UNIT_ID>
            </wfs:member>
        </wfs:ValueCollection>
      `;

      const webFeatureServiceStub = sinon
        .stub(WebFeatureService.prototype, 'getPropertyValue')
        .resolves(wfsGetPropertyResponseXml);

      const bcgwLayerService = new BcgwLayerService();

      const geometryWKTString = 'POLYGON(123,456,789)';

      const response = await bcgwLayerService.getWildlifeManagementUnitRegionNames(geometryWKTString);

      expect(webFeatureServiceStub).to.have.been.calledOnce;
      expect(response).to.eql(['1-6', '1-8']);
    });
  });

  describe('findRegionDetails', () => {
    describe('with id and matching property', () => {
      it('finds and returns an ENV region name', () => {
        const feature: Feature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0]
              ]
            ]
          },
          id: BcgwEnvRegionsLayer,
          properties: {
            REGION_NAME: 'Region 1'
          }
        };

        const bcgwLayerService = new BcgwLayerService();

        const response = bcgwLayerService.findRegionDetails(feature);

        expect(response).to.eql({ regionName: 'Region 1', sourceLayer: BcgwEnvRegionsLayer });
      });

      it('finds and returns an NRM region name', () => {
        const feature: Feature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0]
              ]
            ]
          },
          id: BcgwNrmRegionsLayer,
          properties: {
            REGION_NAME: 'Region 1'
          }
        };

        const bcgwLayerService = new BcgwLayerService();

        const response = bcgwLayerService.findRegionDetails(feature);

        expect(response).to.eql({ regionName: 'Region 1', sourceLayer: BcgwNrmRegionsLayer });
      });

      it('finds and returns a Parks and Ecoreserves region name', () => {
        const feature: Feature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0]
              ]
            ]
          },
          id: BcgwParksAndEcoreservesLayer,
          properties: {
            PROTECTED_LANDS_NAME: 'Region 1'
          }
        };

        const bcgwLayerService = new BcgwLayerService();

        const response = bcgwLayerService.findRegionDetails(feature);

        expect(response).to.eql({ regionName: 'Region 1', sourceLayer: BcgwParksAndEcoreservesLayer });
      });

      it('finds and returns a Wildlife Management Unit region name', () => {
        const feature: Feature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0]
              ]
            ]
          },
          id: BcgwWildlifeManagementUnitsLayer,
          properties: {
            WILDLIFE_MGMT_UNIT_ID: 'Region 1'
          }
        };

        const bcgwLayerService = new BcgwLayerService();

        const response = bcgwLayerService.findRegionDetails(feature);

        expect(response).to.eql({ regionName: 'Region 1', sourceLayer: BcgwWildlifeManagementUnitsLayer });
      });
    });

    describe('with no matching property', () => {
      it('finds an ENV feature with no properties', () => {
        const feature: Feature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0]
              ]
            ]
          },
          id: BcgwEnvRegionsLayer,
          properties: {}
        };

        const bcgwLayerService = new BcgwLayerService();

        const response = bcgwLayerService.findRegionDetails(feature);

        expect(response).to.eql(null);
      });

      it('finds an NRM feature with no properties', () => {
        const feature: Feature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0]
              ]
            ]
          },
          id: BcgwNrmRegionsLayer,
          properties: {}
        };

        const bcgwLayerService = new BcgwLayerService();

        const response = bcgwLayerService.findRegionDetails(feature);

        expect(response).to.eql(null);
      });

      it('finds a Parks and Ecoreserves feature with no properties', () => {
        const feature: Feature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0]
              ]
            ]
          },
          id: BcgwParksAndEcoreservesLayer,
          properties: {}
        };

        const bcgwLayerService = new BcgwLayerService();

        const response = bcgwLayerService.findRegionDetails(feature);

        expect(response).to.eql(null);
      });

      it('finds a Wildlife Management Unit feature with no properties', () => {
        const feature: Feature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0]
              ]
            ]
          },
          id: BcgwWildlifeManagementUnitsLayer,
          properties: {}
        };

        const bcgwLayerService = new BcgwLayerService();

        const response = bcgwLayerService.findRegionDetails(feature);

        expect(response).to.eql(null);
      });
    });

    describe('with no id', () => {
      it('finds and returns no matching region name', () => {
        const feature: Feature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0]
              ]
            ]
          },
          properties: {}
        };

        const bcgwLayerService = new BcgwLayerService();

        const response = bcgwLayerService.findRegionDetails(feature);

        expect(response).to.eql(null);
      });
    });
  });

  describe('getMappedRegionDetails', () => {
    describe('with regions from layers with known mappings', () => {
      it('returns region details with additional mapped regions', () => {
        const regionDetails: RegionDetails[] = [
          { regionName: 'Vancouver Island', sourceLayer: BcgwEnvRegionsLayer },
          { regionName: 'Thompson-Okanagan Natural Resource Region', sourceLayer: BcgwNrmRegionsLayer }
        ];

        const bcgwLayerService = new BcgwLayerService();

        const response = bcgwLayerService.getMappedRegionDetails(regionDetails);

        expect(response).to.eql([
          { regionName: 'Vancouver Island', sourceLayer: BcgwEnvRegionsLayer },
          { regionName: 'Thompson-Okanagan Natural Resource Region', sourceLayer: BcgwNrmRegionsLayer },
          { regionName: 'West Coast Natural Resource Region', sourceLayer: BcgwNrmRegionsLayer },
          { regionName: 'Thompson', sourceLayer: BcgwEnvRegionsLayer },
          { regionName: 'Okanagan', sourceLayer: BcgwEnvRegionsLayer }
        ]);
      });
    });

    describe('with regions from layers with no known mappings', () => {
      it('returns original region details with no added mapped regions', () => {
        const regionDetails: RegionDetails[] = [
          { regionName: 'DISCOVERY ISLAND MARINE PARK', sourceLayer: BcgwParksAndEcoreservesLayer },
          { regionName: '1-6', sourceLayer: BcgwWildlifeManagementUnitsLayer }
        ];

        const bcgwLayerService = new BcgwLayerService();

        const response = bcgwLayerService.getMappedRegionDetails(regionDetails);

        expect(response).to.eql([
          { regionName: 'DISCOVERY ISLAND MARINE PARK', sourceLayer: BcgwParksAndEcoreservesLayer },
          { regionName: '1-6', sourceLayer: BcgwWildlifeManagementUnitsLayer }
        ]);
      });
    });
  });

  describe('getRegionsForFeature', async () => {
    describe('with a known feature from the ENV layer', async () => {
      it('returns region details array', async () => {
        const dbConnectionObj = getMockDBConnection();

        sinon.stub(PostgisService.prototype, 'getGeoJsonGeometryAsWkt').resolves('POLYGON ((0 0, 1 0, 1 1, 0 1, 0 0))');

        // Mock WFS response
        sinon.stub(BcgwLayerService.prototype, 'getAllRegionDetailsForWktString').resolves([
          { regionName: 'DISCOVERY ISLAND MARINE PARK', sourceLayer: BcgwParksAndEcoreservesLayer },
          { regionName: '1-6', sourceLayer: BcgwWildlifeManagementUnitsLayer }
        ]);

        const feature: Feature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0]
              ]
            ]
          },
          id: BcgwEnvRegionsLayer,
          properties: {
            REGION_NAME: 'Vancouver Island'
          }
        };

        const bcgwLayerService = new BcgwLayerService();

        const response = await bcgwLayerService.getRegionsForFeature(feature, dbConnectionObj);

        expect(response).to.eql([
          { regionName: 'Vancouver Island', sourceLayer: BcgwEnvRegionsLayer }, // from known ENV feature
          { regionName: 'West Coast Natural Resource Region', sourceLayer: BcgwNrmRegionsLayer }, // from mapped NRM feature
          { regionName: 'DISCOVERY ISLAND MARINE PARK', sourceLayer: BcgwParksAndEcoreservesLayer }, // from WFS response
          { regionName: '1-6', sourceLayer: BcgwWildlifeManagementUnitsLayer } // from WFS response
        ]);
      });
    });

    describe('with an unknown feature not from any known layer', async () => {
      it('returns region details array', async () => {
        const dbConnectionObj = getMockDBConnection();

        sinon.stub(PostgisService.prototype, 'getGeoJsonGeometryAsWkt').resolves('POLYGON ((0 0, 1 0, 1 1, 0 1, 0 0))');

        // Mock WFS response
        sinon.stub(BcgwLayerService.prototype, 'getAllRegionDetailsForWktString').resolves([
          { regionName: 'DISCOVERY ISLAND MARINE PARK', sourceLayer: BcgwParksAndEcoreservesLayer },
          { regionName: '1-6', sourceLayer: BcgwWildlifeManagementUnitsLayer }
        ]);

        const feature: Feature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0]
              ]
            ]
          },
          properties: {}
        };

        const bcgwLayerService = new BcgwLayerService();

        const response = await bcgwLayerService.getRegionsForFeature(feature, dbConnectionObj);

        expect(response).to.eql([
          { regionName: 'DISCOVERY ISLAND MARINE PARK', sourceLayer: BcgwParksAndEcoreservesLayer }, // from WFS response
          { regionName: '1-6', sourceLayer: BcgwWildlifeManagementUnitsLayer } // from WFS response
        ]);
      });
    });
  });

  describe('getAllRegionDetailsForWktString', async () => {
    it('returns region details array', async () => {
      const geometryWktString = 'POLYGON ((0 0, 1 0, 1 1, 0 1, 0 0))';

      const layersToProcess = [
        BcgwEnvRegionsLayer,
        BcgwNrmRegionsLayer,
        BcgwParksAndEcoreservesLayer,
        BcgwWildlifeManagementUnitsLayer
      ];

      const getEnvRegionDetailsStub = sinon
        .stub(BcgwLayerService.prototype, 'getEnvRegionDetails')
        .resolves([{ regionName: 'Region 1', sourceLayer: BcgwEnvRegionsLayer }]);

      const getNrmRegionDetailsStub = sinon
        .stub(BcgwLayerService.prototype, 'getNrmRegionDetails')
        .resolves([{ regionName: 'Region 1', sourceLayer: BcgwEnvRegionsLayer }]);

      const getParkAndEcoreserveRegionDetailsStub = sinon
        .stub(BcgwLayerService.prototype, 'getParkAndEcoreserveRegionDetails')
        .resolves([{ regionName: 'Region 1', sourceLayer: BcgwParksAndEcoreservesLayer }]);

      const getWildlifeManagementUnitRegionDetailsStub = sinon
        .stub(BcgwLayerService.prototype, 'getWildlifeManagementUnitRegionDetails')
        .resolves([{ regionName: 'Region 1', sourceLayer: BcgwWildlifeManagementUnitsLayer }]);

      const bcgwLayerService = new BcgwLayerService();

      const response = await bcgwLayerService.getAllRegionDetailsForWktString(geometryWktString, layersToProcess);

      expect(getEnvRegionDetailsStub).to.have.been.calledOnceWith(geometryWktString);
      expect(getNrmRegionDetailsStub).to.have.been.calledOnceWith(geometryWktString);
      expect(getParkAndEcoreserveRegionDetailsStub).to.have.been.calledOnceWith(geometryWktString);
      expect(getWildlifeManagementUnitRegionDetailsStub).to.have.been.calledOnceWith(geometryWktString);
      expect(response).to.eql([
        { regionName: 'Region 1', sourceLayer: BcgwEnvRegionsLayer },
        { regionName: 'Region 1', sourceLayer: BcgwEnvRegionsLayer },
        { regionName: 'Region 1', sourceLayer: BcgwParksAndEcoreservesLayer },
        { regionName: 'Region 1', sourceLayer: BcgwWildlifeManagementUnitsLayer }
      ]);
    });
  });

  describe('getEnvRegionDetails', async () => {
    it('returns region details array', async () => {
      const geometryWktString = 'POLYGON ((0 0, 1 0, 1 1, 0 1, 0 0))';

      const getEnvRegionNamesStub = sinon
        .stub(BcgwLayerService.prototype, 'getEnvRegionNames')
        .resolves(['Region 1', 'Region 2']);

      const bcgwLayerService = new BcgwLayerService();

      const response = await bcgwLayerService.getEnvRegionDetails(geometryWktString);

      expect(getEnvRegionNamesStub).to.have.been.calledOnceWith(geometryWktString);
      expect(response).to.eql([
        { regionName: 'Region 1', sourceLayer: BcgwEnvRegionsLayer },
        { regionName: 'Region 2', sourceLayer: BcgwEnvRegionsLayer }
      ]);
    });
  });

  describe('getNrmRegionDetails', async () => {
    it('returns region details array', async () => {
      const geometryWktString = 'POLYGON ((0 0, 1 0, 1 1, 0 1, 0 0))';

      const getEnvRegionNamesStub = sinon
        .stub(BcgwLayerService.prototype, 'getNrmRegionNames')
        .resolves(['Region 1', 'Region 2']);

      const bcgwLayerService = new BcgwLayerService();

      const response = await bcgwLayerService.getNrmRegionDetails(geometryWktString);

      expect(getEnvRegionNamesStub).to.have.been.calledOnceWith(geometryWktString);
      expect(response).to.eql([
        { regionName: 'Region 1', sourceLayer: BcgwNrmRegionsLayer },
        { regionName: 'Region 2', sourceLayer: BcgwNrmRegionsLayer }
      ]);
    });
  });

  describe('getParkAndEcoreserveRegionDetails', async () => {
    it('returns region details array', async () => {
      const geometryWktString = 'POLYGON ((0 0, 1 0, 1 1, 0 1, 0 0))';

      const getEnvRegionNamesStub = sinon
        .stub(BcgwLayerService.prototype, 'getParkAndEcoreserveRegionNames')
        .resolves(['Region 1', 'Region 2']);

      const bcgwLayerService = new BcgwLayerService();

      const response = await bcgwLayerService.getParkAndEcoreserveRegionDetails(geometryWktString);

      expect(getEnvRegionNamesStub).to.have.been.calledOnceWith(geometryWktString);
      expect(response).to.eql([
        { regionName: 'Region 1', sourceLayer: BcgwParksAndEcoreservesLayer },
        { regionName: 'Region 2', sourceLayer: BcgwParksAndEcoreservesLayer }
      ]);
    });
  });

  describe('getWildlifeManagementUnitRegionDetails', async () => {
    it('returns region details array', async () => {
      const geometryWktString = 'POLYGON ((0 0, 1 0, 1 1, 0 1, 0 0))';

      const getEnvRegionNamesStub = sinon
        .stub(BcgwLayerService.prototype, 'getWildlifeManagementUnitRegionNames')
        .resolves(['Region 1', 'Region 2']);

      const bcgwLayerService = new BcgwLayerService();

      const response = await bcgwLayerService.getWildlifeManagementUnitRegionDetails(geometryWktString);

      expect(getEnvRegionNamesStub).to.have.been.calledOnceWith(geometryWktString);
      expect(response).to.eql([
        { regionName: 'Region 1', sourceLayer: BcgwWildlifeManagementUnitsLayer },
        { regionName: 'Region 2', sourceLayer: BcgwWildlifeManagementUnitsLayer }
      ]);
    });
  });

  describe('getIntersectingNrmRegionsFromFeatures', () => {
    it('should return unique list of NRM region names', async () => {
      const mockDbConnection = getMockDBConnection();
      const service = new BcgwLayerService();

      const featureA: Feature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0]
            ]
          ]
        },
        properties: {}
      };

      const featureB: Feature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0]]]
        },
        properties: {}
      };

      const mockGetGeoJsonString = sinon.stub(PostgisService.prototype, 'getGeoJsonGeometryAsWkt');
      const mockGetNrmRegionNames = sinon.stub(service, 'getNrmRegionNames');

      mockGetGeoJsonString.onFirstCall().resolves('A');
      mockGetGeoJsonString.onSecondCall().resolves('B');
      mockGetNrmRegionNames.onFirstCall().resolves(['Cariboo']);
      mockGetNrmRegionNames.onSecondCall().resolves(['South', 'Cariboo']);

      const regions = await service.getIntersectingNrmRegionNamesFromFeatures([featureA, featureB], mockDbConnection);

      expect(mockGetGeoJsonString.firstCall).to.have.been.calledWithExactly(featureA.geometry, Srid3005);
      expect(mockGetGeoJsonString.secondCall).to.have.been.calledWithExactly(featureB.geometry, Srid3005);

      expect(mockGetNrmRegionNames.firstCall).to.have.been.calledWithExactly('A');
      expect(mockGetNrmRegionNames.secondCall).to.have.been.calledWithExactly('B');

      expect(regions).to.eqls(['Cariboo', 'South']);
    });
  });
});
