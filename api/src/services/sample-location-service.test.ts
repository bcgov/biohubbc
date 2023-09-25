import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { PostSampleLocations, SampleLocationRepository } from '../repositories/sample-location-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { SampleLocationService } from './sample-location-service';
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
        name: `Sample Site 1`,
        description: ``,
        survey_sample_sites: [
          {
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
        ],
        methods: [
          {
            survey_sample_method_id: null,
            survey_sample_site_id: null,
            method_lookup_id: 1,
            description: '',
            periods: [
              {
                survey_sample_period_id: null,
                survey_sample_method_id: null,
                start_date: '2023-01-01',
                end_date: '2023-01-03'
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
          geography: [],
          create_date: '',
          create_user: 1,
          update_date: '',
          update_user: 1,
          revision_count: 0
        }
      ]);

      const response = await service.getSampleLocationsForSurveyId(1);

      expect(response).to.have.lengthOf(1);
      response.forEach((item) => {
        expect(item.survey_id).to.eq(1);
      });
    });
  });

  describe('deleteSampleLocationRecord', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new SampleLocationService(mockDBConnection);

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
        revision_count: 0
      });

      const { survey_sample_site_id } = await service.deleteSampleLocationRecord(1);

      expect(survey_sample_site_id).to.be.eq(1);
    });
  });

  describe('updateSampleLocation', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const service = new SampleLocationService(mockDBConnection);

      sinon.stub(SampleLocationRepository.prototype, 'updateSampleLocation').resolves({
        survey_sample_site_id: 1,
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

      const { name, description } = await service.updateSampleLocation({
        survey_sample_site_id: 1,
        survey_id: 1,
        name: 'Cool new site',
        description: 'Check out this description',
        survey_sample_site: {
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
      });

      expect(name).to.be.eq('Cool new site');
      expect(description).to.be.eq('Check out this description');
    });
  });
});
