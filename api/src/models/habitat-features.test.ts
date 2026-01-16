import { expect } from 'chai';
import { describe } from 'mocha';
import {
  PostSurveyHabitatFeatureToBiohubObject,
  PostSurveySubmissionToBioHubObject,
  PostSurveyToBiohubObject
} from '../models/biohub-create';
import { GetSurveyPurposeAndMethodologyData } from './survey-view';

describe('Habitat Features BioHub Integration', () => {
  describe('PostSurveyHabitatFeatureToBiohubObject', () => {
    it('should create a habitat feature object', () => {
      const habitatFeature = {
        survey_habitat_feature_id: 123,
        survey_id: 1,
        habitat_feature_type_id: 456,
        count: 5,
        latitude: 49.123,
        longitude: -123.456,
        observed_date: '2024-01-15',
        observed_time: '10:30:00',
        survey_sample_period_id: 789,
        survey_habitat_feature_taxons: [
          {
            survey_habitat_feature_taxon_id: 1,
            survey_habitat_feature_id: 123,
            itis_tsn: 180543,
            itis_scientific_name: 'Ursus americanus',
            comment: 'Black bear habitat'
          }
        ],
        survey_sample_site_id: 1,
        survey_sample_site_name: 'Test Site',
        method_technique_id: null,
        method_technique_name: null,
        survey_sample_period_start_datetime: '2024-01-15T10:00:00'
      };

      const habitatFeatureObj = new PostSurveyHabitatFeatureToBiohubObject(habitatFeature);

      expect(habitatFeatureObj.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(habitatFeatureObj.type).to.equal('habitat_feature');
      expect(habitatFeatureObj.properties.name).to.equal('code::habitat_feature_type::456');
      expect(habitatFeatureObj.properties.count).to.equal(5);
      expect(habitatFeatureObj.properties.timestamp).to.equal('2024-01-15T10:30:00Z');
      expect(habitatFeatureObj.properties.associated_species).to.deep.equal([{ taxon_id: 180543 }]);
      expect((habitatFeatureObj.properties.geometry as any).type).to.equal('FeatureCollection');
      expect((habitatFeatureObj.properties.geometry as any).features).to.have.length(1);
      expect((habitatFeatureObj.properties.geometry as any).features[0].geometry.coordinates).to.deep.equal([
        -123.456, 49.123
      ]);
      expect(habitatFeatureObj.child_features).to.be.an('array').with.length(0);
    });

    it('should handle habitat feature without time', () => {
      const habitatFeature = {
        survey_habitat_feature_id: 124,
        survey_id: 1,
        habitat_feature_type_id: 457,
        count: 3,
        latitude: 49.124,
        longitude: -123.457,
        observed_date: '2024-01-16',
        observed_time: null,
        survey_sample_period_id: 790,
        survey_habitat_feature_taxons: [],
        survey_sample_site_id: 1,
        survey_sample_site_name: 'Test Site 2',
        method_technique_id: null,
        method_technique_name: null,
        survey_sample_period_start_datetime: null
      };

      const habitatFeatureObj = new PostSurveyHabitatFeatureToBiohubObject(habitatFeature);

      expect(habitatFeatureObj.properties.timestamp).to.equal('2024-01-16T00:00:00.000Z');
      expect(habitatFeatureObj.properties).to.not.have.property('taxon_id');
    });

    it('should handle habitat feature without coordinates', () => {
      const habitatFeature = {
        survey_habitat_feature_id: 125,
        survey_id: 1,
        habitat_feature_type_id: 458,
        count: 2,
        latitude: null,
        longitude: null,
        observed_date: null,
        observed_time: null,
        survey_sample_period_id: null,
        survey_habitat_feature_taxons: [],
        survey_sample_site_id: null,
        survey_sample_site_name: null,
        method_technique_id: null,
        method_technique_name: null,
        survey_sample_period_start_datetime: null
      };

      const habitatFeatureObj = new PostSurveyHabitatFeatureToBiohubObject(habitatFeature);

      expect(habitatFeatureObj.properties.geometry).to.be.null;
      expect(habitatFeatureObj.properties.timestamp).to.be.null;
      expect(habitatFeatureObj.properties).to.not.have.property('taxon_id');
    });
  });

  describe('PostSurveyToBiohubObject with habitat features', () => {
    it('should include habitat features in child_features', () => {
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

      const mockHabitatFeatures = [
        {
          survey_habitat_feature_id: 123,
          survey_id: 1,
          habitat_feature_type_id: 456,
          count: 1,
          latitude: 49.123,
          longitude: -123.456,
          observed_date: '2024-01-15',
          observed_time: '14:30:00',
          survey_sample_period_id: null,
          survey_habitat_feature_taxons: [
            {
              survey_habitat_feature_taxon_id: 1,
              survey_habitat_feature_id: 123,
              itis_tsn: 180543,
              itis_scientific_name: 'Ursus americanus',
              comment: null
            }
          ],
          survey_sample_site_id: null,
          survey_sample_site_name: null,
          method_technique_id: null,
          method_technique_name: null,
          survey_sample_period_start_datetime: null
        }
      ];

      const surveyPurposeData: GetSurveyPurposeAndMethodologyData = {
        intended_outcome_ids: [],
        additional_details: 'Habitat features test objectives',
        revision_count: 1
      };

      const surveyObj = new PostSurveyToBiohubObject(
        mockSurveyData as any,
        surveyPurposeData,
        [], // observations
        mockGeometry as any, // geometry
        [], // attachments
        [], // report attachments
        {
          habitatFeatures: mockHabitatFeatures
        }
      );

      expect(surveyObj.child_features).to.have.length(1);
      expect(surveyObj.child_features[0].type).to.equal('habitat_feature');
      expect(surveyObj.child_features[0].properties.name).to.equal('code::habitat_feature_type::456');
    });
  });

  describe('PostSurveySubmissionToBioHubObject with habitat features', () => {
    it('should include habitat features in the survey content', () => {
      const mockSurveyData = {
        id: 1,
        uuid: 'survey-uuid',
        survey_name: 'Test Survey with Habitat Features',
        start_date: '2024-02-01',
        end_date: '2024-02-28',
        survey_types: [1],
        revision_count: 1,
        project_id: 1
      };

      const mockPurposeAndMethodology = {
        additional_details: 'Survey including habitat feature observations'
      };

      const mockGeometry = { type: 'FeatureCollection', features: [] };

      const mockHabitatFeatures = [
        {
          survey_habitat_feature_id: 200,
          survey_id: 1,
          habitat_feature_type_id: 500,
          count: 3,
          latitude: 49.2,
          longitude: -123.5,
          observed_date: '2024-02-15',
          observed_time: null,
          survey_sample_period_id: null,
          survey_habitat_feature_taxons: [
            {
              survey_habitat_feature_taxon_id: 2,
              survey_habitat_feature_id: 200,
              itis_tsn: 179913,
              itis_scientific_name: 'Cervus elaphus',
              comment: 'Elk feeding area'
            }
          ],
          survey_sample_site_id: null,
          survey_sample_site_name: null,
          method_technique_id: null,
          method_technique_name: null,
          survey_sample_period_start_datetime: null
        }
      ];

      const submissionObj = new PostSurveySubmissionToBioHubObject(
        mockSurveyData as any,
        mockPurposeAndMethodology as any,
        [], // observations
        {
          surveyGeometry: mockGeometry as any,
          surveyAttachments: [],
          surveyReports: [],
          submissionComment: 'Test submission with habitat features'
        },
        {
          habitatFeatures: mockHabitatFeatures
        }
      );

      expect(submissionObj.content.child_features).to.have.length(1);
      expect(submissionObj.content.child_features[0].type).to.equal('habitat_feature');
      expect(submissionObj.content.child_features[0].properties.name).to.equal('code::habitat_feature_type::500');
      expect(submissionObj.content.child_features[0].properties.count).to.equal(3);
      expect(submissionObj.content.child_features[0].properties.associated_species).to.deep.equal([
        { taxon_id: 179913 }
      ]);
    });
  });
});
