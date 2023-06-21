import axios from 'axios';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ObservationRecord } from '../repositories/observation-repository';
import * as featureFlagUtils from '../utils/feature-flag-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { AttachmentService } from './attachment-service';
import { HistoryPublishService } from './history-publish-service';
import { KeycloakService } from './keycloak-service';
import { ObservationService } from './observation-service';
import { PlatformService } from './platform-service';
import { SurveyService } from './survey-service';

chai.use(sinonChai);

describe('PlatformService', () => {
  afterEach(() => {
    sinon.restore();
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
        .resolves(({ id: '123-456-789' } as unknown) as any);

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
        .resolves(({ id: '123-456-789' } as unknown) as any);

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
        .resolves([({ survey_observation_id: 2 } as unknown) as ObservationRecord]);

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
                survey_sample_site_id: null,
                survey_sample_method_id: null,
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
