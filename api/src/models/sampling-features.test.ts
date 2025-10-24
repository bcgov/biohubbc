import { expect } from 'chai';
import { describe } from 'mocha';
import {
  PostSurveySamplingPeriodToBiohubObject,
  PostSurveySamplingSiteToBiohubObject,
  PostSurveySubmissionToBioHubObject,
  PostSurveyToBiohubObject
} from '../models/biohub-create';

describe('Sampling Features BioHub Integration', () => {
  describe('PostSurveySamplingSiteToBiohubObject', () => {
    it('should create a sampling site feature object', () => {
      const sampleSite = {
        survey_sample_site_id: 123,
        survey_id: 1,
        name: 'Test Sampling Site',
        description: 'A test site for sampling',
        geometry_type: 'Point',
        blocks: [],
        stratums: [],
        geojson: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-123.123, 49.123],
                [-123.124, 49.123],
                [-123.124, 49.124],
                [-123.123, 49.124],
                [-123.123, 49.123]
              ]
            ]
          },
          properties: {}
        }
      };

      const siteFeature = new PostSurveySamplingSiteToBiohubObject(sampleSite, 0);

      expect(siteFeature.id).to.equal('sample-site-123');
      expect(siteFeature.type).to.equal('sample_site');
      expect(siteFeature.properties.name).to.equal('Test Sampling Site');
      expect(siteFeature.properties.description).to.equal('A test site for sampling');
      expect(siteFeature.properties.geometry).to.deep.equal({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-123.123, 49.123],
                  [-123.124, 49.123],
                  [-123.124, 49.124],
                  [-123.123, 49.124],
                  [-123.123, 49.123]
                ]
              ]
            },
            properties: {}
          }
        ]
      });
      expect(siteFeature.child_features).to.be.an('array').with.length(0);
    });
  });

  describe('PostSurveySamplingPeriodToBiohubObject', () => {
    it('should create a sampling period feature object', () => {
      const samplePeriod = {
        survey_sample_period_id: 456,
        survey_id: 1,
        survey_sample_site_id: 123,
        method_technique_id: null,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        start_time: null,
        end_time: null,
        survey_sample_site: {
          survey_sample_site_id: 123,
          name: 'Test Site'
        },
        method_technique: null
      };

      const periodFeature = new PostSurveySamplingPeriodToBiohubObject(samplePeriod, 0);

      expect(periodFeature.id).to.equal('sample-period-456');
      expect(periodFeature.type).to.equal('sample_period');
      expect(periodFeature.properties.start_date).to.equal('2024-01-01T00:00:00.000Z');
      expect(periodFeature.properties.end_date).to.equal('2024-01-31T23:59:59.000Z');
      expect(periodFeature.properties.site_identifier).to.equal('123');
      expect(periodFeature.properties.comment).to.be.undefined;
      expect(periodFeature.child_features).to.be.an('array').with.length(0);
    });
  });

  describe('PostSurveyToBiohubObject with sampling features', () => {
    it('should include sampling site and period features in child_features', () => {
      const mockSurveyData = {
        id: 1,
        uuid: 'survey-uuid',
        survey_name: 'Test Survey',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        survey_types: [1],
        revision_count: 1,
        project_id: 1
      };

      const mockGeometry = { type: 'FeatureCollection', features: [] };

      const mockSamplingSites = [
        {
          survey_sample_site_id: 123,
          survey_id: 1,
          name: 'Site 1',
          description: 'First site',
          geometry_type: 'Point',
          blocks: [],
          stratums: [],
          geojson: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-123.123, 49.123],
                  [-123.124, 49.123],
                  [-123.124, 49.124],
                  [-123.123, 49.124],
                  [-123.123, 49.123]
                ]
              ]
            },
            properties: {}
          }
        }
      ];

      const mockSamplingPeriods = [
        {
          survey_sample_period_id: 456,
          survey_id: 1,
          survey_sample_site_id: 123,
          method_technique_id: null,
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          start_time: '08:00:00',
          end_time: '17:00:00',
          survey_sample_site: {
            survey_sample_site_id: 123,
            name: 'Site 1'
          },
          method_technique: null
        }
      ];

      const surveyObj = new PostSurveyToBiohubObject(
        mockSurveyData as any,
        [], // observations
        mockGeometry as any, // geometry
        [], // attachments
        [], // report attachments
        [], // animals
        [], // observation signs
        undefined, // environment definitions
        undefined, // measurement definitions
        mockSamplingSites, // sampling sites
        mockSamplingPeriods // sampling periods
      );

      expect(surveyObj.child_features).to.have.length(2);

      // Check sampling site feature
      const siteFeature = surveyObj.child_features.find((f) => f.type === 'sample_site');
      expect(siteFeature).to.exist;
      expect(siteFeature?.properties.name).to.equal('Site 1');

      // Check sampling period feature
      const periodFeature = surveyObj.child_features.find((f) => f.type === 'sample_period');
      expect(periodFeature).to.exist;
      expect(periodFeature?.properties.start_date).to.equal('2024-01-01T08:00:00.000Z');
      expect(periodFeature?.properties.end_date).to.equal('2024-01-07T17:00:00.000Z');
    });
  });

  describe('PostSurveySubmissionToBioHubObject with sampling features', () => {
    it('should include sampling features in the survey content', () => {
      const mockSurveyData = {
        id: 1,
        uuid: 'survey-uuid',
        survey_name: 'Test Survey with Sampling',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        survey_types: [1],
        revision_count: 1,
        project_id: 1
      };

      const mockPurposeAndMethodology = {
        additional_details: 'Test survey purpose'
      };

      const mockGeometry = { type: 'FeatureCollection', features: [] };

      const mockSamplingSites = [
        {
          survey_sample_site_id: 789,
          survey_id: 1,
          name: 'Comprehensive Site',
          description: 'Site with comprehensive sampling',
          geometry_type: 'Point',
          blocks: [],
          stratums: [],
          geojson: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-123.123, 49.123],
                  [-123.124, 49.123],
                  [-123.124, 49.124],
                  [-123.123, 49.124],
                  [-123.123, 49.123]
                ]
              ]
            },
            properties: {}
          }
        }
      ];

      const mockSamplingPeriods = [
        {
          survey_sample_period_id: 101,
          survey_id: 1,
          survey_sample_site_id: 789,
          method_technique_id: null,
          start_date: '2024-02-01',
          end_date: '2024-02-14',
          start_time: null,
          end_time: null,
          survey_sample_site: {
            survey_sample_site_id: 789,
            name: 'Comprehensive Site'
          },
          method_technique: null
        }
      ];

      const submissionObj = new PostSurveySubmissionToBioHubObject(
        mockSurveyData as any,
        mockPurposeAndMethodology as any,
        [], // observations
        mockGeometry as any, // geometry
        [], // attachments
        [], // report attachments
        'Test submission comment',
        [], // animals
        [], // observation signs
        undefined, // environment definitions
        undefined, // measurement definitions
        mockSamplingSites, // sampling sites
        mockSamplingPeriods // sampling periods
      );

      expect(submissionObj.id).to.equal('survey-uuid');
      expect(submissionObj.name).to.equal('Test Survey with Sampling');
      expect(submissionObj.comment).to.equal('Test submission comment');

      // Check that the survey content includes sampling features
      const surveyContent = submissionObj.content;
      expect(surveyContent.child_features).to.have.length(2);

      // Verify sampling site feature in submission
      const siteFeature = surveyContent.child_features.find((f) => f.type === 'sample_site');
      expect(siteFeature).to.exist;
      expect(siteFeature?.properties.name).to.equal('Comprehensive Site');

      // Verify sampling period feature in submission
      const periodFeature = surveyContent.child_features.find((f) => f.type === 'sample_period');
      expect(periodFeature).to.exist;
      expect(periodFeature?.properties.start_date).to.equal('2024-02-01T00:00:00.000Z');
      expect(periodFeature?.properties.end_date).to.equal('2024-02-14T23:59:59.000Z');
    });
  });
});
