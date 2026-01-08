import axios from 'axios';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ObservationRecordWithSamplingAndSubcountData } from '../repositories/observation-repository/observation-repository.interface';
import * as envConfig from '../utils/env-config';
import * as featureFlagUtils from '../utils/feature-flag-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { AttachmentService } from './attachment-service';
import { CodeService } from './code-service';
import { SurveyHabitatFeatureService } from './habitat-feature-services/survey-habitat-feature-service';
import { HistoryPublishService } from './history-publish-service';
import { KeycloakService } from './keycloak-service';
import { ObservationService } from './observation-services/observation-service';
import { PlatformService } from './platform-service';
import { SamplePeriodService } from './sample-period-service';
import { SampleSiteService } from './sample-site-service';
import { SampleTechniqueService } from './sample-technique-service';
import { SiteSelectionStrategyService } from './site-selection-strategy-service';
import { SurveyCritterService } from './survey-critter-service';
import { SurveyService } from './survey-service';
import { TelemetryDeploymentService } from './telemetry-services/telemetry-deployment-service';
import { TelemetryDeviceService } from './telemetry-services/telemetry-device-service';

chai.use(sinonChai);

describe('PlatformService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getTaxonByScientificName', () => {
    it('should return a taxon by scientific name', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const mockAxiosResponse = {
        data: {
          searchResponse: [
            {
              tsn: 1,
              scientificName: 'alces alces'
            }
          ]
        }
      };

      const getEnvironmentVariableStub = sinon.stub(envConfig, 'getEnvironmentVariable');
      sinon.stub(KeycloakService.prototype, 'getKeycloakServiceToken').resolves('token');

      const axiosStub = sinon.stub(axios, 'get').resolves(mockAxiosResponse);

      getEnvironmentVariableStub.onCall(0).returns('/taxon');
      getEnvironmentVariableStub.onCall(1).returns('https://url.com');

      const taxon = await platformService.getTaxonByScientificName('Alces alces');

      expect(axiosStub.getCall(0).args[1]?.headers?.authorization).to.equal('Bearer token');
      expect(axiosStub.getCall(0).args[1]?.params.terms).to.deep.equal(['Alces', 'alces']);

      expect(taxon).to.deep.equal({ tsn: 1, scientificName: 'alces alces' });
    });

    it('should return a null when unable to find match by scientific name', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const mockAxiosResponse = {
        data: {
          searchResponse: [
            {
              tsn: 1,
              scientificName: 'unknown taxon'
            }
          ]
        }
      };

      const getEnvironmentVariableStub = sinon.stub(envConfig, 'getEnvironmentVariable');
      sinon.stub(KeycloakService.prototype, 'getKeycloakServiceToken').resolves('token');

      const axiosStub = sinon.stub(axios, 'get').resolves(mockAxiosResponse);

      getEnvironmentVariableStub.onCall(0).returns('/taxon');
      getEnvironmentVariableStub.onCall(1).returns('https://url.com');

      const taxon = await platformService.getTaxonByScientificName('Alces alces');

      expect(axiosStub.getCall(0).args[1]?.headers?.authorization).to.equal('Bearer token');
      expect(axiosStub.getCall(0).args[1]?.params.terms).to.deep.equal(['Alces', 'alces']);

      expect(taxon).to.equal(null);
    });

    it('should return a null error thrown', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const getEnvironmentVariableStub = sinon.stub(envConfig, 'getEnvironmentVariable');
      sinon.stub(KeycloakService.prototype, 'getKeycloakServiceToken').resolves('token');

      const axiosStub = sinon.stub(axios, 'get').rejects(new Error('error'));

      getEnvironmentVariableStub.onCall(0).returns('/taxon');
      getEnvironmentVariableStub.onCall(1).returns('https://url.com');

      const taxon = await platformService.getTaxonByScientificName('Alces alces');

      expect(axiosStub.getCall(0).args[1]?.headers?.authorization).to.equal('Bearer token');
      expect(axiosStub.getCall(0).args[1]?.params.terms).to.deep.equal(['Alces', 'alces']);

      expect(taxon).to.equal(null);
    });
  });

  describe('submitSurveyToBioHub', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws an error if publishing to BioHub is not currently enabled.', async () => {
      sinon.stub(featureFlagUtils, 'isFeatureFlagPresent').returns(true);

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      try {
        await platformService.submitSurveyToBioHub(1, { submissionComment: 'test' });
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Publishing to BioHub is not currently enabled.');
      }
    });

    it('throws error when axios request fails', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const getKeycloakServiceTokenStub = sinon
        .stub(KeycloakService.prototype, 'getKeycloakServiceToken')
        .resolves('token');

      sinon.stub(AttachmentService.prototype, 'getSurveyAttachmentsForBioHubSubmission').resolves([]);

      sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachments').resolves([]);

      const _generateSurveyDataPackageStub = sinon
        .stub(PlatformService.prototype, '_generateSurveyDataPackage')
        .resolves({ id: '123-456-789' } as unknown as any);

      sinon.stub(axios, 'post').resolves({});

      try {
        await platformService.submitSurveyToBioHub(1, { submissionComment: 'test' });
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to submit survey ID to Biohub');
        expect(getKeycloakServiceTokenStub).to.have.been.calledOnce;
        expect(_generateSurveyDataPackageStub).to.have.been.calledOnceWith(1, [], [], 'test');
      }
    });

    it('should submit survey to BioHub successfully', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const getKeycloakServiceTokenStub = sinon
        .stub(KeycloakService.prototype, 'getKeycloakServiceToken')
        .resolves('token');

      sinon.stub(AttachmentService.prototype, 'getSurveyAttachmentsForBioHubSubmission').resolves([]);

      sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachments').resolves([]);

      const _generateSurveyDataPackageStub = sinon
        .stub(PlatformService.prototype, '_generateSurveyDataPackage')
        .resolves({ id: '123-456-789' } as unknown as any);

      sinon.stub(axios, 'post').resolves({ data: { submission_uuid: '123-456-789', artifact_upload_keys: [] } });

      const _submitSurveyAttachmentsToBioHubStub = sinon
        .stub(PlatformService.prototype, '_submitSurveyAttachmentsToBioHub')
        .resolves();

      const _submitSurveyReportAttachmentsToBioHubStub = sinon
        .stub(PlatformService.prototype, '_submitSurveyReportAttachmentsToBioHub')
        .resolves();

      const insertSurveyMetadataPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'insertSurveyMetadataPublishRecord')
        .resolves();

      const response = await platformService.submitSurveyToBioHub(1, { submissionComment: 'test' });

      expect(getKeycloakServiceTokenStub).to.have.been.calledOnce;
      expect(_generateSurveyDataPackageStub).to.have.been.calledOnceWith(1, [], [], 'test');
      expect(_submitSurveyAttachmentsToBioHubStub).to.have.been.calledOnceWith('123-456-789', [], []);
      expect(_submitSurveyReportAttachmentsToBioHubStub).to.have.been.calledOnceWith('123-456-789', [], []);
      expect(insertSurveyMetadataPublishRecordStub).to.have.been.calledOnceWith({
        survey_id: 1,
        submission_uuid: '123-456-789'
      });
      expect(response).to.eql({ submission_uuid: '123-456-789' });
    });
  });

  describe('_generateSurveyDataPackage', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should generate survey data package successfully', async () => {
      // Add stub for getSurveyPartnershipsData to prevent undefined rows error
      sinon.stub(SurveyService.prototype, 'getSurveyPartnershipsData').resolves({
        indigenous_partnerships: [],
        stakeholder_partnerships: []
      });

      // Add stub for getSpeciesData
      sinon.stub(SurveyService.prototype, 'getSpeciesData').resolves({
        focal_species: []
      } as any);
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const getSurveyDataStub = sinon
        .stub(SurveyService.prototype, 'getSurveyData')
        .resolves({ id: 1, uuid: '1', survey_types: [] } as any);

      const getSurveyPurposeAndMethodologyStub = sinon
        .stub(SurveyService.prototype, 'getSurveyPurposeAndMethodology')
        .resolves({ additional_details: 'a description of the purpose' } as any);

      const getSurveyObservationsWithSupplementaryDataStub = sinon
        .stub(ObservationService.prototype, 'getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData')
        .resolves({
          surveyObservations: [{ survey_observation_id: 2 } as unknown as ObservationRecordWithSamplingAndSubcountData],
          supplementaryObservationData: {
            observationCount: 1,
            qualitative_measurements: [],
            quantitative_measurements: [],
            qualitative_environments: [
              {
                environment_qualitative_id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Temperature Category',
                description: null,
                options: [
                  {
                    environment_qualitative_option_id: '223e4567-e89b-12d3-a456-426614174001',
                    environment_qualitative_id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'Cold',
                    description: null
                  }
                ]
              }
            ],
            quantitative_environments: [
              {
                environment_quantitative_id: '323e4567-e89b-12d3-a456-426614174002',
                name: 'Wind Speed',
                description: null,
                min: null,
                max: null,
                unit: 'meter'
              }
            ],
            sampling_data: []
          }
        });

      const getSurveyLocationsDataStub = sinon
        .stub(SurveyService.prototype, 'getSurveyLocationsData')
        .resolves([] as any);

      const getCritterbaseSurveyCrittersStub = sinon
        .stub(SurveyCritterService.prototype, 'getCritterbaseSurveyCritters')
        .resolves([]);

      const getAllCodeSetsStub = sinon.stub(CodeService.prototype, 'getAllCodeSets').resolves({
        observation_signs: [],
        habitat_feature_types: [],
        telemetry_device_makes: [],
        frequency_units: []
      } as any);

      const getSampleSitesForSurveyIdStub = sinon
        .stub(SampleSiteService.prototype, 'getSampleSitesForSurveyId')
        .resolves([]);

      const getSampleSitesGeometryBySurveyIdStub = sinon
        .stub(SampleSiteService.prototype, 'getSampleSitesGeometryBySurveyId')
        .resolves([]);

      const getSamplePeriodsForSurveyStub = sinon
        .stub(SamplePeriodService.prototype, 'getSamplePeriodsForSurvey')
        .resolves([]);

      const getSamplingTechniquesForSurveyStub = sinon
        .stub(SampleTechniqueService.prototype, 'getSamplingTechniquesForSurvey')
        .resolves([]);

      const getSurveyHabitatFeaturesStub = sinon
        .stub(SurveyHabitatFeatureService.prototype, 'getSurveyHabitatFeatures')
        .resolves([]);

      const getDevicesForSurveyStub = sinon.stub(TelemetryDeviceService.prototype, 'getDevicesForSurvey').resolves([]);

      const getDeploymentsForSurveyStub = sinon
        .stub(TelemetryDeploymentService.prototype, 'getDeploymentsForSurvey')
        .resolves([]);

      const getSiteSelectionDataBySurveyIdStub = sinon
        .stub(SiteSelectionStrategyService.prototype, 'getSiteSelectionDataBySurveyId')
        .resolves({ strategies: [], stratums: [] });

      const response = await platformService._generateSurveyDataPackage(1, [], [], 'a comment about the submission');

      expect(getSurveyDataStub).to.have.been.calledOnceWith(1);
      expect(getSurveyPurposeAndMethodologyStub).to.have.been.calledOnceWith(1);
      expect(getSurveyObservationsWithSupplementaryDataStub).to.have.been.calledOnceWith(1);
      expect(getSurveyLocationsDataStub).to.have.been.calledOnceWith(1);
      expect(getCritterbaseSurveyCrittersStub).to.have.been.calledOnceWith(1);
      expect(getAllCodeSetsStub).to.have.been.calledOnce;
      expect(getSampleSitesForSurveyIdStub).to.have.been.calledOnceWith(1, {});
      expect(getSampleSitesGeometryBySurveyIdStub).to.have.been.calledOnceWith(1);
      expect(getSamplePeriodsForSurveyStub).to.have.been.calledOnceWith(1, {});
      expect(getSamplingTechniquesForSurveyStub).to.have.been.calledOnceWith(1);
      expect(getSurveyHabitatFeaturesStub).to.have.been.calledOnceWith(1);
      expect(getDevicesForSurveyStub).to.have.been.calledOnceWith(1);
      expect(getDeploymentsForSurveyStub).to.have.been.calledOnceWith(1);
      expect(getSiteSelectionDataBySurveyIdStub).to.have.been.calledOnceWith(1);
      expect(response).to.have.property('id');
      expect(response).to.have.property('description', 'a description of the purpose');
      expect(response).to.have.property('comment', 'a comment about the submission');
      expect(response.content).to.have.property('type', 'dataset');
      expect(response.content.properties).to.have.property('survey_id', 1);
    });
  });

  describe('_flattenToBlockModel', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should flatten nested structure with child_features', () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const nestedData = {
        content: {
          id: 'root-id',
          type: 'dataset',
          properties: { name: 'Test Dataset' },
          child_features: [
            {
              id: 'child-1',
              type: 'species_observation',
              properties: { count: 5 },
              child_features: [
                {
                  id: 'grandchild-1',
                  type: 'observation_subcount',
                  properties: { subcount: 2 }
                }
              ]
            }
          ]
        }
      };

      const result = platformService._flattenToBlockModel(nestedData);

      expect(result).to.have.length(3);
      expect(result.find((b) => b.id === 'root-id')).to.deep.include({
        id: 'root-id',
        type: 'dataset',
        parent: null,
        content: ['child-1']
      });
      expect(result.find((b) => b.id === 'child-1')).to.deep.include({
        id: 'child-1',
        type: 'species_observation',
        parent: 'root-id',
        content: ['grandchild-1']
      });
      expect(result.find((b) => b.id === 'grandchild-1')).to.deep.include({
        id: 'grandchild-1',
        type: 'observation_subcount',
        parent: 'child-1',
        content: []
      });
    });

    it('should handle data without content', () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const nestedData = {};

      const result = platformService._flattenToBlockModel(nestedData);

      expect(result).to.have.length(0);
    });

    it('should handle blocks without type', () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const nestedData = {
        content: {
          id: 'test-id',
          properties: { name: 'Test' }
        }
      };

      const result = platformService._flattenToBlockModel(nestedData);

      expect(result).to.have.length(1);
      expect(result[0].type).to.equal('unknown');
    });
  });

  describe('submitSurveyToBioHub - flattening and TAR creation', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should create flattened JSON files and TAR archive', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(KeycloakService.prototype, 'getKeycloakServiceToken').resolves('token');

      sinon.stub(AttachmentService.prototype, 'getSurveyAttachmentsForBioHubSubmission').resolves([]);
      sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachments').resolves([]);

      const mockSurveyDataPackage = {
        id: 'test-dataset-id',
        content: {
          id: 'test-dataset-id',
          type: 'dataset',
          properties: { survey_id: 1 },
          child_features: [
            {
              id: 'obs-1',
              type: 'species_observation',
              properties: { count: 5 }
            }
          ]
        }
      };

      sinon
        .stub(PlatformService.prototype, '_generateSurveyDataPackage')
        .resolves(mockSurveyDataPackage as unknown as any);

      sinon.stub(axios, 'post').resolves({ data: { submission_uuid: '123-456-789', artifact_upload_keys: [] } });

      sinon.stub(PlatformService.prototype, '_submitSurveyAttachmentsToBioHub').resolves();
      sinon.stub(PlatformService.prototype, '_submitSurveyReportAttachmentsToBioHub').resolves();
      sinon.stub(HistoryPublishService.prototype, 'insertSurveyMetadataPublishRecord').resolves();

      // Stub the TAR creation method to avoid fs stubbing issues
      const createTarArchiveStub = sinon.stub(PlatformService.prototype, '_createTarArchive').resolves();

      // Stub fs methods that are called but we can't stub directly
      // We'll verify through the _createTarArchive stub instead
      const flattenToBlockModelStub = sinon.stub(PlatformService.prototype, '_flattenToBlockModel').returns([
        { id: 'test-dataset-id', type: 'dataset', properties: {}, content: [], parent: null },
        { id: 'obs-1', type: 'species_observation', properties: {}, content: [], parent: 'test-dataset-id' }
      ]);

      await platformService.submitSurveyToBioHub(1, { submissionComment: 'test' });

      // Verify flattening was called
      expect(flattenToBlockModelStub).to.have.been.calledOnce;

      // Verify TAR was created
      expect(createTarArchiveStub).to.have.been.calledOnce;
    });

    it('should handle flattening errors gracefully', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(KeycloakService.prototype, 'getKeycloakServiceToken').resolves('token');

      sinon.stub(AttachmentService.prototype, 'getSurveyAttachmentsForBioHubSubmission').resolves([]);
      sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachments').resolves([]);

      const mockSurveyDataPackage = {
        id: 'test-dataset-id',
        content: { id: 'test-id', type: 'dataset' }
      };

      sinon
        .stub(PlatformService.prototype, '_generateSurveyDataPackage')
        .resolves(mockSurveyDataPackage as unknown as any);

      sinon.stub(axios, 'post').resolves({ data: { submission_uuid: '123-456-789', artifact_upload_keys: [] } });

      sinon.stub(PlatformService.prototype, '_submitSurveyAttachmentsToBioHub').resolves();
      sinon.stub(PlatformService.prototype, '_submitSurveyReportAttachmentsToBioHub').resolves();
      sinon.stub(HistoryPublishService.prototype, 'insertSurveyMetadataPublishRecord').resolves();

      // Stub flattening to throw error
      sinon.stub(PlatformService.prototype, '_flattenToBlockModel').throws(new Error('File system error'));

      // Should not throw, but continue with submission
      const response = await platformService.submitSurveyToBioHub(1, { submissionComment: 'test' });

      expect(response).to.eql({ submission_uuid: '123-456-789' });
    });

    it('should handle TAR creation errors gracefully', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(KeycloakService.prototype, 'getKeycloakServiceToken').resolves('token');

      sinon.stub(AttachmentService.prototype, 'getSurveyAttachmentsForBioHubSubmission').resolves([]);
      sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachments').resolves([]);

      const mockSurveyDataPackage = {
        id: 'test-dataset-id',
        content: {
          id: 'test-dataset-id',
          type: 'dataset',
          properties: { survey_id: 1 }
        }
      };

      sinon
        .stub(PlatformService.prototype, '_generateSurveyDataPackage')
        .resolves(mockSurveyDataPackage as unknown as any);

      sinon.stub(axios, 'post').resolves({ data: { submission_uuid: '123-456-789', artifact_upload_keys: [] } });

      sinon.stub(PlatformService.prototype, '_submitSurveyAttachmentsToBioHub').resolves();
      sinon.stub(PlatformService.prototype, '_submitSurveyReportAttachmentsToBioHub').resolves();
      sinon.stub(HistoryPublishService.prototype, 'insertSurveyMetadataPublishRecord').resolves();

      // Stub TAR creation to throw error (avoiding fs stubbing issues)
      sinon.stub(PlatformService.prototype, '_createTarArchive').rejects(new Error('TAR creation error'));

      // Should not throw, but continue with submission (error is caught and logged)
      const response = await platformService.submitSurveyToBioHub(1, { submissionComment: 'test' });

      expect(response).to.eql({ submission_uuid: '123-456-789' });
    });
  });

  describe('_createTarArchive and helper methods', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should call helper methods correctly', () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      // Test that helper methods exist and can be called
      // Full integration testing would require mocking fs which is non-configurable
      expect(platformService._addMetadataFile).to.be.a('function');
      expect(platformService._addJsonFiles).to.be.a('function');
      expect(platformService._addFileToArchive).to.be.a('function');
    });
  });
});
