import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { UpdateSampleBlockRecord } from '../repositories/sample-blocks-repository';
import { SampleSiteRepository } from '../repositories/sample-site-repository/sample-site-repository';
import { UpdateSampleStratumRecord } from '../repositories/sample-stratums-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { SampleBlockService } from './sample-block-service';
import { CreateSampleSiteObject, SampleSiteService } from './sample-site-service';
import { SampleStratumService } from './sample-stratum-service';

chai.use(sinonChai);

describe('SampleSiteService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('createSampleSite', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new SampleSiteService(mockDBConnection);
      const mockData: CreateSampleSiteObject = {
        survey_sample_site_id: null,
        survey_id: 1,
        survey_sample_sites: [
          {
            name: `Sample Site 1`,
            description: ``,
            geojson: {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-121.904297, 50.930738],
                    [-121.904297, 51.971346],
                    [-120.19043, 51.971346],
                    [-120.19043, 50.930738],
                    [-121.904297, 50.930738]
                  ]
                ]
              },
              properties: {}
            }
          }
        ],
        blocks: [
          {
            survey_sample_site_id: 1,
            survey_block_id: 1
          }
        ],
        stratums: [
          {
            survey_sample_site_id: 1,
            survey_stratum_id: 1
          }
        ]
      };

      const insertSample = sinon.stub(SampleSiteRepository.prototype, 'insertSampleSite').resolves({
        survey_sample_site_id: 1,
        survey_id: 1,
        name: 'Sample Site 1',
        description: '',
        geometry: null,
        geography: '',
        geojson: [],
        create_date: '',
        create_user: 1,
        update_date: '',
        update_user: 1,
        revision_count: 0
      });

      await service.createSampleSite(mockData);

      expect(insertSample).to.be.called;
    });
  });

  describe('getSampleSitesForSurveyId', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new SampleSiteService(mockDBConnection);

      sinon.stub(SampleSiteRepository.prototype, 'getSampleSitesForSurveyIds').resolves([
        {
          survey_sample_site_id: 1,
          survey_id: 1,
          name: 'Sample Site 1',
          description: '',
          geometry_type: 'Point',
          blocks: [],
          stratums: []
        }
      ]);

      const response = await service.getSampleSitesForSurveyIds([1]);

      expect(response).to.have.lengthOf(1);
      response.forEach((item) => {
        expect(item.survey_id).to.eq(1);
      });
    });
  });

  describe('getSampleSitesCountBySurveyId', () => {
    it('should return the sample site count successfully', async () => {
      const dbConnectionObj = getMockDBConnection();

      const repoStub = sinon.stub(SampleSiteRepository.prototype, 'getSampleSitesCountBySurveyIds').resolves(20);
      const surveyService = new SampleSiteService(dbConnectionObj);
      const response = await surveyService.getSampleSitesCountBySurveyIds([1001]);

      expect(repoStub).to.be.calledOnceWith([1001]);
      expect(response).to.equal(20);
    });
  });

  describe('getSampleSitesGeometryBySurveyId', () => {
    it('should return the sample site geometries successfully', async () => {
      const dbConnectionObj = getMockDBConnection();

      const mockRows = [{ survey_sample_site_id: 1, geojson: {} }];

      const repoStub = sinon
        .stub(SampleSiteRepository.prototype, 'getSampleSitesGeometryBySurveyId')
        .resolves(mockRows);

      const sampleSiteService = new SampleSiteService(dbConnectionObj);
      const response = await sampleSiteService.getSampleSitesGeometryBySurveyId(1001);

      expect(repoStub).to.be.calledOnceWith(1001);
      expect(response).to.eql(mockRows);
    });
  });

  describe('deleteSampleSiteRecord', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new SampleSiteService(mockDBConnection);

      // Blocks
      const getSampleBlocksForSurveySampleSiteIdStub = sinon
        .stub(SampleBlockService.prototype, 'getSampleBlocksForSurveySampleSiteId')
        .resolves([{ survey_sample_block_id: 1 } as any]);

      const deleteSampleBlockRecordsStub = sinon
        .stub(SampleBlockService.prototype, 'deleteSampleBlockRecords')
        .resolves();

      // Stratums
      const getSampleStratumsForSurveySampleSiteIdStub = sinon
        .stub(SampleStratumService.prototype, 'getSampleStratumsForSurveySampleSiteId')
        .resolves([{ survey_sample_stratum_id: 1 } as any]);

      const deleteSampleStratumRecordsStub = sinon
        .stub(SampleStratumService.prototype, 'deleteSampleStratumRecords')
        .resolves();

      const mockSurveySampleSiteId = 1;
      const mockSurveyId = 1;

      // Site
      sinon.stub(SampleSiteRepository.prototype, 'deleteSampleSiteRecord').resolves({
        survey_sample_site_id: mockSurveySampleSiteId,
        survey_id: mockSurveyId,
        name: 'Sample Site 1',
        description: '',
        geometry: null,
        geography: '',
        geojson: [],
        create_date: '',
        create_user: 1,
        update_date: '',
        update_user: 1,
        revision_count: 0
      });

      const { survey_sample_site_id } = await service.deleteSampleSiteRecord(mockSurveyId, 1);

      expect(getSampleBlocksForSurveySampleSiteIdStub).to.be.calledOnceWith(mockSurveySampleSiteId);
      expect(deleteSampleBlockRecordsStub).to.be.calledOnceWith([mockSurveySampleSiteId]);

      expect(getSampleStratumsForSurveySampleSiteIdStub).to.be.calledOnceWith(mockSurveySampleSiteId);
      expect(deleteSampleStratumRecordsStub).to.be.calledOnceWith([mockSurveySampleSiteId]);

      expect(survey_sample_site_id).to.be.eq(mockSurveySampleSiteId);
    });
  });

  describe('updateSampleSite', () => {
    it('should successfully update sample site blocks and stratums', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new SampleSiteService(mockDBConnection);

      const mockSurveyId = 1;
      const survey_sample_site_id = 1;

      const blocks = [
        {
          survey_sample_block_id: 2,
          survey_block_id: 3,
          survey_sample_site_id: survey_sample_site_id,
          create_date: '',
          create_user: 0,
          update_date: '',
          update_user: null,
          revision_count: 0
        } as UpdateSampleBlockRecord,
        {
          survey_block_id: 4,
          survey_sample_site_id: survey_sample_site_id
        } as UpdateSampleBlockRecord
      ];
      const stratums = [
        {
          survey_sample_stratum_id: 2,
          survey_stratum_id: 3,
          survey_sample_site_id: survey_sample_site_id,
          create_date: '',
          create_user: 0,
          update_date: '',
          update_user: null,
          revision_count: 0
        } as UpdateSampleStratumRecord,
        {
          survey_stratum_id: 4,
          survey_sample_site_id: survey_sample_site_id
        } as UpdateSampleStratumRecord
      ];

      const updateSampleSiteStub = sinon.stub(SampleSiteRepository.prototype, 'updateSampleSite').resolves();
      const insertSampleBlockStub = sinon.stub(SampleBlockService.prototype, 'insertSampleBlock').resolves();
      const insertSampleStratumStub = sinon.stub(SampleStratumService.prototype, 'insertSampleStratum').resolves();
      const deleteSampleBlocksNotInArrayStub = sinon
        .stub(SampleBlockService.prototype, 'deleteSampleBlocksNotInArray')
        .resolves();
      const deleteSampleStratumsNotInArrayStub = sinon
        .stub(SampleStratumService.prototype, 'deleteSampleStratumsNotInArray')
        .resolves();

      await service.updateSampleSite(mockSurveyId, {
        survey_sample_site_id: survey_sample_site_id,
        name: 'Cool new site',
        description: 'Check out this description',
        geojson: { type: 'Feature', geometry: {}, properties: {} } as any,
        blocks: blocks,
        stratums: stratums
      });

      expect(updateSampleSiteStub).to.be.calledOnceWith(mockSurveyId, {
        survey_sample_site_id: survey_sample_site_id,
        name: 'Cool new site',
        description: 'Check out this description',
        geojson: { type: 'Feature', geometry: {}, properties: {} },
        blocks: blocks,
        stratums: stratums
      });

      expect(deleteSampleBlocksNotInArrayStub).to.be.calledOnceWith(survey_sample_site_id, blocks);
      expect(deleteSampleStratumsNotInArrayStub).to.be.calledOnceWith(survey_sample_site_id, stratums);

      expect(insertSampleBlockStub).to.be.calledOnceWith({
        survey_block_id: 4,
        survey_sample_site_id: survey_sample_site_id
      });
      expect(insertSampleStratumStub).to.be.calledOnceWith({
        survey_stratum_id: 4,
        survey_sample_site_id: survey_sample_site_id
      });
    });
  });
});
