import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { IRegion, RegionRepository, REGION_FEATURE_CODE } from '../repositories/region-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { BcgwLayerService } from './bcgw-layer-service';
import { RegionService } from './region-service';

chai.use(sinonChai);

describe('RegionRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should initialize all dependencies', () => {
      const mockDBConnection = getMockDBConnection();
      const service = new RegionService(mockDBConnection);

      expect(service.connection).to.eql(mockDBConnection);
      expect(service.regionRepository).to.be.instanceof(RegionRepository);
      expect(service.bcgwLayerService).to.be.instanceof(BcgwLayerService);
    });
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
      expect(search).to.be.calledWith([], mockDBConnection);
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

      const getIntersectingRegions = sinon
        .stub(RegionRepository.prototype, 'getIntersectingRegionsFromFeatures')
        .resolves([{ region_id: 1 }] as unknown as IRegion[]);

      const refreshSurveyRegionsStub = sinon.stub(RegionService.prototype, 'refreshSurveyRegions').resolves();

      await service.insertRegionsIntoSurveyFromFeatures(1, []);

      expect(getIntersectingRegions).to.be.calledWith([], REGION_FEATURE_CODE.NATURAL_RESOURCE_REGION);
      expect(refreshSurveyRegionsStub).to.be.calledWith(1, [1]);
    });
  });
});
