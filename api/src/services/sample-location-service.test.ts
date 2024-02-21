import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SampleLocationRepository } from '../repositories/sample-location-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { PostSampleLocations, SampleLocationService } from './sample-location-service';
import { SampleMethodService } from './sample-method-service';

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
            feature: {
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
        methods: [
          {
            survey_sample_site_id: 1,
            method_lookup_id: 1,
            description: '',
            periods: [
              {
                survey_sample_method_id: 1,
                start_date: '2023-01-01',
                end_date: '2023-01-03',
                start_time: '12:00:00',
                end_time: '13:00:00'
              }
            ]
          }
        ]
      };

      const insertSample = sinon.stub(SampleLocationRepository.prototype, 'insertSampleLocation').resolves({
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
        revision_count: 0,
        sample_methods: []
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
          geography: [],
          create_date: '',
          create_user: 1,
          update_date: '',
          update_user: 1,
          revision_count: 0,
          sample_methods: []
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
    })
  });

  describe('deleteSampleLocationRecord', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new SampleLocationService(mockDBConnection);

      const getSampleMethodsForSurveySampleSiteIdStub = sinon
        .stub(SampleMethodService.prototype, 'getSampleMethodsForSurveySampleSiteId')
        .resolves([{ survey_sample_method_id: 1 } as any]);

      const deleteSampleMethodRecordStub = sinon
        .stub(SampleMethodService.prototype, 'deleteSampleMethodRecord')
        .resolves();

      sinon.stub(SampleLocationRepository.prototype, 'deleteSampleLocationRecord').resolves({
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
        revision_count: 0,
        sample_methods: []
      });

      const { survey_sample_site_id } = await service.deleteSampleLocationRecord(1);

      expect(survey_sample_site_id).to.be.eq(1);
      expect(getSampleMethodsForSurveySampleSiteIdStub).to.be.calledOnceWith(1);
      expect(deleteSampleMethodRecordStub).to.be.calledOnceWith(1);
    });
  });

  describe('updateSampleLocationMethodPeriod', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new SampleLocationService(mockDBConnection);

      const survey_sample_site_id = 1;
      const methods = [
        { survey_sample_method_id: 2, method_lookup_id: 3, description: 'Cool method', periods: [] } as any,
        { method_lookup_id: 4, description: 'Cool method', periods: [] } as any
      ];

      const updateSampleLocationStub = sinon.stub(SampleLocationRepository.prototype, 'updateSampleLocation').resolves({
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
        revision_count: 0,
        sample_methods: []
      });
      const insertSampleMethodStub = sinon.stub(SampleMethodService.prototype, 'insertSampleMethod').resolves();
      const updateSampleMethodStub = sinon.stub(SampleMethodService.prototype, 'updateSampleMethod').resolves();
      const checkSampleMethodsToDeleteStub = sinon
        .stub(SampleMethodService.prototype, 'deleteSampleMethodsNotInArray')
        .resolves();

      await service.updateSampleLocationMethodPeriod({
        survey_sample_site_id: survey_sample_site_id,
        survey_id: 1,
        name: 'Cool new site',
        description: 'Check out this description',
        geojson: { type: 'Feature', geometry: {}, properties: {} } as any,
        methods: methods
      });

      expect(updateSampleLocationStub).to.be.calledOnceWith({
        survey_sample_site_id: survey_sample_site_id,
        survey_id: 1,
        name: 'Cool new site',
        description: 'Check out this description',
        geojson: { type: 'Feature', geometry: {}, properties: {} },
        methods: methods
      });
      expect(checkSampleMethodsToDeleteStub).to.be.calledOnceWith(survey_sample_site_id, methods);
      expect(insertSampleMethodStub).to.be.calledOnceWith({
        survey_sample_site_id: survey_sample_site_id,
        method_lookup_id: 4,
        description: 'Cool method',
        periods: []
      });
      expect(updateSampleMethodStub).to.be.calledOnceWith({
        survey_sample_site_id: survey_sample_site_id,
        survey_sample_method_id: 2,
        method_lookup_id: 3,
        description: 'Cool method',
        periods: []
      });
    });
  });
});
