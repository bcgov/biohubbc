import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { UpdateSampleBlockRecord } from '../repositories/sample-blocks-repository';
import { SampleLocationRepository } from '../repositories/sample-location-repository';
import { UpdateSampleStratumRecord } from '../repositories/sample-stratums-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { SampleBlockService } from './sample-block-service';
import { PostSampleLocations, SampleLocationService } from './sample-location-service';
import { SampleMethodService } from './sample-method-service';
import { SampleStratumService } from './sample-stratum-service';

chai.use(sinonChai);

describe('SampleLocationService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insertSampleLocations', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new SampleLocationService(mockDBConnection);
      const mockData: PostSampleLocations = {
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
        sample_methods: [
          {
            survey_sample_site_id: 1,
            method_lookup_id: 1,
            method_response_metric_id: 1,
            description: '',
            sample_periods: [
              {
                survey_sample_method_id: 1,
                start_date: '2023-01-01',
                end_date: '2023-01-03',
                start_time: '12:00:00',
                end_time: '13:00:00'
              }
            ]
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

      const insertSample = sinon.stub(SampleLocationRepository.prototype, 'insertSampleSite').resolves({
        survey_sample_site_id: 1,
        survey_id: 1,
        name: 'Sample Site 1',
        description: '',
        geojson: [],
        geography: [],
        create_date: '',
        create_user: 1,
        update_date: '',
        update_user: 1,
        revision_count: 0
      });
      const insertMethod = sinon.stub(SampleMethodService.prototype, 'insertSampleMethod').resolves();

      await service.insertSampleLocations(mockData);

      expect(insertSample).to.be.called;
      expect(insertMethod).to.be.called;
    });
  });

  describe('getSampleLocationsForSurveyId', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new SampleLocationService(mockDBConnection);

      sinon.stub(SampleLocationRepository.prototype, 'getSampleLocationsForSurveyId').resolves([
        {
          survey_sample_site_id: 1,
          survey_id: 1,
          name: 'Sample Site 1',
          description: '',
          geojson: [],
          sample_blocks: [],
          sample_methods: [],
          sample_stratums: []
        }
      ]);

      const response = await service.getSampleLocationsForSurveyId(1);

      expect(response).to.have.lengthOf(1);
      response.forEach((item) => {
        expect(item.survey_id).to.eq(1);
      });
    });
  });

  describe('getSampleLocationsCountBySurveyId', () => {
    it('should return the sample site count successfully', async () => {
      const dbConnectionObj = getMockDBConnection();

      const repoStub = sinon.stub(SampleLocationRepository.prototype, 'getSampleLocationsCountBySurveyId').resolves(20);
      const surveyService = new SampleLocationService(dbConnectionObj);
      const response = await surveyService.getSampleLocationsCountBySurveyId(1001);

      expect(repoStub).to.be.calledOnceWith(1001);
      expect(response).to.equal(20);
    });
  });

  describe('deleteSampleSiteRecord', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new SampleLocationService(mockDBConnection);

      // Methods
      const getSampleMethodsForSurveySampleSiteIdStub = sinon
        .stub(SampleMethodService.prototype, 'getSampleMethodsForSurveySampleSiteId')
        .resolves([{ survey_sample_method_id: 1 } as any]);

      const deleteSampleMethodRecordStub = sinon
        .stub(SampleMethodService.prototype, 'deleteSampleMethodRecord')
        .resolves();

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

      // Site
      sinon.stub(SampleLocationRepository.prototype, 'deleteSampleSiteRecord').resolves({
        survey_sample_site_id: 1,
        survey_id: 1,
        name: 'Sample Site 1',
        description: '',
        geojson: [],
        geography: [],
        create_date: '',
        create_user: 1,
        update_date: '',
        update_user: 1,
        revision_count: 0
      });

      const mockSurveyId = 1;
      const { survey_sample_site_id } = await service.deleteSampleSiteRecord(mockSurveyId, 1);

      expect(getSampleBlocksForSurveySampleSiteIdStub).to.be.calledOnceWith(survey_sample_site_id);
      expect(deleteSampleBlockRecordsStub).to.be.calledOnceWith([survey_sample_site_id]);

      expect(getSampleStratumsForSurveySampleSiteIdStub).to.be.calledOnceWith(survey_sample_site_id);
      expect(deleteSampleStratumRecordsStub).to.be.calledOnceWith([survey_sample_site_id]);

      expect(survey_sample_site_id).to.be.eq(survey_sample_site_id);
      expect(getSampleMethodsForSurveySampleSiteIdStub).to.be.calledOnceWith(survey_sample_site_id);
      expect(deleteSampleMethodRecordStub).to.be.calledOnceWith(survey_sample_site_id);
    });
  });

  describe('updateSampleLocationMethodPeriod', () => {
    it('should successfully update smaple location method and period', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new SampleLocationService(mockDBConnection);

      const mockSurveyId = 1;
      const survey_sample_site_id = 1;

      const methods = [
        {
          survey_sample_method_id: 2,
          method_lookup_id: 3,
          method_response_metric_id: 1,
          description: 'Cool method',
          sample_periods: []
        } as any,
        { method_lookup_id: 4, method_response_metric_id: 1, description: 'Cool method', sample_periods: [] } as any
      ];
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

      const updateSampleLocationStub = sinon.stub(SampleLocationRepository.prototype, 'updateSampleSite').resolves({
        survey_sample_site_id: survey_sample_site_id,
        survey_id: 1,
        name: 'Cool new site',
        description: 'Check out this description',
        geojson: [],
        geography: [],
        create_date: '',
        create_user: 1,
        update_date: '',
        update_user: 1,
        revision_count: 0
      });
      const insertSampleMethodStub = sinon.stub(SampleMethodService.prototype, 'insertSampleMethod').resolves();
      const insertSampleBlockStub = sinon.stub(SampleBlockService.prototype, 'insertSampleBlock').resolves();
      const insertSampleStratumStub = sinon.stub(SampleStratumService.prototype, 'insertSampleStratum').resolves();
      const updateSampleMethodStub = sinon.stub(SampleMethodService.prototype, 'updateSampleMethod').resolves();
      const deleteSampleMethodsNotInArrayStub = sinon
        .stub(SampleMethodService.prototype, 'deleteSampleMethodsNotInArray')
        .resolves();
      const deleteSampleBlocksNotInArrayStub = sinon
        .stub(SampleBlockService.prototype, 'deleteSampleBlocksNotInArray')
        .resolves();
      const deleteSampleStratumsNotInArrayStub = sinon
        .stub(SampleStratumService.prototype, 'deleteSampleStratumsNotInArray')
        .resolves();

      await service.updateSampleLocationMethodPeriod(mockSurveyId, {
        survey_sample_site_id: survey_sample_site_id,
        survey_id: 1,
        name: 'Cool new site',
        description: 'Check out this description',
        geojson: { type: 'Feature', geometry: {}, properties: {} } as any,
        methods: methods,
        blocks: blocks,
        stratums: stratums
      });

      expect(updateSampleLocationStub).to.be.calledOnceWith({
        survey_sample_site_id: survey_sample_site_id,
        survey_id: 1,
        name: 'Cool new site',
        description: 'Check out this description',
        geojson: { type: 'Feature', geometry: {}, properties: {} },
        methods: methods,
        blocks: blocks,
        stratums: stratums
      });

      expect(deleteSampleMethodsNotInArrayStub).to.be.calledOnceWith(1, survey_sample_site_id, methods);
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
      expect(insertSampleMethodStub).to.be.calledOnceWith({
        survey_sample_site_id: survey_sample_site_id,
        method_lookup_id: 4,

        method_response_metric_id: 1,
        description: 'Cool method',
        sample_periods: []
      });
      expect(updateSampleMethodStub).to.be.calledOnceWith(mockSurveyId, {
        survey_sample_site_id: survey_sample_site_id,
        survey_sample_method_id: 2,
        method_lookup_id: 3,
        method_response_metric_id: 1,
        description: 'Cool method',
        sample_periods: []
      });
    });
  });
});
