import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { RegionRepository } from '../repositories/region-repository';
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
          geometry: '{}'
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
        geometry: '{}'
      });
    });
  });

  describe('addRegionsToSurvey', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new RegionService(mockDBConnection);
      const deleteStub = sinon.stub(RegionRepository.prototype, 'deleteRegionsForSurvey').resolves();
      const addStub = sinon.stub(RegionRepository.prototype, 'addRegionsToSurvey').resolves();

      await service.addRegionsToSurvey(1, []);
      expect(deleteStub).to.be.called;
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

  describe('addRegionsToProject', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new RegionService(mockDBConnection);
      const deleteStub = sinon.stub(RegionRepository.prototype, 'deleteRegionsForProject').resolves();
      const addStub = sinon.stub(RegionRepository.prototype, 'addRegionsToProject').resolves();

      await service.addRegionsToProject(1, []);
      expect(deleteStub).to.be.called;
      expect(addStub).to.be.called;
    });
  });

  describe('addRegionsToSurveyFromFeatures', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new RegionService(mockDBConnection);
      const getUniqueStub = sinon.stub(RegionService.prototype, 'getUniqueRegionsForFeatures').resolves();
      const searchStub = sinon.stub(RegionService.prototype, 'searchRegionWithDetails').resolves();
      const addRegionStub = sinon.stub(RegionService.prototype, 'addRegionsToSurvey').resolves();

      await service.addRegionsToSurveyFromFeatures(1, []);

      expect(getUniqueStub).to.be.called;
      expect(searchStub).to.be.called;
      expect(addRegionStub).to.be.called;
    });
  });

  describe('addRegionsToProjectFromFeatures', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new RegionService(mockDBConnection);
      const getUniqueStub = sinon.stub(RegionService.prototype, 'getUniqueRegionsForFeatures').resolves();
      const searchStub = sinon.stub(RegionService.prototype, 'searchRegionWithDetails').resolves();
      const addRegionStub = sinon.stub(RegionService.prototype, 'addRegionsToProject').resolves();

      await service.addRegionsToProjectFromFeatures(1, []);

      expect(getUniqueStub).to.be.called;
      expect(searchStub).to.be.called;
      expect(addRegionStub).to.be.called;
    });
  });
});
