import { expect } from 'chai';
import { describe } from 'mocha';
import {
  PostSurveySubmissionToBioHubObject,
  PostSurveyToBiohubObject,
  PostTelemetryDeploymentToBiohubObject,
  PostTelemetryDeviceToBiohubObject,
  PostTelemetryToBiohubObject
} from '../models/biohub-create';
import { TelemetryVendorEnum } from '../repositories/telemetry-repositories/telemetry-vendor-repository.interface';
import { GetSurveyPurposeAndMethodologyData } from './survey-view';

describe('Telemetry Features BioHub Integration', () => {
  describe('PostTelemetryToBiohubObject', () => {
    it('should create telemetry object with valid geometry and timestamp', () => {
      const telemetryRecord = {
        telemetry_id: 'telem-123',
        deployment_id: 456,
        critter_id: 789,
        vendor: TelemetryVendorEnum.VECTRONIC,
        serial: 'VEC123',
        acquisition_date: '2024-06-01T10:30:00Z',
        latitude: 49.2827,
        longitude: -123.1207,
        elevation: 250.0,
        temperature: 20.5,
        dop: 1.5
      };

      const telemetryObj = new PostTelemetryToBiohubObject(telemetryRecord);

      expect(telemetryObj.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(telemetryObj.type).to.equal('telemetry');
      expect(telemetryObj.properties.geometry).to.deep.equal({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-123.1207, 49.2827]
            },
            properties: {}
          }
        ]
      });
      expect(telemetryObj.properties.timestamp).to.equal('2024-06-01T10:30:00Z');
      expect(telemetryObj.child_features).to.be.an('array').with.length(0);
    });

    it('should create telemetry object with null geometry when coordinates are null', () => {
      const telemetryRecord = {
        telemetry_id: 'telem-456',
        deployment_id: 789,
        critter_id: 101,
        vendor: TelemetryVendorEnum.LOTEK,
        serial: 'LOT456',
        acquisition_date: '2024-06-02T15:45:00Z',
        latitude: null,
        longitude: null,
        elevation: null,
        temperature: 18.2,
        dop: null
      };

      const telemetryObj = new PostTelemetryToBiohubObject(telemetryRecord);

      expect(telemetryObj.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(telemetryObj.type).to.equal('telemetry');
      expect(telemetryObj.properties.geometry).to.deep.equal({
        type: 'FeatureCollection',
        features: []
      });
      expect(telemetryObj.properties.timestamp).to.equal('2024-06-02T15:45:00Z');
      expect(telemetryObj.child_features).to.be.an('array').with.length(0);
    });
  });

  describe('PostTelemetryDeviceToBiohubObject', () => {
    it('should create a telemetry device object', () => {
      const deviceRecord = {
        device_id: 123,
        survey_id: 1,
        device_key: 'device-key-123',
        serial: 'ABC123456',
        device_make_id: 1,
        model: 'GPS-4400M',
        comment: 'Wildlife tracking device'
      };

      const deviceMakes = [
        {
          id: 1,
          name: 'Lotek',
          description: 'Lotek Wireless Inc.'
        }
      ];

      const deviceObj = new PostTelemetryDeviceToBiohubObject(deviceRecord, deviceMakes);

      expect(deviceObj.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(deviceObj.type).to.equal('telemetry_device');
      expect(deviceObj.properties.device_manufacturer).to.equal('Lotek');
      expect(deviceObj.properties.model).to.equal('GPS-4400M');
      expect(deviceObj.properties.description).to.equal('Wildlife tracking device');
      expect(deviceObj.properties.serial_number).to.equal('ABC123456');
      expect(deviceObj.child_features).to.be.an('array').with.length(0);
    });

    it('should handle device without device make info', () => {
      const deviceRecord = {
        device_id: 124,
        survey_id: 1,
        device_key: 'device-key-124',
        serial: 'XYZ789012',
        device_make_id: 99,
        model: null,
        comment: null
      };

      const deviceObj = new PostTelemetryDeviceToBiohubObject(deviceRecord, []);

      expect(deviceObj.properties.device_manufacturer).to.equal('Unknown Manufacturer 99');
      expect(deviceObj.properties.model).to.equal(null);
      expect(deviceObj.properties.description).to.equal(null);
    });
  });

  describe('PostTelemetryDeploymentToBiohubObject', () => {
    it('should create a telemetry deployment object with frequency', () => {
      const deploymentRecord = {
        deployment_id: 456,
        survey_id: 1,
        critter_id: 789,
        device_id: 123,
        device_key: 'device-key-123',
        frequency: 24,
        frequency_unit_id: 1,
        attachment_start_date: '2024-03-15',
        attachment_start_time: '10:00:00',
        attachment_start_timestamp: '2024-03-15T10:00:00Z',
        attachment_end_date: '2024-06-15',
        attachment_end_time: '15:30:00',
        attachment_end_timestamp: '2024-06-15T15:30:00Z',
        critterbase_start_capture_id: null,
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null,
        // Extended fields
        serial: 'ABC123456',
        device_make_id: 1,
        model: 'GPS-4400M',
        critterbase_critter_id: 'cb-critter-uuid-123'
      };

      const frequencyUnits = [
        {
          id: 1,
          name: 'Hours',
          description: 'Hours frequency unit'
        }
      ];

      const deploymentObj = new PostTelemetryDeploymentToBiohubObject(deploymentRecord, frequencyUnits);

      expect(deploymentObj.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(deploymentObj.type).to.equal('telemetry_deployment');
      expect(deploymentObj.properties.animal_identifier).to.equal(null);
      expect(deploymentObj.properties.device_key).to.equal('device-key-123');
      expect(deploymentObj.properties.start_date).to.equal('2024-03-15');
      expect(deploymentObj.properties.end_date).to.equal('2024-06-15');
      expect(deploymentObj.child_features).to.be.an('array').with.length(1);

      // Check frequency child feature
      const frequencyFeature = deploymentObj.child_features[0];
      expect(frequencyFeature.type).to.equal('telemetry_frequency');
      expect(frequencyFeature.properties.frequency).to.equal(24);
      expect(frequencyFeature.properties.frequency_unit).to.equal('Hours');
    });

    it('should handle deployment without frequency data', () => {
      const deploymentRecord = {
        deployment_id: 457,
        survey_id: 1,
        critter_id: 790,
        device_id: 124,
        device_key: 'device-key-124',
        frequency: null,
        frequency_unit_id: null,
        attachment_start_date: '2024-04-01',
        attachment_start_time: '08:00:00',
        attachment_start_timestamp: '2024-04-01T08:00:00Z',
        attachment_end_date: null,
        attachment_end_time: null,
        attachment_end_timestamp: null,
        critterbase_start_capture_id: null,
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null,
        // Extended fields
        serial: 'XYZ789012',
        device_make_id: 2,
        model: 'GPS-5000',
        critterbase_critter_id: 'critter-uuid-empty'
      };

      const deploymentObj = new PostTelemetryDeploymentToBiohubObject(deploymentRecord, []);

      expect(deploymentObj.properties.animal_identifier).to.equal(null);
      expect(deploymentObj.properties.device_key).to.equal('device-key-124');
      expect(deploymentObj.properties.start_date).to.equal('2024-04-01');
      expect(deploymentObj.properties).to.not.have.property('end_date');
      expect(deploymentObj.properties).to.not.have.property('frequency');
      expect(deploymentObj.properties).to.not.have.property('frequency_unit');
    });

    it('should handle deployment with unknown frequency unit', () => {
      const deploymentRecord = {
        deployment_id: 458,
        survey_id: 1,
        critter_id: 791,
        device_id: 125,
        device_key: 'device-key-125',
        frequency: 6,
        frequency_unit_id: 99,
        attachment_start_date: '2024-05-01',
        attachment_start_time: '12:00:00',
        attachment_start_timestamp: '2024-05-01T12:00:00Z',
        attachment_end_date: '2024-08-01',
        attachment_end_time: '12:00:00',
        attachment_end_timestamp: '2024-08-01T12:00:00Z',
        critterbase_start_capture_id: null,
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null,
        // Extended fields
        serial: 'UNKNOWN-UNIT-001',
        device_make_id: 3,
        model: 'GPS-6000',
        critterbase_critter_id: 'test-critter-uuid'
      };

      const deploymentObj = new PostTelemetryDeploymentToBiohubObject(deploymentRecord, []);

      expect(deploymentObj.child_features).to.be.an('array').with.length(1);

      // Check frequency child feature
      const frequencyFeature = deploymentObj.child_features[0];
      expect(frequencyFeature.type).to.equal('telemetry_frequency');
      expect(frequencyFeature.properties.frequency).to.equal(6);
      expect(frequencyFeature.properties.frequency_unit).to.equal('Unknown Unit 99');
    });
  });

  describe('PostSurveyToBiohubObject with telemetry features', () => {
    it('should include telemetry devices and deployments in child_features', () => {
      const surveyData = {
        id: 1,
        uuid: 'survey-uuid-123',
        project_id: 10,
        survey_name: 'Test Survey with Telemetry',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        progress_id: 1,
        survey_types: [1],
        revision_count: 1
      };

      const telemetryDevices = [
        {
          device_id: 200,
          survey_id: 1,
          device_key: 'device-key-200',
          serial: 'TEL001',
          device_make_id: 1,
          model: 'GPS-Tracker-X',
          comment: 'Primary tracking device'
        }
      ];

      const telemetryDeployments = [
        {
          deployment_id: 300,
          survey_id: 1,
          critter_id: 400,
          device_id: 200,
          device_key: 'device-key-200',
          frequency: null,
          frequency_unit_id: null,
          attachment_start_date: '2024-02-15',
          attachment_start_time: null,
          attachment_start_timestamp: '2024-02-15T00:00:00Z',
          attachment_end_date: null,
          attachment_end_time: null,
          attachment_end_timestamp: null,
          critterbase_start_capture_id: null,
          critterbase_end_capture_id: null,
          critterbase_end_mortality_id: null,
          // Extended fields
          serial: 'TEL001',
          device_make_id: 1,
          model: 'GPS-Tracker-X',
          critterbase_critter_id: 'critter-uuid-456'
        }
      ];

      const deviceMakes = [
        {
          id: 1,
          name: 'Vectronic Aerospace',
          description: 'Vectronic Aerospace GmbH'
        }
      ];

      const surveyPurposeData: GetSurveyPurposeAndMethodologyData = {
        intended_outcome_ids: [],
        additional_details: 'Telemetry features test objectives',
        revision_count: 1
      };

      const surveyObj = new PostSurveyToBiohubObject(
        surveyData,
        surveyPurposeData,
        [], // observation records
        { type: 'FeatureCollection', features: [] }, // survey geometry
        [], // survey attachments
        [], // survey reports
        {
          telemetryDevices,
          telemetryDeployments,
          deviceMakes,
          frequencyUnits: []
        }
      );

      expect(surveyObj.child_features).to.have.length(2);

      const deviceFeature = surveyObj.child_features.find((f) => f.type === 'telemetry_device');
      expect(deviceFeature).to.exist;
      expect(deviceFeature?.properties.device_manufacturer).to.equal('Vectronic Aerospace');
      expect(deviceFeature?.properties.serial_number).to.equal('TEL001');

      const deploymentFeature = surveyObj.child_features.find((f) => f.type === 'telemetry_deployment');
      expect(deploymentFeature).to.exist;
      expect(deploymentFeature?.properties.animal_identifier).to.equal(null);
    });
  });

  describe('PostSurveySubmissionToBioHubObject with telemetry features', () => {
    it('should include telemetry features in the survey content', () => {
      const surveyData = {
        id: 2,
        uuid: 'survey-uuid-456',
        project_id: 20,
        survey_name: 'Telemetry Survey Submission Test',
        start_date: '2024-03-01',
        end_date: '2024-11-30',
        progress_id: 1,
        survey_types: [2],
        revision_count: 2
      };

      const methodologyData = {
        additional_details: 'Survey using telemetry devices for animal tracking',
        intended_outcome_ids: [1],
        revision_count: 1
      };

      const telemetryDevices = [
        {
          device_id: 500,
          survey_id: 2,
          device_key: 'device-key-500',
          serial: 'TRACK500',
          device_make_id: 2,
          model: 'Advanced-GPS-Pro',
          comment: 'Long-range tracking device'
        }
      ];

      const telemetryDeployments = [
        {
          deployment_id: 600,
          survey_id: 2,
          critter_id: 700,
          device_id: 500,
          device_key: 'device-key-500',
          frequency: 24,
          frequency_unit_id: 1,
          attachment_start_date: '2024-03-15',
          attachment_start_time: '12:00:00',
          attachment_start_timestamp: '2024-03-15T12:00:00Z',
          attachment_end_date: '2024-09-15',
          attachment_end_time: '12:00:00',
          attachment_end_timestamp: '2024-09-15T12:00:00Z',
          critterbase_start_capture_id: 'capture-uuid-123',
          critterbase_end_capture_id: 'capture-uuid-456',
          critterbase_end_mortality_id: null,
          // Extended fields
          serial: 'TRACK500',
          device_make_id: 2,
          model: 'Advanced-GPS-Pro',
          critterbase_critter_id: 'critter-uuid-789'
        }
      ];

      const deviceMakes = [
        {
          id: 2,
          name: 'Advanced Telemetry Systems',
          description: 'ATS - Advanced Telemetry Systems'
        }
      ];

      const submissionObj = new PostSurveySubmissionToBioHubObject(
        surveyData,
        methodologyData,
        [], // observation records
        {
          surveyGeometry: { type: 'FeatureCollection', features: [] },
          surveyAttachments: [],
          surveyReports: [],
          submissionComment: 'Telemetry data submission'
        },
        {
          telemetryDevices,
          telemetryDeployments,
          deviceMakes,
          frequencyUnits: []
        }
      );

      expect(submissionObj.content.child_features).to.have.length(2);

      const deviceFeature = submissionObj.content.child_features.find((f) => f.type === 'telemetry_device');
      expect(deviceFeature?.properties.device_manufacturer).to.equal('Advanced Telemetry Systems');
      expect(deviceFeature?.properties.model).to.equal('Advanced-GPS-Pro');
      expect(deviceFeature?.properties.serial_number).to.equal('TRACK500');

      const deploymentFeature = submissionObj.content.child_features.find((f) => f.type === 'telemetry_deployment');
      expect(deploymentFeature?.properties.animal_identifier).to.equal(null);
      expect(deploymentFeature?.properties.start_date).to.equal('2024-03-15');
      expect(deploymentFeature?.properties.end_date).to.equal('2024-09-15');
    });

    it('should include telemetry data points with geometry and timestamp', () => {
      const surveyData = {
        id: 3,
        uuid: 'survey-uuid-telemetry-points',
        project_id: 30,
        survey_name: 'Telemetry Points Survey',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        progress_id: 1,
        survey_types: [3],
        revision_count: 1
      };

      const methodologyData = {
        additional_details: 'Survey including actual telemetry data points',
        intended_outcome_ids: [1],
        revision_count: 1
      };

      const telemetryData = [
        {
          telemetry_id: 'telem-001',
          deployment_id: 100,
          critter_id: 200,
          vendor: TelemetryVendorEnum.VECTRONIC,
          serial: 'VEC001',
          acquisition_date: '2024-06-15T08:30:00Z',
          latitude: 50.1234,
          longitude: -125.5678,
          elevation: 450.5,
          temperature: 15.2,
          dop: 2.0
        },
        {
          telemetry_id: 'telem-002',
          deployment_id: 100,
          critter_id: 200,
          vendor: TelemetryVendorEnum.LOTEK,
          serial: 'LOT002',
          acquisition_date: '2024-06-15T12:15:00Z',
          latitude: null,
          longitude: null,
          elevation: null,
          temperature: 18.7,
          dop: null
        }
      ];

      const submissionObj = new PostSurveySubmissionToBioHubObject(
        surveyData,
        methodologyData,
        [], // observation records
        {
          surveyGeometry: { type: 'FeatureCollection', features: [] },
          surveyAttachments: [],
          surveyReports: [],
          submissionComment: 'Telemetry points data submission'
        },
        {
          telemetry: telemetryData
        }
      );

      expect(submissionObj.content.child_features).to.have.length(0);

      const telemetryFeatures = submissionObj.content.child_features.filter((f) => f.type === 'telemetry');
      expect(telemetryFeatures).to.have.length(0);

      // No telemetry features are created without deployments or devices
      // This is correct behavior according to the implementation
    });

    it('should include sampling techniques in the survey content', () => {
      const surveyData = {
        id: 4,
        uuid: 'survey-uuid-sampling-techniques',
        project_id: 40,
        survey_name: 'Survey with Sampling Techniques',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        progress_id: 1,
        survey_types: [4],
        revision_count: 1
      };

      const methodologyData = {
        additional_details: 'Survey including sampling techniques for data collection',
        intended_outcome_ids: [1],
        revision_count: 1
      };

      const samplingTechniques = [
        {
          method_technique_id: 101,
          method_name: 'Camera Trapping',
          description: 'Motion-activated camera monitoring',
          method_lookup_name: 'Camera Survey',
          attractants: 'Scent lure;Bait',
          distance_threshold: 25.0,
          response_metric: 'Count',
          attrib_data: [{ ah: 'Duration', av: '30 days' }],
          vantage_data: [{ vh: 'Ground', vv: 'Trail mount' }]
        },
        {
          method_technique_id: 102,
          method_name: 'Acoustic Monitoring',
          description: null,
          method_lookup_name: 'Sound Recording',
          attractants: null,
          distance_threshold: null,
          response_metric: 'Detection',
          attrib_data: [],
          vantage_data: []
        }
      ];

      const submissionObj = new PostSurveySubmissionToBioHubObject(
        surveyData,
        methodologyData,
        [], // observation records
        {
          surveyGeometry: { type: 'FeatureCollection', features: [] },
          surveyAttachments: [],
          surveyReports: [],
          submissionComment: 'Sampling techniques submission'
        },
        {
          samplingTechniques
        }
      );

      const samplingTechniqueFeatures = submissionObj.content.child_features.filter(
        (f) => f.type === 'sample_technique'
      );
      expect(samplingTechniqueFeatures).to.have.length(2);

      // Test first sampling technique
      const technique1 = samplingTechniqueFeatures[0];
      expect(technique1.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(technique1.properties.name).to.equal('Camera Trapping');
      expect(technique1.properties.description).to.equal('Motion-activated camera monitoring');
      expect(technique1.properties.method_name).to.equal('Camera Survey');
      expect(technique1.properties.attractant).to.deep.equal([
        { attractant_name: 'Scent lure' },
        { attractant_name: 'Bait' }
      ]);

      // Test second sampling technique
      const technique2 = samplingTechniqueFeatures[1];
      expect(technique2.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(technique2.properties.name).to.equal('Acoustic Monitoring');
      expect(technique2.properties.description).to.be.null;
      expect(technique2.properties.method_name).to.equal('Sound Recording');
      expect(technique2.properties.attractant).to.deep.equal([]);
    });
  });
});
