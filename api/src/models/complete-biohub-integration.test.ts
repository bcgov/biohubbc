import { expect } from 'chai';
import { describe } from 'mocha';
import { PostSurveyToBiohubObject } from '../models/biohub-create';
import { GetSurveyPurposeAndMethodologyData } from './survey-view';

describe('Complete BioHub Integration', () => {
  describe('PostSurveyToBiohubObject with all feature types', () => {
    it('should include habitat features, telemetry devices, and telemetry deployments', () => {
      const surveyData = {
        id: 100,
        uuid: 'complete-survey-uuid',
        project_id: 50,
        survey_name: 'Complete Survey with All Features',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        progress_id: 1,
        survey_types: [1, 2],
        revision_count: 1
      };

      // Habitat Features
      const habitatFeatures = [
        {
          survey_habitat_feature_id: 301,
          survey_id: 100,
          habitat_feature_type_id: 1,
          count: 2,
          latitude: 49.123,
          longitude: -123.456,
          observed_date: '2024-06-15',
          observed_time: '14:30:00',
          survey_sample_period_id: 401,
          survey_habitat_feature_taxons: [
            {
              survey_habitat_feature_taxon_id: 501,
              survey_habitat_feature_id: 301,
              itis_tsn: 180543,
              itis_scientific_name: 'Ursus americanus',
              comment: 'Black bear den site'
            }
          ],
          survey_sample_site_id: 201,
          survey_sample_site_name: 'Forest Site A',
          method_technique_id: 1,
          method_technique_name: 'Direct Observation',
          survey_sample_period_start_datetime: '2024-06-15T14:00:00'
        }
      ];

      // Telemetry Devices
      const telemetryDevices = [
        {
          device_id: 601,
          survey_id: 100,
          device_key: 'device-key-601',
          serial: 'GPS-DEV-001',
          device_make_id: 1,
          model: 'GPS-Tracker-Pro',
          comment: 'High-accuracy GPS collar'
        }
      ];

      // Telemetry Deployments
      const telemetryDeployments = [
        {
          deployment_id: 701,
          survey_id: 100,
          critter_id: 801,
          device_id: 601,
          device_key: 'device-key-601',
          frequency: 12,
          frequency_unit_id: 1,
          attachment_start_date: '2024-03-01',
          attachment_start_time: '10:00:00',
          attachment_start_timestamp: '2024-03-01T10:00:00Z',
          attachment_end_date: '2024-08-31',
          attachment_end_time: '16:00:00',
          attachment_end_timestamp: '2024-08-31T16:00:00Z',
          critterbase_start_capture_id: 'capture-start-uuid',
          critterbase_end_capture_id: 'capture-end-uuid',
          critterbase_end_mortality_id: null,
          // Extended fields
          serial: 'GPS-DEV-001',
          device_make_id: 1,
          model: 'GPS-Tracker-Pro',
          critterbase_critter_id: 'bear-critter-uuid'
        }
      ];

      const surveyPurposeData: GetSurveyPurposeAndMethodologyData = {
        intended_outcome_ids: [1, 2],
        additional_details: 'Complete integration test objectives',
        revision_count: 1
      };

      // Create survey object with all features
      const surveyObj = new PostSurveyToBiohubObject(
        surveyData,
        surveyPurposeData,
        [], // observation records
        { type: 'FeatureCollection', features: [] }, // survey geometry
        [], // survey attachments
        [], // survey reports
        {
          habitatFeatures,
          telemetryDevices,
          telemetryDeployments
        }
      );

      // Verify all feature types are included
      expect(surveyObj.child_features).to.have.length(3);

      // Verify habitat feature
      const habitatFeature = surveyObj.child_features.find((f) => f.type === 'habitat_feature');
      expect(habitatFeature).to.exist;
      expect(habitatFeature?.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(habitatFeature?.properties.name).to.equal('code::habitat_feature_type::1');
      expect(habitatFeature?.properties.count).to.equal(2);
      expect(habitatFeature?.properties.timestamp).to.equal('2024-06-15T14:30:00Z');
      expect(habitatFeature?.properties.associated_species).to.deep.equal([180543]);

      // Verify telemetry device
      const deviceFeature = surveyObj.child_features.find((f) => f.type === 'telemetry_device');
      expect(deviceFeature).to.exist;
      expect(deviceFeature?.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(deviceFeature?.properties.device_manufacturer).to.equal('code::device_make::1');
      expect(deviceFeature?.properties.device_model).to.equal('GPS-Tracker-Pro');
      expect(deviceFeature?.properties.serial_number).to.equal('GPS-DEV-001');
      expect(deviceFeature?.properties.description).to.equal('High-accuracy GPS collar');

      // Verify telemetry deployment
      const deploymentFeature = surveyObj.child_features.find((f) => f.type === 'telemetry_deployment');
      expect(deploymentFeature).to.exist;
      expect(deploymentFeature?.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(deploymentFeature?.properties.animal_identifier).to.equal(null);
      expect(deploymentFeature?.properties.start_date).to.equal('2024-03-01');
      expect(deploymentFeature?.properties.end_date).to.equal('2024-08-31');
    });
  });
});
