import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { IRegion, RegionRepository } from '../repositories/region-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { BcgwLayerService } from './bcgw-layer-service';
import { RegionService } from './region-service';

chai.use(sinonChai);

describe('RegionRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('searchRegionWithDetails', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new RegionService(mockDBConnection);
      const search = sinon.stub(RegionRepository.prototype, 'searchRegionsWithDetails').resolves([
        {
          region_id: 1,
          region_name: 'region name',
          org_unit: '1',
          org_unit_name: 'org unit name',
          feature_code: '11_code',
          feature_name: 'source_layer',
          object_id: 1234,
          geojson: '{}',
          geography: '{}',
          geometry: null
        }
      ]);

      const regions = await service.searchRegionWithDetails([]);
      expect(search).to.be.called;
      expect(regions[0]).to.eql({
        region_id: 1,
        region_name: 'region name',
        org_unit: '1',
        org_unit_name: 'org unit name',
        feature_code: '11_code',
        feature_name: 'source_layer',
        object_id: 1234,
        geojson: '{}',
        geography: '{}',
        geometry: null
      });
    });
  });

  describe('addRegionsToSurvey', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new RegionService(mockDBConnection);
      const addStub = sinon.stub(RegionRepository.prototype, 'addRegionsToSurvey').resolves();

      await service.refreshSurveyRegions(1, []);
      expect(addStub).to.be.called;
    });
  });

  describe('getUniqueRegionsForFeatures', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new RegionService(mockDBConnection);
      const search = sinon.stub(BcgwLayerService.prototype, 'getUniqueRegionsForFeatures').resolves([
        {
          regionName: 'cool name',
          sourceLayer: 'BCGW:Layer'
        }
      ]);

      const response = await service.getUniqueRegionsForFeatures([]);
      expect(search).to.be.called;
      expect(response[0]).to.be.eql({
        regionName: 'cool name',
        sourceLayer: 'BCGW:Layer'
      });
    });
  });

  describe('insertRegionsIntoSurveyFromFeatures', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new RegionService(mockDBConnection);
      const regionDetails = { regionName: 'REGION', sourceLayer: 'LAYER' };

      const intersectingRegionsStub = sinon
        .stub(BcgwLayerService.prototype, 'getIntersectingNrmRegionsFromFeatures')
        .resolves([regionDetails]);
      const getRegionsByNamesStub = sinon
        .stub(RegionService.prototype, 'getRegionsByNames')
        .resolves([{ region_id: 1 }] as unknown as IRegion[]);
      const refreshSurveyRegionsStub = sinon.stub(RegionService.prototype, 'refreshSurveyRegions').resolves();

      await service.insertRegionsIntoSurveyFromFeatures(1, []);

      expect(intersectingRegionsStub).to.be.calledWith([], mockDBConnection);
      expect(getRegionsByNamesStub).to.be.calledWith(['REGION']);
      expect(refreshSurveyRegionsStub).to.be.calledWith(1, [{ region_id: 1 }]);
    });
  });
});
