import axios from 'axios';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SurveyObservationRecord } from '../database-models/survey_observation';
import * as envConfig from '../utils/env-config';
import * as featureFlagUtils from '../utils/feature-flag-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { AttachmentService } from './attachment-service';
import { HistoryPublishService } from './history-publish-service';
import { KeycloakService } from './keycloak-service';
import { ObservationService } from './observation-services/observation-service';
import { PlatformService } from './platform-service';
import { SurveyService } from './survey-service';

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
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const getSurveyDataStub = sinon.stub(SurveyService.prototype, 'getSurveyData').resolves({ uuid: '1' } as any);

      const getSurveyPurposeAndMethodologyStub = sinon
        .stub(SurveyService.prototype, 'getSurveyPurposeAndMethodology')
        .resolves({ additional_details: 'a description of the purpose' } as any);

      const getAllSurveyObservationsStub = sinon
        .stub(ObservationService.prototype, 'getAllSurveyObservations')
        .resolves([{ survey_observation_id: 2 } as unknown as SurveyObservationRecord]);

      const getSurveyLocationsDataStub = sinon
        .stub(SurveyService.prototype, 'getSurveyLocationsData')
        .resolves([] as any);

      const response = await platformService._generateSurveyDataPackage(1, [], [], 'a comment about the submission');

      expect(getSurveyDataStub).to.have.been.calledOnceWith(1);
      expect(getSurveyPurposeAndMethodologyStub).to.have.been.calledOnceWith(1);
      expect(getAllSurveyObservationsStub).to.have.been.calledOnceWith(1);
      expect(getSurveyLocationsDataStub).to.have.been.calledOnceWith(1);
      expect(response).to.eql({
        id: '1',
        name: undefined,
        description: 'a description of the purpose',
        comment: 'a comment about the submission',
        content: {
          id: '1',
          type: 'dataset',
          properties: {
            survey_id: undefined,
            project_id: undefined,
            name: undefined,
            start_date: undefined,
            end_date: undefined,
            survey_types: undefined,
            revision_count: undefined,
            geometry: {
              type: 'FeatureCollection',
              features: []
            }
          },
          child_features: [
            {
              id: '2',
              type: 'observation',
              properties: {
                survey_id: undefined,
                taxonomy: undefined,
                survey_sample_period_id: null,
                latitude: undefined,
                longitude: undefined,
                count: undefined,
                observation_time: undefined,
                observation_date: undefined,
                geometry: { type: 'FeatureCollection', features: [] }
              },
              child_features: []
            }
          ]
        }
      });
    });
  });
});
