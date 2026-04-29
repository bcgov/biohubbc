import axios from 'axios';
import chai, { expect } from 'chai';
import fs from 'fs';
import { describe } from 'mocha';
import { Readable } from 'node:stream';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiError, ApiErrorType } from '../errors/api-error';
import { BiohubFeatureType } from '../models/biohub-create';
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
import { TelemetryVendorService } from './telemetry-services/telemetry-vendor-service';

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

    it('throws error when initiate upload fails', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(HistoryPublishService.prototype, 'getSurveyMetadataPublishRecord').resolves(null);

      const getKeycloakServiceTokenStub = sinon
        .stub(KeycloakService.prototype, 'getKeycloakServiceToken')
        .resolves('token');

      sinon.stub(AttachmentService.prototype, 'getSurveyAttachmentsForBioHubSubmission').resolves([]);

      sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachments').resolves([]);

      const _generateSurveyDataPackageStub = sinon
        .stub(PlatformService.prototype, '_generateSurveyDataPackage')
        .resolves({ id: '123-456-789', name: 'Test', description: 'Test Description' } as unknown as any);

      sinon
        .stub(PlatformService.prototype, '_flattenToBlockModel')
        .returns([{ id: 'test-dataset-id', type: 'dataset', properties: {}, content: [], parent: null }]);

      sinon.stub(PlatformService.prototype, '_createTarArchive').resolves();

      const fs = require('node:fs');
      sinon.stub(fs, 'statSync').callsFake(() => ({ size: 1024 }));

      const _initiateSubmissionUploadStub = sinon
        .stub(PlatformService.prototype, '_initiateSubmissionUpload')
        .rejects(new ApiError(ApiErrorType.UNKNOWN, 'Failed to initiate submission upload to BioHub'));

      try {
        await platformService.submitSurveyToBioHub(1, { submissionComment: 'test' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const noSurveyAttachments: unknown[] = [];
        const noReportAttachments: unknown[] = [];

        expect((error as Error).message).to.include('Failed to initiate submission upload to BioHub');
        expect(getKeycloakServiceTokenStub).to.have.been.calledOnce;
        expect(_generateSurveyDataPackageStub).to.have.been.calledOnceWith(
          1,
          noSurveyAttachments,
          noReportAttachments,
          'test',
          sinon.match((value) => value instanceof Set)
        );
        expect(_initiateSubmissionUploadStub).to.have.been.calledOnce;
      }
    });

    it('should submit survey to BioHub successfully', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(HistoryPublishService.prototype, 'getSurveyMetadataPublishRecord').resolves(null);

      const getKeycloakServiceTokenStub = sinon
        .stub(KeycloakService.prototype, 'getKeycloakServiceToken')
        .resolves('token');

      sinon.stub(AttachmentService.prototype, 'getSurveyAttachmentsForBioHubSubmission').resolves([]);

      sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachments').resolves([]);

      const _generateSurveyDataPackageStub = sinon
        .stub(PlatformService.prototype, '_generateSurveyDataPackage')
        .resolves({ id: '123-456-789', name: 'Test', description: 'Test Description' } as unknown as any);

      sinon
        .stub(PlatformService.prototype, '_flattenToBlockModel')
        .returns([{ id: 'test-dataset-id', type: 'dataset', properties: {}, content: [], parent: null }]);

      sinon.stub(PlatformService.prototype, '_createTarArchive').resolves();

      const fs = require('node:fs');
      sinon.stub(fs, 'statSync').callsFake(() => ({ size: 1024 }));
      sinon.stub(fs, 'unlinkSync').callsFake(() => {});

      const submissionIdFromApi = '550e8400-e29b-41d4-a716-446655440001';
      const mockUploadResponse = {
        uploadId: 'upload-123-456-789',
        s3UploadId: 's3-upload-id',
        key: 's3-key',
        presignedUrls: [{ partNumber: 1, url: 'https://s3.amazonaws.com/presigned-url', partSizeBytes: 55 }],
        partCount: 1,
        submissionId: submissionIdFromApi,
        submissionUploadId: '660e8400-e29b-41d4-a716-446655440001'
      };

      const _initiateSubmissionUploadStub = sinon
        .stub(PlatformService.prototype, '_initiateSubmissionUpload')
        .resolves(mockUploadResponse);

      const _uploadTarFilePartsStub = sinon
        .stub(PlatformService.prototype, '_uploadTarFileParts')
        .resolves([{ PartNumber: 1, ETag: 'etag-123' }]);

      const _completeSubmissionUploadStub = sinon
        .stub(PlatformService.prototype, '_completeSubmissionUpload')
        .resolves();

      const insertSurveyMetadataPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'insertSurveyMetadataPublishRecord')
        .resolves();

      const response = await platformService.submitSurveyToBioHub(1, { submissionComment: 'test' });

      const noSurveyAttachments: unknown[] = [];
      const noReportAttachments: unknown[] = [];

      expect(getKeycloakServiceTokenStub).to.have.been.calledOnce;
      expect(_generateSurveyDataPackageStub).to.have.been.calledOnceWith(
        1,
        noSurveyAttachments,
        noReportAttachments,
        'test',
        sinon.match((value) => value instanceof Set)
      );
      expect(_initiateSubmissionUploadStub).to.have.been.calledOnce;
      expect(_uploadTarFilePartsStub).to.have.been.calledOnce;
      expect(_completeSubmissionUploadStub).to.have.been.calledOnceWith(
        'token',
        'upload-123-456-789',
        's3-upload-id',
        's3-key',
        [{ PartNumber: 1, ETag: 'etag-123' }]
      );
      expect(insertSurveyMetadataPublishRecordStub).to.have.been.calledOnceWith({
        survey_id: 1,
        submission_uuid: submissionIdFromApi
      });
      expect(response).to.eql({ submission_uuid: submissionIdFromApi });
    });

    it('should use re-publish endpoint and existing submission_uuid when survey was previously published', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';
      process.env.BACKBONE_SUBMISSION_UPLOAD_PATH = '/api/submission';

      const existingSubmissionUuid = '550e8400-e29b-41d4-a716-446655440000';
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon
        .stub(HistoryPublishService.prototype, 'getSurveyMetadataPublishRecord')
        .resolves({ submission_uuid: existingSubmissionUuid } as any);

      sinon.stub(KeycloakService.prototype, 'getKeycloakServiceToken').resolves('token');
      sinon.stub(AttachmentService.prototype, 'getSurveyAttachmentsForBioHubSubmission').resolves([]);
      sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachments').resolves([]);
      sinon
        .stub(PlatformService.prototype, '_generateSurveyDataPackage')
        .resolves({ id: '123-456-789', name: 'Test', description: 'Test Description' } as unknown as any);
      sinon
        .stub(PlatformService.prototype, '_flattenToBlockModel')
        .returns([{ id: 'test-dataset-id', type: 'dataset', properties: {}, content: [], parent: null }]);
      sinon.stub(PlatformService.prototype, '_createTarArchive').resolves();

      const fs = require('node:fs');
      sinon.stub(fs, 'statSync').callsFake(() => ({ size: 1024 }));
      sinon.stub(fs, 'unlinkSync').callsFake(() => {});

      const mockUploadResponse = {
        uploadId: 'multipart-session-upload-id',
        s3UploadId: 's3-upload-id',
        key: 's3-key',
        presignedUrls: [{ partNumber: 1, url: 'https://s3.amazonaws.com/presigned-url', partSizeBytes: 55 }],
        partCount: 1,
        submissionId: existingSubmissionUuid,
        submissionUploadId: '660e8400-e29b-41d4-a716-446655440002'
      };

      const _initiateSubmissionUploadStub = sinon
        .stub(PlatformService.prototype, '_initiateSubmissionUpload')
        .resolves(mockUploadResponse);
      sinon.stub(PlatformService.prototype, '_uploadTarFileParts').resolves([{ PartNumber: 1, ETag: 'etag-123' }]);
      sinon.stub(PlatformService.prototype, '_completeSubmissionUpload').resolves();

      const insertSurveyMetadataPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'insertSurveyMetadataPublishRecord')
        .resolves();

      const response = await platformService.submitSurveyToBioHub(1, { submissionComment: 'test' });

      expect(_initiateSubmissionUploadStub).to.have.been.calledOnceWith(
        'token',
        1024,
        { id: '123-456-789', name: 'Test', description: 'Test Description' },
        'test',
        existingSubmissionUuid
      );
      expect(insertSurveyMetadataPublishRecordStub).to.have.been.calledOnceWith({
        survey_id: 1,
        submission_uuid: existingSubmissionUuid
      });
      expect(response).to.eql({ submission_uuid: existingSubmissionUuid });
    });
  });

  describe('getSurveyPublishableFeatures', () => {
    it('includes parent feature types when only child data exists', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(SampleSiteService.prototype, 'getSampleSitesCountBySurveyId').resolves(0);
      sinon.stub(SamplePeriodService.prototype, 'getSamplePeriodsCountForSurvey').resolves(1);
      sinon.stub(SampleTechniqueService.prototype, 'getSamplingTechniquesCountForSurvey').resolves(0);
      sinon.stub(ObservationService.prototype, 'getSurveyObservationsCount').resolves(0);
      sinon.stub(SurveyHabitatFeatureService.prototype, 'getSurveyHabitatFeaturesCount').resolves(0);
      sinon.stub(TelemetryDeviceService.prototype, 'getDevicesCount').resolves(0);
      sinon.stub(TelemetryDeploymentService.prototype, 'getDeploymentsCount').resolves(1);
      sinon.stub(AttachmentService.prototype, 'getSurveyAttachmentsForBioHubSubmissionCount').resolves(0);
      sinon.stub(SurveyService.prototype, 'getSurveyLocationsData').resolves([]);
      sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachments').resolves([]);
      sinon.stub(SurveyCritterService.prototype, 'getCritterbaseSurveyCritters').resolves([]);
      sinon.stub(SampleSiteService.prototype, 'getSampleSitesForSurveyId').resolves([]);
      sinon.stub(SiteSelectionStrategyService.prototype, 'getSiteSelectionDataForBioHubSubmission').resolves({
        stratums: [],
        strategies: []
      });
      sinon
        .stub(TelemetryVendorService.prototype, 'getTelemetryForSurvey')
        .resolves([[], { count: 1, start_date: null, end_date: null }]);

      const response = await platformService.getSurveyPublishableFeatures(1);

      expect(response.featureTypes).to.include(BiohubFeatureType.SAMPLE_PERIOD);
      expect(response.featureTypes).to.include(BiohubFeatureType.SAMPLE_SITE);
      expect(response.featureTypes).to.include(BiohubFeatureType.TELEMETRY);
      expect(response.featureTypes).to.include(BiohubFeatureType.TELEMETRY_DEPLOYMENT);
      expect(response.featureTypes).to.include(BiohubFeatureType.TELEMETRY_DEVICE);
      expect(response.featureTypes).to.include(BiohubFeatureType.TELEMETRY_FREQUENCY);
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

      const getAllCodesetCategoriesStub = sinon.stub(CodeService.prototype, 'getAllCodesetCategories').resolves([]);

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

      const getSiteSelectionDataForBioHubSubmissionStub = sinon
        .stub(SiteSelectionStrategyService.prototype, 'getSiteSelectionDataForBioHubSubmission')
        .resolves({ strategies: [], stratums: [] });

      const response = await platformService._generateSurveyDataPackage(1, [], [], 'a comment about the submission');

      expect(getSurveyDataStub).to.have.been.calledOnceWith(1);
      expect(getSurveyPurposeAndMethodologyStub).to.have.been.calledOnceWith(1);
      expect(getSurveyObservationsWithSupplementaryDataStub).to.have.been.calledOnceWith(1);
      expect(getSurveyLocationsDataStub).to.have.been.calledOnceWith(1);
      expect(getCritterbaseSurveyCrittersStub).to.have.been.calledOnceWith(1);
      expect(getAllCodeSetsStub).to.have.been.calledOnce;
      expect(getAllCodesetCategoriesStub).to.have.been.calledOnce;
      expect(getSampleSitesForSurveyIdStub).to.have.been.calledOnceWith(1, {});
      expect(getSampleSitesGeometryBySurveyIdStub).to.have.been.calledOnceWith(1);
      expect(getSamplePeriodsForSurveyStub).to.have.been.calledOnceWith(1, {});
      expect(getSamplingTechniquesForSurveyStub).to.have.been.calledOnceWith(1);
      expect(getSurveyHabitatFeaturesStub).to.have.been.calledOnceWith(1);
      expect(getDevicesForSurveyStub).to.have.been.calledOnceWith(1);
      expect(getDeploymentsForSurveyStub).to.have.been.calledOnceWith(1);
      expect(getSiteSelectionDataForBioHubSubmissionStub).to.have.been.calledOnceWith(1);
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
              properties: {
                count: 5,
                environmental_condition: null,
                environmental_condition_value: null,
                subcount_comment: null,
                subcount_count: null,
                subcount_measurement_type: null,
                subcount_measurement_value: null
              },
              child_features: []
            }
          ]
        }
      };

      const result = platformService._flattenToBlockModel(nestedData);

      expect(result).to.have.length(2);
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
        name: 'Test Survey',
        description: 'Test Description',
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

      sinon.stub(HistoryPublishService.prototype, 'getSurveyMetadataPublishRecord').resolves(null);
      sinon.stub(HistoryPublishService.prototype, 'insertSurveyMetadataPublishRecord').resolves();

      // Stub the TAR creation method to avoid fs stubbing issues
      const createTarArchiveStub = sinon.stub(PlatformService.prototype, '_createTarArchive').resolves();

      // Stub fs methods that are called but we can't stub directly
      // We'll verify through the _createTarArchive stub instead
      const flattenToBlockModelStub = sinon.stub(PlatformService.prototype, '_flattenToBlockModel').returns([
        { id: 'test-dataset-id', type: 'dataset', properties: {}, content: [], parent: null },
        { id: 'obs-1', type: 'species_observation', properties: {}, content: [], parent: 'test-dataset-id' }
      ]);

      const fs = require('node:fs');
      sinon.stub(fs, 'statSync').callsFake(() => ({ size: 1024 }));
      sinon.stub(fs, 'unlinkSync').callsFake(() => {});

      const mockUploadResponse = {
        uploadId: 'upload-123-456-789',
        s3UploadId: 's3-upload-id',
        key: 's3-key',
        presignedUrls: [{ partNumber: 1, url: 'https://s3.amazonaws.com/presigned-url', partSizeBytes: 55 }],
        partCount: 1,
        submissionId: '550e8400-e29b-41d4-a716-446655440001',
        submissionUploadId: '660e8400-e29b-41d4-a716-446655440003'
      };

      sinon.stub(PlatformService.prototype, '_initiateSubmissionUpload').resolves(mockUploadResponse);
      sinon.stub(PlatformService.prototype, '_uploadTarFileParts').resolves([{ PartNumber: 1, ETag: 'etag-123' }]);
      sinon.stub(PlatformService.prototype, '_completeSubmissionUpload').resolves();

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

      sinon.stub(HistoryPublishService.prototype, 'getSurveyMetadataPublishRecord').resolves(null);
      sinon.stub(KeycloakService.prototype, 'getKeycloakServiceToken').resolves('token');

      sinon.stub(AttachmentService.prototype, 'getSurveyAttachmentsForBioHubSubmission').resolves([]);
      sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachments').resolves([]);

      const mockSurveyDataPackage = {
        id: 'test-dataset-id',
        name: 'Test Survey',
        description: 'Test Description',
        content: { id: 'test-id', type: 'dataset' }
      };

      sinon
        .stub(PlatformService.prototype, '_generateSurveyDataPackage')
        .resolves(mockSurveyDataPackage as unknown as any);

      sinon.stub(HistoryPublishService.prototype, 'insertSurveyMetadataPublishRecord').resolves();

      // Stub flattening to throw error - this will cause the method to fail before upload
      sinon.stub(PlatformService.prototype, '_flattenToBlockModel').throws(new Error('File system error'));

      // Should throw error since flattening is required for the upload flow
      try {
        await platformService.submitSurveyToBioHub(1, { submissionComment: 'test' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).to.include('File system error');
      }
    });

    it('should handle TAR creation errors gracefully', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(HistoryPublishService.prototype, 'getSurveyMetadataPublishRecord').resolves(null);
      sinon.stub(KeycloakService.prototype, 'getKeycloakServiceToken').resolves('token');

      sinon.stub(AttachmentService.prototype, 'getSurveyAttachmentsForBioHubSubmission').resolves([]);
      sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachments').resolves([]);

      const mockSurveyDataPackage = {
        id: 'test-dataset-id',
        name: 'Test Survey',
        description: 'Test Description',
        content: {
          id: 'test-dataset-id',
          type: 'dataset',
          properties: { survey_id: 1 }
        }
      };

      sinon
        .stub(PlatformService.prototype, '_generateSurveyDataPackage')
        .resolves(mockSurveyDataPackage as unknown as any);

      sinon
        .stub(PlatformService.prototype, '_flattenToBlockModel')
        .returns([{ id: 'test-dataset-id', type: 'dataset', properties: {}, content: [], parent: null }]);

      sinon.stub(HistoryPublishService.prototype, 'insertSurveyMetadataPublishRecord').resolves();

      // Stub TAR creation to throw error (avoiding fs stubbing issues)
      sinon.stub(PlatformService.prototype, '_createTarArchive').rejects(new Error('TAR creation error'));

      // Should throw error since TAR creation is required for the upload flow
      try {
        await platformService.submitSurveyToBioHub(1, { submissionComment: 'test' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).to.include('TAR creation error');
      }
    });
  });

  describe('_createTarArchive and helper methods', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should call helper methods correctly', () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      expect(platformService._addMetadataFile).to.be.a('function');
      expect(platformService._addJsonFiles).to.be.a('function');
      expect(platformService._addFileToArchive).to.be.a('function');
    });

    it('should write JSON files to expected archive paths', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const pack: any = {};
      const datasetId = 'test-dataset-id';
      const blocksByType = new Map<string, any[]>([
        ['dataset', [{ id: 'd1' }]],
        ['codeset', [{ id: 'c1' }]],
        ['habitat_feature', [{ id: 'h1' }]]
      ]);

      const addFileToArchiveStub = sinon
        .stub(platformService as any, '_addFileToArchive')
        .callsFake(() => Promise.resolve());

      await platformService._addJsonFilesToArchive(pack, datasetId, blocksByType as any);

      const writtenPaths = addFileToArchiveStub.getCalls().map((call) => call.args[2]);
      expect(writtenPaths).to.include('features/dataset.json');
      expect(writtenPaths).to.include('codes/codeset.json');
      expect(writtenPaths).to.include('features/habitat_feature.json');
    });

    it('should write codeset block properties as codes/codeset.json content when first block has properties', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const pack: any = {};
      const datasetId = 'test-dataset-id';
      const codesetProperties = { life_stage: { id: 'life_stage', label: 'Life Stage', codes: {} } };
      const blocksByType = new Map<string, any[]>([
        ['codeset', [{ id: 'c1', type: 'codeset', properties: codesetProperties, content: [], parent: null }]]
      ]);

      const addFileToArchiveStub = sinon
        .stub(platformService as any, '_addFileToArchive')
        .callsFake(() => Promise.resolve());

      await platformService._addJsonFilesToArchive(pack, datasetId, blocksByType as any);

      const codesetCall = addFileToArchiveStub.getCalls().find((call) => call.args[2] === 'codes/codeset.json');
      expect(codesetCall).to.exist;
      expect(JSON.parse(codesetCall!.args[3].toString())).to.deep.equal(codesetProperties);
    });
  });

  describe('_buildPartByteRanges', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should build a single range when one part matches the full file size', () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const ranges = platformService._buildPartByteRanges(17, [
        { partNumber: 1, url: 'https://s3.amazonaws.com/url1', partSizeBytes: 17 }
      ]);

      expect(ranges).to.deep.equal([
        {
          partNumber: 1,
          url: 'https://s3.amazonaws.com/url1',
          partSizeBytes: 17,
          start: 0,
          end: 16
        }
      ]);
    });

    it('should build multiple ranges using exact part sizes', () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const ranges = platformService._buildPartByteRanges(10, [
        { partNumber: 1, url: 'https://s3.amazonaws.com/url1', partSizeBytes: 4 },
        { partNumber: 2, url: 'https://s3.amazonaws.com/url2', partSizeBytes: 4 },
        { partNumber: 3, url: 'https://s3.amazonaws.com/url3', partSizeBytes: 2 }
      ]);

      expect(ranges).to.deep.equal([
        { partNumber: 1, url: 'https://s3.amazonaws.com/url1', partSizeBytes: 4, start: 0, end: 3 },
        { partNumber: 2, url: 'https://s3.amazonaws.com/url2', partSizeBytes: 4, start: 4, end: 7 },
        { partNumber: 3, url: 'https://s3.amazonaws.com/url3', partSizeBytes: 2, start: 8, end: 9 }
      ]);
    });

    it('should throw when no parts are provided', () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      expect(() => platformService._buildPartByteRanges(5, [])).to.throw('Part count must be positive');
    });

    it('should throw when part instructions do not match file size', () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      expect(() =>
        platformService._buildPartByteRanges(5, [
          { partNumber: 1, url: 'https://s3.amazonaws.com/url1', partSizeBytes: 2 },
          { partNumber: 2, url: 'https://s3.amazonaws.com/url2', partSizeBytes: 2 }
        ])
      ).to.throw('Part instructions do not match file size.');
    });

    it('should throw when a part size is invalid', () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      expect(() =>
        platformService._buildPartByteRanges(5, [
          { partNumber: 1, url: 'https://s3.amazonaws.com/url1', partSizeBytes: 0 },
          { partNumber: 2, url: 'https://s3.amazonaws.com/url2', partSizeBytes: 5 }
        ])
      ).to.throw('Invalid part size for part 1.');
    });
  });

  describe('_uploadChunkToS3', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should upload chunk and return PartNumber and ETag', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {
          etag: '"abc123def456"'
        }
      };

      const axiosPutStub = sinon.stub(axios, 'put').resolves(mockResponse);
      const chunkStream = Readable.from([Buffer.from('chunk')]);

      const result = await platformService._uploadChunkToS3('https://s3.amazonaws.com/presigned-url', chunkStream, 1);

      expect(axiosPutStub).to.have.been.calledOnce;
      expect(axiosPutStub.getCall(0).args[0]).to.equal('https://s3.amazonaws.com/presigned-url');
      expect(axiosPutStub.getCall(0).args[1]).to.equal(chunkStream);
      expect(axiosPutStub.getCall(0).args[2]?.headers?.['Content-Type']).to.equal('application/x-tar');

      expect(result).to.deep.equal({
        PartNumber: 1,
        ETag: 'abc123def456'
      });
    });

    it('should handle ETag with uppercase header', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {
          ETag: '"xyz789"'
        }
      };

      sinon.stub(axios, 'put').resolves(mockResponse);
      const chunkStream = Readable.from([Buffer.from('chunk')]);

      const result = await platformService._uploadChunkToS3('https://s3.amazonaws.com/presigned-url', chunkStream, 2);

      expect(result.ETag).to.equal('xyz789');
    });

    it('should throw error when ETag is missing', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {}
      };

      sinon.stub(axios, 'put').resolves(mockResponse);
      const chunkStream = Readable.from([Buffer.from('chunk')]);

      try {
        await platformService._uploadChunkToS3('https://s3.amazonaws.com/presigned-url', chunkStream, 1);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).to.include('Failed to upload part 1 to S3');
      }
    });

    it('should throw error when upload returns non-200 status', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const mockResponse = {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          etag: '"abc123def456"'
        }
      };

      sinon.stub(axios, 'put').resolves(mockResponse);
      const chunkStream = Readable.from([Buffer.from('chunk')]);

      try {
        await platformService._uploadChunkToS3('https://s3.amazonaws.com/presigned-url', chunkStream, 1);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).to.include('Failed to upload part 1 to S3');
      }
    });

    it('should throw error when upload fails', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(axios, 'put').rejects(new Error('Network error'));
      const chunkStream = Readable.from([Buffer.from('chunk')]);

      try {
        await platformService._uploadChunkToS3('https://s3.amazonaws.com/presigned-url', chunkStream, 1);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).to.include('Failed to upload part 1 to S3');
      }
    });
  });

  describe('_uploadTarFileParts', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should upload all parts and return sorted array', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(fs, 'statSync').returns({ size: 10 } as fs.Stats);
      const createReadStreamStub = sinon.stub(fs, 'createReadStream').returns({} as fs.ReadStream);

      const presignedUrls = [
        { partNumber: 2, url: 'https://s3.amazonaws.com/url2', partSizeBytes: 5 },
        { partNumber: 1, url: 'https://s3.amazonaws.com/url1', partSizeBytes: 3 },
        { partNumber: 3, url: 'https://s3.amazonaws.com/url3', partSizeBytes: 2 }
      ];

      const uploadChunkStub = sinon.stub(platformService, '_uploadChunkToS3');
      uploadChunkStub.onCall(0).resolves({ PartNumber: 1, ETag: 'etag1' });
      uploadChunkStub.onCall(1).resolves({ PartNumber: 2, ETag: 'etag2' });
      uploadChunkStub.onCall(2).resolves({ PartNumber: 3, ETag: 'etag3' });

      const result = await platformService._uploadTarFileParts(
        '/path/to/file.tar',
        presignedUrls,
        presignedUrls.length
      );

      expect(uploadChunkStub).to.have.been.calledThrice;
      expect(createReadStreamStub.callCount).to.equal(3);
      expect(createReadStreamStub.getCall(0).args).to.deep.equal(['/path/to/file.tar', { start: 0, end: 2 }]);
      expect(createReadStreamStub.getCall(1).args).to.deep.equal(['/path/to/file.tar', { start: 3, end: 7 }]);
      expect(createReadStreamStub.getCall(2).args).to.deep.equal(['/path/to/file.tar', { start: 8, end: 9 }]);

      expect(uploadChunkStub.getCall(0).args[0]).to.equal('https://s3.amazonaws.com/url1');
      expect(uploadChunkStub.getCall(0).args[1]).to.equal(createReadStreamStub.getCall(0).returnValue);
      expect(uploadChunkStub.getCall(0).args[2]).to.equal(1);
      expect(uploadChunkStub.getCall(0).args[3]).to.equal(3);

      expect(uploadChunkStub.getCall(1).args[0]).to.equal('https://s3.amazonaws.com/url2');
      expect(uploadChunkStub.getCall(1).args[1]).to.equal(createReadStreamStub.getCall(1).returnValue);
      expect(uploadChunkStub.getCall(1).args[2]).to.equal(2);
      expect(uploadChunkStub.getCall(1).args[3]).to.equal(5);

      expect(uploadChunkStub.getCall(2).args[0]).to.equal('https://s3.amazonaws.com/url3');
      expect(uploadChunkStub.getCall(2).args[1]).to.equal(createReadStreamStub.getCall(2).returnValue);
      expect(uploadChunkStub.getCall(2).args[2]).to.equal(3);
      expect(uploadChunkStub.getCall(2).args[3]).to.equal(2);

      expect(result).to.deep.equal([
        { PartNumber: 1, ETag: 'etag1' },
        { PartNumber: 2, ETag: 'etag2' },
        { PartNumber: 3, ETag: 'etag3' }
      ]);
    });

    it('should respect concurrencyLimit batching', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(fs, 'statSync').returns({ size: 10 } as fs.Stats);
      sinon.stub(fs, 'createReadStream').returns({} as fs.ReadStream);

      const presignedUrls = [
        { partNumber: 1, url: 'https://s3.amazonaws.com/url1', partSizeBytes: 2 },
        { partNumber: 2, url: 'https://s3.amazonaws.com/url2', partSizeBytes: 2 },
        { partNumber: 3, url: 'https://s3.amazonaws.com/url3', partSizeBytes: 2 },
        { partNumber: 4, url: 'https://s3.amazonaws.com/url4', partSizeBytes: 2 },
        { partNumber: 5, url: 'https://s3.amazonaws.com/url5', partSizeBytes: 2 }
      ];

      const uploadChunkStub = sinon
        .stub(platformService, '_uploadChunkToS3')
        .callsFake(async (_url, _chunk, partNumber, _partSizeBytes) => {
          return { PartNumber: partNumber, ETag: `etag${partNumber}` };
        });

      const result = await platformService._uploadTarFileParts(
        '/path/to/file.tar',
        presignedUrls,
        presignedUrls.length,
        {
          concurrencyLimit: 2
        }
      );

      expect(uploadChunkStub.callCount).to.equal(5);
      expect(result).to.deep.equal([
        { PartNumber: 1, ETag: 'etag1' },
        { PartNumber: 2, ETag: 'etag2' },
        { PartNumber: 3, ETag: 'etag3' },
        { PartNumber: 4, ETag: 'etag4' },
        { PartNumber: 5, ETag: 'etag5' }
      ]);
    });

    it('should throw when presigned URL count does not match expected part count', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const presignedUrls = [{ partNumber: 1, url: 'https://s3.amazonaws.com/url1', partSizeBytes: 5 }];

      try {
        await platformService._uploadTarFileParts('/path/to/file.tar', presignedUrls, 2);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).to.equal('Presigned URL count (1) does not match expected part count (2)');
      }
    });

    it('should throw when concurrencyLimit is invalid', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const presignedUrls = [{ partNumber: 1, url: 'https://s3.amazonaws.com/url1', partSizeBytes: 5 }];

      try {
        await platformService._uploadTarFileParts('/path/to/file.tar', presignedUrls, 1, { concurrencyLimit: 0 });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).to.equal('concurrencyLimit must be a positive integer');
      }
    });
  });

  describe('_initiateSubmissionUpload', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should initiate upload and return presigned URLs', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';
      process.env.BACKBONE_SUBMISSION_UPLOAD_PATH = '/api/submission';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const mockResponse = {
        data: {
          submissionId: '550e8400-e29b-41d4-a716-446655440001',
          submissionUploadId: '660e8400-e29b-41d4-a716-446655440004',
          uploadId: 'upload-123',
          s3UploadId: 's3-upload-id',
          uploadArchiveId: 'archive-id',
          key: 's3-key',
          partSizeBytes: 5242880,
          partCount: 2,
          presignedUrls: [
            { partNumber: 1, url: 'https://s3.amazonaws.com/url1', partSizeBytes: 512 },
            { partNumber: 2, url: 'https://s3.amazonaws.com/url2', partSizeBytes: 512 }
          ]
        }
      };

      const axiosPostStub = sinon.stub(axios, 'post').resolves(mockResponse);

      const surveyDataPackage = {
        name: 'Test Survey',
        description: 'Test Description'
      } as any;

      const result = await platformService._initiateSubmissionUpload('token', 1024, surveyDataPackage, 'comment', null);

      expect(axiosPostStub).to.have.been.calledOnce;
      expect(axiosPostStub.getCall(0).args[1]).to.deep.equal({
        bytes: 1024,
        name: 'Test Survey',
        description: 'Test Description',
        comment: 'comment'
      });
      expect(axiosPostStub.getCall(0).args[2]?.headers?.authorization).to.equal('Bearer token');

      expect(result).to.deep.equal({
        uploadId: 'upload-123',
        s3UploadId: 's3-upload-id',
        key: 's3-key',
        presignedUrls: mockResponse.data.presignedUrls,
        partCount: 2,
        submissionId: '550e8400-e29b-41d4-a716-446655440001',
        submissionUploadId: '660e8400-e29b-41d4-a716-446655440004'
      });
    });

    it('should use re-publish URL when existingSubmissionUuid is set', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';
      process.env.BACKBONE_SUBMISSION_UPLOAD_PATH = '/api/submission';

      const existingSubmissionUuid = '550e8400-e29b-41d4-a716-446655440000';
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const mockResponse = {
        data: {
          submissionId: existingSubmissionUuid,
          submissionUploadId: '660e8400-e29b-41d4-a716-446655440005',
          uploadId: 'upload-123',
          s3UploadId: 's3-upload-id',
          uploadArchiveId: 'archive-id',
          key: 's3-key',
          partSizeBytes: 5242880,
          partCount: 2,
          presignedUrls: [
            { partNumber: 1, url: 'https://s3.amazonaws.com/url1', partSizeBytes: 512 },
            { partNumber: 2, url: 'https://s3.amazonaws.com/url2', partSizeBytes: 512 }
          ]
        }
      };

      const axiosPostStub = sinon.stub(axios, 'post').resolves(mockResponse);

      const surveyDataPackage = {
        name: 'Test Survey',
        description: 'Test Description'
      } as any;

      await platformService._initiateSubmissionUpload(
        'token',
        1024,
        surveyDataPackage,
        'comment',
        existingSubmissionUuid
      );

      expect(axiosPostStub).to.have.been.calledOnce;
      expect(axiosPostStub.getCall(0).args[0]).to.equal(
        'http://backbone-host.dev/api/submission/550e8400-e29b-41d4-a716-446655440000/upload'
      );
      expect(axiosPostStub.getCall(0).args[1]).to.deep.equal({
        bytes: 1024,
        name: 'Test Survey',
        description: 'Test Description',
        comment: 'comment'
      });
    });

    it('should return initiate response ids without additional uuid validation', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';
      process.env.BACKBONE_SUBMISSION_UPLOAD_PATH = '/api/submission';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const mockResponse = {
        data: {
          submissionId: 'not-a-uuid',
          submissionUploadId: 'also-not-a-uuid',
          uploadId: 'upload-123',
          s3UploadId: 's3-upload-id',
          uploadArchiveId: 'archive-id',
          key: 's3-key',
          partSizeBytes: 5242880,
          partCount: 2,
          presignedUrls: [{ partNumber: 1, url: 'https://s3.amazonaws.com/url1', partSizeBytes: 1024 }]
        }
      };

      sinon.stub(axios, 'post').resolves(mockResponse);

      const surveyDataPackage = {
        name: 'Test Survey',
        description: 'Test Description'
      } as any;

      const result = await platformService._initiateSubmissionUpload('token', 1024, surveyDataPackage, 'comment', null);

      expect(result.submissionId).to.equal('not-a-uuid');
      expect(result.submissionUploadId).to.equal('also-not-a-uuid');
    });

    it('should throw error when file size exceeds maximum', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const getEnvironmentVariableStub = sinon.stub(envConfig, 'getEnvironmentVariable');
      getEnvironmentVariableStub.withArgs('SUBMISSION_UPLOAD_MAX_SIZE').returns(1073741824); // 1 GB

      const surveyDataPackage = {
        name: 'Test Survey',
        description: 'Test Description'
      } as any;

      try {
        await platformService._initiateSubmissionUpload('token', 1073741825, surveyDataPackage, 'comment', null);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).to.include('exceeds maximum allowed size');
      }
    });

    it('should throw error when API call fails', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';
      process.env.BACKBONE_SUBMISSION_UPLOAD_PATH = '/api/submission';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(axios, 'post').rejects(new Error('Network error'));

      const surveyDataPackage = {
        name: 'Test Survey',
        description: 'Test Description'
      } as any;

      try {
        await platformService._initiateSubmissionUpload('token', 1024, surveyDataPackage, 'comment', null);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).to.include('Failed to initiate submission upload to BioHub');
      }
    });
  });

  describe('_completeSubmissionUpload', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should complete upload successfully', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';
      process.env.BACKBONE_UPLOAD_COMPLETE_PATH = '/api/upload';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const axiosPutStub = sinon.stub(axios, 'put').resolves({ status: 201 });

      const parts = [
        { PartNumber: 1, ETag: 'etag1' },
        { PartNumber: 2, ETag: 'etag2' }
      ];

      await platformService._completeSubmissionUpload('token', 'upload-123', 's3-upload-id', 's3-key', parts);

      expect(axiosPutStub).to.have.been.calledOnce;
      expect(axiosPutStub.getCall(0).args[0]).to.include('/api/upload/upload-123');
      expect(axiosPutStub.getCall(0).args[1]).to.deep.equal({
        s3UploadId: 's3-upload-id',
        key: 's3-key',
        parts
      });
      expect(axiosPutStub.getCall(0).args[2]?.headers?.authorization).to.equal('Bearer token');
    });

    it('should throw error when API call fails', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'http://backbone-host.dev/';
      process.env.BACKBONE_UPLOAD_COMPLETE_PATH = '/api/upload';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(axios, 'put').rejects(new Error('Network error'));

      const parts = [{ PartNumber: 1, ETag: 'etag1' }];

      try {
        await platformService._completeSubmissionUpload('token', 'upload-123', 's3-upload-id', 's3-key', parts);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).to.include('Failed to complete submission upload to BioHub');
      }
    });
  });

  describe('getSubmissionHistoryForSurvey', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return history when BioHub returns an array', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'https://backbone.example.com';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const surveyId = 42;
      const submissionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockHistory = [
        {
          submissionUploadId: 'upload-uuid-1',
          status: 'submitted',
          createDate: '2024-01-01T00:00:00Z',
          submissionId: 123
        }
      ];

      sinon
        .stub(HistoryPublishService.prototype, 'findSurveyMetadataPublishRecordBySubmissionUuid')
        .resolves({ survey_id: surveyId, submission_uuid: submissionId } as any);
      sinon.stub(KeycloakService.prototype, 'getKeycloakServiceToken').resolves('token');
      const axiosStub = sinon.stub(axios, 'get').resolves({ data: mockHistory });

      const result = await platformService.getSubmissionHistoryForSurvey(surveyId, submissionId);

      expect(axiosStub.getCall(0).args[0]).to.include(`/submission/${submissionId}/history`);
      expect(axiosStub.getCall(0).args[1]?.headers?.authorization).to.equal('Bearer token');
      expect(result).to.deep.equal(mockHistory);
    });

    it('should return history and map submissionId onto items when BioHub returns wrapped shape', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'https://backbone.example.com';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const surveyId = 42;
      const submissionId = '550e8400-e29b-41d4-a716-446655440000';
      const bioHubId = 456;
      const mockResponse = {
        submissionId: bioHubId,
        history: [
          {
            submissionUploadId: 'upload-uuid-1',
            status: 'submitted',
            createDate: '2024-01-01T00:00:00Z'
          }
        ]
      };

      sinon
        .stub(HistoryPublishService.prototype, 'findSurveyMetadataPublishRecordBySubmissionUuid')
        .resolves({ survey_id: surveyId, submission_uuid: submissionId } as any);
      sinon.stub(KeycloakService.prototype, 'getKeycloakServiceToken').resolves('token');
      sinon.stub(axios, 'get').resolves({ data: mockResponse });

      const result = await platformService.getSubmissionHistoryForSurvey(surveyId, submissionId);

      expect(result).to.not.equal(null);
      expect(result).to.have.length(1);
      expect(result?.[0].submissionId).to.equal(bioHubId);
      expect(result?.[0].submissionUploadId).to.equal('upload-uuid-1');
    });

    it('should throw ApiError when axios.get fails', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'https://backbone.example.com';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon
        .stub(HistoryPublishService.prototype, 'findSurveyMetadataPublishRecordBySubmissionUuid')
        .resolves({ survey_id: 42, submission_uuid: '550e8400-e29b-41d4-a716-446655440000' } as any);
      sinon.stub(KeycloakService.prototype, 'getKeycloakServiceToken').resolves('token');
      sinon.stub(axios, 'get').rejects(new Error('Network error'));

      try {
        await platformService.getSubmissionHistoryForSurvey(42, '550e8400-e29b-41d4-a716-446655440000');
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to get submission history from BioHub');
      }
    });

    it('should return null when submission is not linked to survey', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(HistoryPublishService.prototype, 'findSurveyMetadataPublishRecordBySubmissionUuid').resolves(null);
      const axiosStub = sinon.stub(axios, 'get');

      const result = await platformService.getSubmissionHistoryForSurvey(42, '550e8400-e29b-41d4-a716-446655440000');

      expect(result).to.equal(null);
      expect(axiosStub).to.not.have.been.called;
    });
  });

  describe('deleteSubmissionUploadForSurvey', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should call BioHub DELETE and succeed', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'https://backbone.example.com';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const surveyId = 42;
      const submissionId = '550e8400-e29b-41d4-a716-446655440000';
      const submissionUploadId = '550e8400-e29b-41d4-a716-446655440001';

      sinon
        .stub(HistoryPublishService.prototype, 'findSurveyMetadataPublishRecordBySubmissionUuid')
        .resolves({ survey_id: surveyId, submission_uuid: submissionId } as any);
      sinon.stub(KeycloakService.prototype, 'getKeycloakServiceToken').resolves('token');
      const axiosStub = sinon.stub(axios, 'delete').resolves({ status: 204 });

      const result = await platformService.deleteSubmissionUploadForSurvey(surveyId, submissionId, submissionUploadId);

      expect(result).to.equal(true);
      expect(axiosStub.getCall(0).args[0]).to.include(`/submission/${submissionId}/upload/${submissionUploadId}`);
      expect(axiosStub.getCall(0).args[1]?.headers?.authorization).to.equal('Bearer token');
    });

    it('should throw ApiError when axios.delete fails', async () => {
      process.env.BACKBONE_INTERNAL_API_HOST = 'https://backbone.example.com';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon
        .stub(HistoryPublishService.prototype, 'findSurveyMetadataPublishRecordBySubmissionUuid')
        .resolves({ survey_id: 42, submission_uuid: '550e8400-e29b-41d4-a716-446655440000' } as any);
      sinon.stub(KeycloakService.prototype, 'getKeycloakServiceToken').resolves('token');
      sinon.stub(axios, 'delete').rejects(new Error('Network error'));

      try {
        await platformService.deleteSubmissionUploadForSurvey(
          42,
          '550e8400-e29b-41d4-a716-446655440000',
          '550e8400-e29b-41d4-a716-446655440001'
        );
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to delete submission upload in BioHub');
      }
    });

    it('should return false when submission is not linked to survey', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(HistoryPublishService.prototype, 'findSurveyMetadataPublishRecordBySubmissionUuid').resolves(null);
      const axiosStub = sinon.stub(axios, 'delete');

      const result = await platformService.deleteSubmissionUploadForSurvey(
        42,
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440001'
      );

      expect(result).to.equal(false);
      expect(axiosStub).to.not.have.been.called;
    });
  });
});
