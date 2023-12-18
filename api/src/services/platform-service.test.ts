import AdmZip from 'adm-zip';
import axios from 'axios';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { MESSAGE_CLASS_NAME } from '../constants/status';
import { ApiGeneralError } from '../errors/api-error';
import {
  IProjectAttachment,
  IProjectReportAttachment,
  ISurveyAttachment,
  ISurveyReportAttachment
} from '../repositories/attachment-repository';
import { ISurveySummaryDetails } from '../repositories/summary-repository';
import { IGetLatestSurveyOccurrenceSubmission, ISurveyProprietorModel } from '../repositories/survey-repository';
import * as file_utils from '../utils/file-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { AttachmentService } from './attachment-service';
import { EmlPackage, EmlService } from './eml-service';
import { HistoryPublishService } from './history-publish-service';
import { KeycloakService } from './keycloak-service';
import { ObservationService } from './observation-service';
import {
  IArtifact,
  IGetObservationSubmissionResponse,
  IGetSummaryResultsResponse,
  IGetSurveyAttachment,
  IGetSurveyReportAttachment,
  PlatformService
} from './platform-service';
import { SummaryService } from './summary-service';
import { SurveyService } from './survey-service';

chai.use(sinonChai);

describe('PlatformService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('submitProjectDwCMetadataToBioHub', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws an error if BioHub intake is not enabled', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'false';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      try {
        await platformService.submitProjectDwCMetadataToBioHub(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('BioHub intake is not enabled');
      }
    });

    it('should submit and publish project DwCA Metadata', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const emlPackageMock = new EmlPackage({ packageId: '123-456-789' });
      const buildProjectEmlPackageStub = sinon
        .stub(EmlService.prototype, 'buildProjectEmlPackage')
        .resolves(emlPackageMock);

      const _submitDwCADatasetToBioHubStub = sinon
        .stub(PlatformService.prototype, '_submitDwCADatasetToBioHub')
        .resolves({ queue_id: 2 });

      const insertProjectMetadataPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'insertProjectMetadataPublishRecord')
        .resolves();

      await platformService.submitProjectDwCMetadataToBioHub(1);

      expect(buildProjectEmlPackageStub).to.have.been.calledOnceWith({ projectId: 1 });
      expect(_submitDwCADatasetToBioHubStub).to.be.calledOnceWith(
        sinon.match({
          archiveFile: sinon.match.object,
          dataPackageId: '123-456-789'
        })
      );
      expect(insertProjectMetadataPublishRecordStub).to.be.calledOnceWith({ project_id: 1, queue_id: 2 });
    });

    it('should throw error', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const emlPackageMock = new EmlPackage({ packageId: '123-456-789' });
      const buildProjectEmlPackageStub = sinon
        .stub(EmlService.prototype, 'buildProjectEmlPackage')
        .resolves(emlPackageMock);

      const _submitDwCADatasetToBioHubStub = sinon
        .stub(PlatformService.prototype, '_submitDwCADatasetToBioHub')
        .rejects(new Error('a test error'));

      try {
        await platformService.submitProjectDwCMetadataToBioHub(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('a test error');
        expect(buildProjectEmlPackageStub).to.have.been.calledOnceWith({ projectId: 1 });
        expect(_submitDwCADatasetToBioHubStub).to.be.calledOnceWith(
          sinon.match({
            archiveFile: sinon.match.object,
            dataPackageId: '123-456-789'
          })
        );
      }
    });
  });

  describe('submitSurveyDwCMetadataToBioHub', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws an error if BioHub intake is not enabled', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'false';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      try {
        await platformService.submitSurveyDwCMetadataToBioHub(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('BioHub intake is not enabled');
      }
    });

    it('should submit and publish survey DwCA Metadata', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const emlPackageMock = new EmlPackage({ packageId: '123-456-789' });
      const buildSurveyEmlPackageStub = sinon
        .stub(EmlService.prototype, 'buildSurveyEmlPackage')
        .resolves(emlPackageMock);

      const _submitDwCADatasetToBioHubStub = sinon
        .stub(PlatformService.prototype, '_submitDwCADatasetToBioHub')
        .resolves({ queue_id: 2 });

      const insertSurveyMetadataPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'insertSurveyMetadataPublishRecord')
        .resolves();

      await platformService.submitSurveyDwCMetadataToBioHub(1);

      expect(buildSurveyEmlPackageStub).to.have.been.calledOnceWith({ surveyId: 1 });
      expect(_submitDwCADatasetToBioHubStub).to.be.calledOnceWith(
        sinon.match({
          archiveFile: sinon.match.object,
          dataPackageId: '123-456-789'
        })
      );
      expect(insertSurveyMetadataPublishRecordStub).to.be.calledOnceWith({ survey_id: 1, queue_id: 2 });
    });

    it('should throw error', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const emlPackageMock = new EmlPackage({ packageId: '123-456-789' });
      const buildSurveyEmlPackageStub = sinon
        .stub(EmlService.prototype, 'buildSurveyEmlPackage')
        .resolves(emlPackageMock);

      const _submitDwCADatasetToBioHubStub = sinon
        .stub(PlatformService.prototype, '_submitDwCADatasetToBioHub')
        .rejects(new Error('a test error'));

      try {
        await platformService.submitSurveyDwCMetadataToBioHub(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('a test error');
        expect(buildSurveyEmlPackageStub).to.have.been.calledOnceWith({ surveyId: 1 });
        expect(_submitDwCADatasetToBioHubStub).to.be.calledOnceWith(
          sinon.match({
            archiveFile: sinon.match.object,
            dataPackageId: '123-456-789'
          })
        );
      }
    });
  });

  describe('submitProjectDataToBioHub', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws an error if BioHub intake is not enabled', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'false';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      try {
        await platformService.submitProjectDataToBioHub(1, {
          reports: [],
          attachments: []
        });
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('BioHub intake is not enabled');
      }
    });

    it('builds eml and submits data', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const emlPackageMock = new EmlPackage({ packageId: '123-456-789' });
      const buildProjectEmlPackageStub = sinon
        .stub(EmlService.prototype, 'buildProjectEmlPackage')
        .resolves(emlPackageMock);

      const submitProjectReportAttachmentsToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitProjectReportAttachmentsToBioHub')
        .resolves();

      const submitProjectAttachmentsToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitProjectAttachmentsToBioHub')
        .resolves();

      const response = await platformService.submitProjectDataToBioHub(1, {
        reports: ([{ id: 3 }, { id: 4 }] as unknown) as IGetSurveyReportAttachment[],
        attachments: ([{ id: 5 }, { id: 6 }] as unknown) as IGetSurveyAttachment[]
      });

      expect(buildProjectEmlPackageStub).to.have.been.calledOnceWith({ projectId: 1 });
      expect(submitProjectReportAttachmentsToBioHubStub).to.have.been.calledOnceWith('123-456-789', 1, [3, 4]);
      expect(submitProjectAttachmentsToBioHubStub).to.have.been.calledOnceWith('123-456-789', 1, [5, 6]);
      expect(response).to.eql({ uuid: '123-456-789' });
    });
  });

  describe('submitSurveyToBioHub', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws an error if BioHub intake is not enabled', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'false';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      try {
        await platformService.submitSurveyToBioHub(1, { additionalInformation: 'test' });
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('BioHub intake is not enabled');
      }
    });

    it('throws error when axios request fails', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'true';
      process.env.BACKBONE_API_HOST = 'http://backbone-host.dev/';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const getKeycloakServiceTokenStub = sinon
        .stub(KeycloakService.prototype, 'getKeycloakServiceToken')
        .resolves('token');

      const generateSurveyDataPackageStub = sinon
        .stub(PlatformService.prototype, 'generateSurveyDataPackage')
        .resolves(({ id: '123-456-789' } as unknown) as any);

      sinon.stub(axios, 'post').resolves({});

      try {
        await platformService.submitSurveyToBioHub(1, { additionalInformation: 'test' });
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to submit survey ID to Biohub');
        expect(getKeycloakServiceTokenStub).to.have.been.calledOnce;
        expect(generateSurveyDataPackageStub).to.have.been.calledOnceWith(1, 'test');
      }
    });

    it('should submit survey to BioHub successfully', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'true';
      process.env.BACKBONE_API_HOST = 'http://backbone-host.dev/';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const getKeycloakServiceTokenStub = sinon
        .stub(KeycloakService.prototype, 'getKeycloakServiceToken')
        .resolves('token');

      const generateSurveyDataPackageStub = sinon
        .stub(PlatformService.prototype, 'generateSurveyDataPackage')
        .resolves(({ id: '123-456-789' } as unknown) as any);

      sinon.stub(axios, 'post').resolves({ data: { submission_id: 1 } });

      const insertSurveyMetadataPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'insertSurveyMetadataPublishRecord')
        .resolves();

      const response = await platformService.submitSurveyToBioHub(1, { additionalInformation: 'test' });

      expect(getKeycloakServiceTokenStub).to.have.been.calledOnce;
      expect(generateSurveyDataPackageStub).to.have.been.calledOnceWith(1, 'test');
      expect(insertSurveyMetadataPublishRecordStub).to.have.been.calledOnceWith({ survey_id: 1, queue_id: 1 });
      expect(response).to.eql({ submission_id: 1 });
    });
  });

  describe('generateSurveyDataPackage', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should generate survey data package successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const getSurveyDataStub = sinon.stub(SurveyService.prototype, 'getSurveyData').resolves({ uuid: '1' } as any);

      const getSurveyObservationsWithSupplementaryDataStub = sinon
        .stub(ObservationService.prototype, 'getSurveyObservationsWithSupplementaryData')
        .resolves({ surveyObservations: [{ survey_observation_id: 2 } as any], supplementaryData: [] } as any);

      const getSurveyLocationsDataStub = sinon
        .stub(SurveyService.prototype, 'getSurveyLocationsData')
        .resolves([] as any);

      const response = await platformService.generateSurveyDataPackage(1, 'test');

      expect(getSurveyDataStub).to.have.been.calledOnceWith(1);
      expect(getSurveyObservationsWithSupplementaryDataStub).to.have.been.calledOnceWith(1);
      expect(getSurveyLocationsDataStub).to.have.been.calledOnceWith(1);
      expect(response).to.eql({
        id: '1',
        name: undefined,
        description: 'A Temp Description',
        features: [
          {
            id: '1',
            type: 'dataset',
            properties: {
              additional_information: 'test',
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
            features: [
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
                  observation_date: undefined
                },
                features: []
              }
            ]
          }
        ]
      });
    });
  });

  describe('submitSurveyDataToBioHub', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws an error if BioHub intake is not enabled', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'false';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      try {
        await platformService.submitSurveyDataToBioHub(1, {
          observations: [],
          summary: [],
          reports: [],
          attachments: []
        });
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('BioHub intake is not enabled');
      }
    });

    it('builds eml and submits data', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const emlPackageMock = new EmlPackage({ packageId: '123-456-789' });
      const buildSurveyEmlPackageStub = sinon
        .stub(EmlService.prototype, 'buildSurveyEmlPackage')
        .resolves(emlPackageMock);

      const submitSurveyDwCArchiveToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitSurveyDwCArchiveToBioHub')
        .resolves();

      const submitSurveyObservationInputDataToBiohubStub = sinon
        .stub(PlatformService.prototype, 'submitSurveyObservationInputDataToBiohub')
        .resolves();

      const submitSurveySummarySubmissionToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitSurveySummarySubmissionToBioHub')
        .resolves();

      const submitSurveyReportAttachmentsToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitSurveyReportAttachmentsToBioHub')
        .resolves();

      const submitSurveyAttachmentsToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitSurveyAttachmentsToBioHub')
        .resolves();

      const response = await platformService.submitSurveyDataToBioHub(1, {
        observations: ([{ id: 7 }] as unknown) as IGetObservationSubmissionResponse[],
        summary: ([{ id: 2 }] as unknown) as IGetSummaryResultsResponse[],
        reports: ([{ id: 3 }, { id: 4 }] as unknown) as IGetSurveyReportAttachment[],
        attachments: ([{ id: 5 }, { id: 6 }] as unknown) as IGetSurveyAttachment[]
      });

      expect(buildSurveyEmlPackageStub).to.have.been.calledOnceWith({ surveyId: 1 });
      expect(submitSurveyDwCArchiveToBioHubStub).to.have.been.calledOnceWith(1, emlPackageMock);
      expect(submitSurveyObservationInputDataToBiohubStub).to.have.been.calledOnceWith(1, emlPackageMock.packageId);
      expect(submitSurveySummarySubmissionToBioHubStub).to.have.been.calledOnceWith('123-456-789', 1);
      expect(submitSurveyReportAttachmentsToBioHubStub).to.have.been.calledOnceWith('123-456-789', 1, [3, 4]);
      expect(submitSurveyAttachmentsToBioHubStub).to.have.been.calledOnceWith('123-456-789', 1, [5, 6]);

      expect(response).to.eql({ uuid: '123-456-789' });
    });

    it('builds eml and submits nothing if data arrays are empty', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const emlPackageMock = new EmlPackage({ packageId: '123-456-789' });
      const buildSurveyEmlPackageStub = sinon
        .stub(EmlService.prototype, 'buildSurveyEmlPackage')
        .resolves(emlPackageMock);

      const submitSurveyDwCArchiveToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitSurveyDwCArchiveToBioHub')
        .resolves();

      const submitSurveySummarySubmissionToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitSurveySummarySubmissionToBioHub')
        .resolves();

      const submitSurveyReportAttachmentsToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitSurveyReportAttachmentsToBioHub')
        .resolves();

      const submitSurveyAttachmentsToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitSurveyAttachmentsToBioHub')
        .resolves();

      const response = await platformService.submitSurveyDataToBioHub(1, {
        observations: [],
        summary: [],
        reports: [],
        attachments: []
      });

      expect(buildSurveyEmlPackageStub).to.have.been.calledOnceWith({ surveyId: 1 });
      expect(submitSurveyDwCArchiveToBioHubStub).not.to.have.been.called;
      expect(submitSurveySummarySubmissionToBioHubStub).not.to.have.been.called;
      expect(submitSurveyReportAttachmentsToBioHubStub).not.to.have.been.called;
      expect(submitSurveyAttachmentsToBioHubStub).not.to.have.been.called;

      expect(response).to.eql({ uuid: '123-456-789' });
    });
  });

  describe('submitSurveyDwCArchiveToBioHub', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws an error if occurrence submission output key is invalid', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const occurrenceSubmissionMock = ({
        id: 1,
        output_key: null // invalid output_key
      } as unknown) as IGetLatestSurveyOccurrenceSubmission;

      const getLatestSurveyOccurrenceSubmissionStub = sinon
        .stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission')
        .resolves(occurrenceSubmissionMock);

      const emlPackageMock = new EmlPackage({ packageId: '123-456-789' });

      try {
        await platformService.submitSurveyDwCArchiveToBioHub(1, emlPackageMock);
        expect.fail();
      } catch (error) {
        expect((error as ApiGeneralError).message).to.equal('Failed to submit survey to BioHub');
        expect((error as ApiGeneralError).errors).to.eql(['Occurrence record has invalid s3 output key']);

        expect(getLatestSurveyOccurrenceSubmissionStub).to.have.been.calledOnceWith(1);
      }
    });

    it('throws an error if it fails to fetch occurrence file from S3', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const occurrenceSubmissionMock = ({
        occurrence_submission_id: 1,
        output_key: 'occurrenceSubmissionOutputKey'
      } as unknown) as IGetLatestSurveyOccurrenceSubmission;

      const getLatestSurveyOccurrenceSubmissionStub = sinon
        .stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission')
        .resolves(occurrenceSubmissionMock);

      const getFileFromS3Stub = sinon.stub(file_utils, 'getFileFromS3').resolves();

      const emlPackageMock = new EmlPackage({ packageId: '123-456-789' });

      try {
        await platformService.submitSurveyDwCArchiveToBioHub(1, emlPackageMock);
        expect.fail();
      } catch (error) {
        expect((error as ApiGeneralError).message).to.equal('Failed to submit survey to BioHub');
        expect((error as ApiGeneralError).errors).to.eql(['Failed to fetch occurrence file form S3']);

        expect(getLatestSurveyOccurrenceSubmissionStub).to.have.been.calledOnceWith(1);
        expect(getFileFromS3Stub).to.have.been.calledOnceWith('occurrenceSubmissionOutputKey');
      }
    });

    it('builds and submits DwCA', async () => {
      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const occurrenceSubmissionMock = ({
        occurrence_submission_id: 1,
        output_key: 'occurrenceSubmissionOutputKey'
      } as unknown) as IGetLatestSurveyOccurrenceSubmission;

      const getLatestSurveyOccurrenceSubmissionStub = sinon
        .stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission')
        .resolves(occurrenceSubmissionMock);

      const zipFIleMock = new AdmZip();
      zipFIleMock.addFile('filename.csv', Buffer.from('file-content'));

      const getFileFromS3Stub = sinon.stub(file_utils, 'getFileFromS3').resolves({ Body: zipFIleMock.toBuffer() });

      const securityRequestMock = ({} as unknown) as ISurveyProprietorModel;

      const getSurveyProprietorDataForSecurityRequestStub = sinon
        .stub(SurveyService.prototype, 'getSurveyProprietorDataForSecurityRequest')
        .resolves(securityRequestMock);

      const _submitDwCADatasetToBioHubStub = sinon
        .stub(PlatformService.prototype, '_submitDwCADatasetToBioHub')
        .resolves({ queue_id: 1 });

      const insertSurveyMetadataPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'insertSurveyMetadataPublishRecord')
        .resolves();

      const insertOccurrenceSubmissionPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'insertOccurrenceSubmissionPublishRecord')
        .resolves();

      const emlPackageMock = new EmlPackage({ packageId: '123-456-789' });

      await platformService.submitSurveyDwCArchiveToBioHub(1, emlPackageMock);

      expect(getLatestSurveyOccurrenceSubmissionStub).to.have.been.calledOnceWith(1);
      expect(getFileFromS3Stub).to.have.been.calledOnceWith('occurrenceSubmissionOutputKey');
      expect(getSurveyProprietorDataForSecurityRequestStub).to.have.been.calledOnceWith(1);
      expect(_submitDwCADatasetToBioHubStub).to.have.been.calledOnceWith(
        sinon.match({
          archiveFile: sinon.match.object,
          dataPackageId: '123-456-789'
        })
      );
      expect(insertSurveyMetadataPublishRecordStub).to.have.been.calledOnceWith({ survey_id: 1, queue_id: 1 });
      expect(insertOccurrenceSubmissionPublishRecordStub).to.have.been.calledOnceWith({
        occurrence_submission_id: 1,
        queue_id: 1
      });
    });
  });

  describe('_submitDwCADatasetToBioHub', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('submits a post request', async () => {
      process.env.BACKBONE_API_HOST = 'http://backbone-host.dev/';
      process.env.BACKBONE_INTAKE_PATH = 'api/intake';

      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const getKeycloakServiceTokenStub = sinon
        .stub(KeycloakService.prototype, 'getKeycloakServiceToken')
        .resolves('token');

      const axiosStub = sinon.stub(axios, 'post').resolves({ data: { queue_id: 1 } });

      const dwcaDatasetMock = {
        archiveFile: {
          data: Buffer.from([]),
          fileName: 'file-name',
          mimeType: 'application/zip'
        },
        dataPackageId: '123-456-789',
        securityRequest: {
          first_nations_id: 2,
          proprietor_type_id: 3,
          survey_id: 1,
          rational: 'rational',
          proprietor_name: 'proprietor name',
          disa_required: false
        }
      };

      const response = await platformService._submitDwCADatasetToBioHub(dwcaDatasetMock);

      expect(getKeycloakServiceTokenStub).to.have.been.calledOnce;
      expect(axiosStub).to.have.been.calledOnceWith(sinon.match.string, sinon.match.any, sinon.match.object);
      expect(response).to.eql({ queue_id: 1 });
    });
  });

  describe('submitProjectAttachmentsToBioHub', () => {
    beforeEach(() => {
      sinon.restore();
    });

    it('should upload attachments to BioHub successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const attachmentsStub = sinon.stub(AttachmentService.prototype, 'getProjectAttachmentsByIds').resolves([
        {
          project_attachment_id: 1,
          uuid: 'test-uuid1',
          file_name: 'test-filename1.txt',
          file_size: '20',
          title: 'test-title1',
          description: 'test-description1',
          key: 'test-key1'
        },
        {
          project_attachment_id: 2,
          uuid: 'test-uuid2',
          file_name: 'test-filename2.txt',
          file_type: 'Test File',
          file_size: '20',
          title: 'test-title2',
          description: 'test-description2',
          key: 'test-key2'
        }
      ] as IProjectAttachment[]);

      sinon
        .stub(file_utils, 'getFileFromS3')
        .onCall(0)
        .resolves({ Body: Buffer.from('content1') })
        .onCall(1)
        .resolves({ Body: Buffer.from('content2') });

      const submitArtifactStub = sinon
        .stub(platformService, '_submitArtifactToBioHub')
        .onCall(0)
        .resolves({ artifact_id: 1 })
        .onCall(1)
        .resolves({ artifact_id: 2 });

      const attachmentHistoryStub = sinon
        .stub(HistoryPublishService.prototype, 'insertProjectAttachmentPublishRecord')
        .onCall(0)
        .resolves({ project_attachment_publish_id: 1 })
        .onCall(1)
        .resolves({ project_attachment_publish_id: 2 });

      const response = await platformService.submitProjectAttachmentsToBioHub('cccc', 1, [1, 2]);

      expect(attachmentsStub).to.be.calledWith(1, [1, 2]);

      expect(submitArtifactStub).to.be.calledWith({
        dataPackageId: 'cccc',
        archiveFile: {
          data: sinon.match.any,
          fileName: `test-uuid1.zip`,
          mimeType: 'application/zip'
        },
        metadata: {
          file_name: 'test-filename1.txt',
          file_size: '20',
          file_type: 'Other',
          title: 'test-title1',
          description: 'test-description1'
        }
      });

      expect(submitArtifactStub).to.be.calledWith({
        dataPackageId: 'cccc',
        archiveFile: {
          data: sinon.match.any,
          fileName: `test-uuid2.zip`,
          mimeType: 'application/zip'
        },
        metadata: {
          file_name: 'test-filename2.txt',
          file_size: '20',
          file_type: 'Test File',
          title: 'test-title2',
          description: 'test-description2'
        }
      });

      expect(attachmentHistoryStub).to.be.calledTwice;

      expect(response).to.eql([{ project_attachment_publish_id: 1 }, { project_attachment_publish_id: 2 }]);
    });
  });

  describe('submitProjectReportAttachmentsToBioHub', () => {
    beforeEach(() => {
      sinon.restore();
    });

    it('should upload attachments to biohub successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const attachmentsStub = sinon.stub(AttachmentService.prototype, 'getProjectReportAttachmentsByIds').resolves([
        {
          project_report_attachment_id: 1,
          uuid: 'test-uuid1',
          file_name: 'test-filename1.txt',
          file_size: '20',
          title: 'test-title1',
          description: 'test-description1',
          key: 'test-key1'
        },
        {
          project_report_attachment_id: 2,
          uuid: 'test-uuid2',
          file_name: 'test-filename2.txt',
          file_type: 'Test File',
          file_size: '20',
          title: 'test-title2',
          description: 'test-description2',
          key: 'test-key2'
        }
      ] as IProjectReportAttachment[]);

      sinon
        .stub(file_utils, 'getFileFromS3')
        .onCall(0)
        .resolves({ Body: Buffer.from('content1') })
        .onCall(1)
        .resolves({ Body: Buffer.from('content2') });

      const submitArtifactStub = sinon
        .stub(platformService, '_submitArtifactToBioHub')
        .onCall(0)
        .resolves({ artifact_id: 1 })
        .onCall(1)
        .resolves({ artifact_id: 2 });

      const attachmentHistoryStub = sinon
        .stub(HistoryPublishService.prototype, 'insertProjectReportPublishRecord')
        .onCall(0)
        .resolves({ project_report_publish_id: 1 })
        .onCall(1)
        .resolves({ project_report_publish_id: 2 });

      const response = await platformService.submitProjectReportAttachmentsToBioHub('cccc', 1, [1, 2]);

      expect(attachmentsStub).to.be.calledWith(1, [1, 2]);

      expect(submitArtifactStub).to.be.calledWith({
        dataPackageId: 'cccc',
        archiveFile: {
          data: sinon.match.any,
          fileName: `test-uuid1.zip`,
          mimeType: 'application/zip'
        },
        metadata: {
          file_name: 'test-filename1.txt',
          file_size: '20',
          file_type: 'Report',
          title: 'test-title1',
          description: 'test-description1'
        }
      });

      expect(submitArtifactStub).to.be.calledWith({
        dataPackageId: 'cccc',
        archiveFile: {
          data: sinon.match.any,
          fileName: `test-uuid2.zip`,
          mimeType: 'application/zip'
        },
        metadata: {
          file_name: 'test-filename2.txt',
          file_size: '20',
          file_type: 'Report',
          title: 'test-title2',
          description: 'test-description2'
        }
      });

      expect(attachmentHistoryStub).to.be.calledTwice;

      expect(response).to.eql([{ project_report_publish_id: 1 }, { project_report_publish_id: 2 }]);
    });
  });

  describe('submitSurveyAttachmentsToBioHub', () => {
    beforeEach(() => {
      sinon.restore();
    });

    it('should upload survey attachments to biohub successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const attachmentsStub = sinon.stub(AttachmentService.prototype, 'getSurveyAttachmentsByIds').resolves([
        {
          survey_attachment_id: 1,
          uuid: 'test-uuid1',
          file_name: 'test-filename1.txt',
          file_size: '20',
          title: 'test-title1',
          description: 'test-description1',
          key: 'test-key1'
        },
        {
          survey_attachment_id: 2,
          uuid: 'test-uuid2',
          file_name: 'test-filename2.txt',
          file_type: 'Test File',
          file_size: '20',
          title: 'test-title2',
          description: 'test-description2',
          key: 'test-key2'
        }
      ] as ISurveyAttachment[]);

      sinon
        .stub(file_utils, 'getFileFromS3')
        .onCall(0)
        .resolves({ Body: Buffer.from('content1') })
        .onCall(1)
        .resolves({ Body: Buffer.from('content2') });

      const submitArtifactStub = sinon
        .stub(platformService, '_submitArtifactToBioHub')
        .onCall(0)
        .resolves({ artifact_id: 1 })
        .onCall(1)
        .resolves({ artifact_id: 2 });

      const attachmentHistoryStub = sinon
        .stub(HistoryPublishService.prototype, 'insertSurveyAttachmentPublishRecord')
        .onCall(0)
        .resolves({ survey_attachment_publish_id: 1 })
        .onCall(1)
        .resolves({ survey_attachment_publish_id: 2 });

      const response = await platformService.submitSurveyAttachmentsToBioHub('cccc', 1, [1, 2]);

      expect(attachmentsStub).to.be.calledWith(1, [1, 2]);

      expect(submitArtifactStub).to.be.calledWith({
        dataPackageId: 'cccc',
        archiveFile: {
          data: sinon.match.any,
          fileName: `test-uuid1.zip`,
          mimeType: 'application/zip'
        },
        metadata: {
          file_name: 'test-filename1.txt',
          file_size: '20',
          file_type: 'Other',
          title: 'test-title1',
          description: 'test-description1'
        }
      });

      expect(submitArtifactStub).to.be.calledWith({
        dataPackageId: 'cccc',
        archiveFile: {
          data: sinon.match.any,
          fileName: `test-uuid2.zip`,
          mimeType: 'application/zip'
        },
        metadata: {
          file_name: 'test-filename2.txt',
          file_size: '20',
          file_type: 'Test File',
          title: 'test-title2',
          description: 'test-description2'
        }
      });

      expect(attachmentHistoryStub).to.be.calledTwice;

      expect(response).to.eql([{ survey_attachment_publish_id: 1 }, { survey_attachment_publish_id: 2 }]);
    });
  });

  describe('submitSurveyReportAttachmentsToBioHub', () => {
    beforeEach(() => {
      sinon.restore();
    });

    it('should upload survey attachments to biohub successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const attachmentsStub = sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachmentsByIds').resolves([
        {
          survey_report_attachment_id: 1,
          uuid: 'test-uuid1',
          file_name: 'test-filename1.txt',
          create_user: 1,
          title: 'test-title1',
          description: 'test-description1',
          year_published: 2020,
          last_modified: '2020-01-01',
          key: 'test-key1',
          file_size: '20',
          revision_count: 1
        },
        {
          survey_report_attachment_id: 2,
          uuid: 'test-uuid2',
          file_name: 'test-filename2.txt',
          create_user: 1,
          title: 'test-title2',
          description: 'test-description2',
          year_published: 2020,
          last_modified: '2020-01-01',
          key: 'test-key2',
          file_size: '20',
          revision_count: 1
        }
      ] as ISurveyReportAttachment[]);

      sinon
        .stub(file_utils, 'getFileFromS3')
        .onCall(0)
        .resolves({ Body: Buffer.from('content1') })
        .onCall(1)
        .resolves({ Body: Buffer.from('content2') });

      const submitArtifactStub = sinon
        .stub(platformService, '_submitArtifactToBioHub')
        .onCall(0)
        .resolves({ artifact_id: 1 })
        .onCall(1)
        .resolves({ artifact_id: 2 });

      const attachmentHistoryStub = sinon
        .stub(HistoryPublishService.prototype, 'insertSurveyReportPublishRecord')
        .onCall(0)
        .resolves({ survey_report_publish_id: 1 })
        .onCall(1)
        .resolves({ survey_report_publish_id: 2 });

      const response = await platformService.submitSurveyReportAttachmentsToBioHub('cccc', 1, [1, 2]);

      expect(attachmentsStub).to.be.calledWith(1, [1, 2]);

      expect(submitArtifactStub).to.be.calledWith({
        dataPackageId: 'cccc',
        archiveFile: {
          data: sinon.match.any,
          fileName: `test-uuid1.zip`,
          mimeType: 'application/zip'
        },
        metadata: {
          file_name: 'test-filename1.txt',
          file_size: '20',
          file_type: 'Report',
          title: 'test-title1',
          description: 'test-description1'
        }
      });

      expect(submitArtifactStub).to.be.calledWith({
        dataPackageId: 'cccc',
        archiveFile: {
          data: sinon.match.any,
          fileName: `test-uuid2.zip`,
          mimeType: 'application/zip'
        },
        metadata: {
          file_name: 'test-filename2.txt',
          file_size: '20',
          file_type: 'Report',
          title: 'test-title2',
          description: 'test-description2'
        }
      });

      expect(attachmentHistoryStub).to.be.calledTwice;

      expect(response).to.eql([{ survey_report_publish_id: 1 }, { survey_report_publish_id: 2 }]);
    });
  });

  describe('_makeArtifactFromAttachmentOrReport', () => {
    it('should make an artifact from the given data', async () => {
      const mockDBConnection = getMockDBConnection();

      const platformService = new PlatformService(mockDBConnection);

      const testData = {
        dataPackageId: 'aaaa',
        attachment: {
          project_attachment_id: 1,
          uuid: 'test-uuid',
          file_name: 'test-filename.txt',
          file_size: '20',
          title: 'test-title',
          description: 'test-description',
          key: 'test-key'
        } as IProjectAttachment,
        file_type: 'Test File'
      };

      const testArtifactZip = new AdmZip();
      testArtifactZip.addFile('test-filename.txt', Buffer.from('hello-world'));

      const s3FileStub = sinon.stub(file_utils, 'getFileFromS3').resolves({
        Body: 'hello-world'
      });

      const artifact = await platformService._makeArtifactFromAttachmentOrReport(testData);

      expect(s3FileStub).to.be.calledWith('test-key');
      expect(artifact).to.eql({
        dataPackageId: 'aaaa',
        archiveFile: {
          data: testArtifactZip.toBuffer(),
          fileName: `test-uuid.zip`,
          mimeType: 'application/zip'
        },
        metadata: {
          file_name: 'test-filename.txt',
          file_size: '20',
          file_type: 'Test File',
          title: 'test-title',
          description: 'test-description'
        }
      });
    });
  });

  describe('submitSurveyObservationInputDataToBiohub', () => {
    it('should upload the input data for a survey observation submission to biohub successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const surveyOccurrenceSubmissionMock = ({
        occurrence_submission_id: 2,
        input_key: '/key/test.csv'
      } as unknown) as IGetLatestSurveyOccurrenceSubmission;

      sinon
        .stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission')
        .resolves(surveyOccurrenceSubmissionMock);

      const observationArtifactMock = { dataPackageId: 'test' } as IArtifact;

      const _makeArtifactFromObservationInputDataStub = sinon
        .stub(PlatformService.prototype, '_makeArtifactFromObservationInputData')
        .resolves(observationArtifactMock);

      const _submitArtifactToBioHubStub = sinon
        .stub(PlatformService.prototype, '_submitArtifactToBioHub')
        .resolves({ artifact_id: 3 });

      const insertOccurrenceSubmissionPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'insertOccurrenceSubmissionPublishRecord')
        .resolves();

      await platformService.submitSurveyObservationInputDataToBiohub(1, '123-456-789');

      expect(_makeArtifactFromObservationInputDataStub).to.be.calledWith('123-456-789', surveyOccurrenceSubmissionMock);
      expect(_submitArtifactToBioHubStub).to.be.calledWith(observationArtifactMock);
      expect(insertOccurrenceSubmissionPublishRecordStub).to.be.calledWith({
        occurrence_submission_id: 2,
        queue_id: 3
      });
    });
    it('should throw an error if occurrenceSubmissionData is incorrect', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const surveyOccurrenceSubmissionMock = ({
        occurrence_submission_id: 2,
        input_key: null
      } as unknown) as IGetLatestSurveyOccurrenceSubmission;

      sinon
        .stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission')
        .resolves(surveyOccurrenceSubmissionMock);

      try {
        await platformService.submitSurveyObservationInputDataToBiohub(1, '123-456-789');
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to submit survey to BioHub');
      }
    });
  });

  describe('_makeArtifactFromObservationInputData', () => {
    it('should make an artifact from the given data', async () => {
      const mockDBConnection = getMockDBConnection();

      const platformService = new PlatformService(mockDBConnection);

      const testData = {
        occurrence_submission_id: 1,
        input_file_name: 'test-filename.txt',
        input_key: 'input-test-key',
        output_key: 'output-test-key',
        message: 'message'
      } as IGetLatestSurveyOccurrenceSubmission;

      const testArtifactZip = new AdmZip();
      testArtifactZip.addFile('test-filename.txt', Buffer.from('hello-world'));

      const s3FileStub = sinon.stub(file_utils, 'getFileFromS3').resolves({
        Body: 'hello-world'
      });

      const artifact = await platformService._makeArtifactFromObservationInputData('aaaa', testData);

      expect(s3FileStub).to.be.calledWith(testData.input_key);
      expect(artifact.dataPackageId).to.eql('aaaa');
      expect(artifact.metadata).to.eql({
        file_name: 'test-filename.txt',
        file_size: 'undefined',
        file_type: 'Observations',
        title: 'test-filename.txt',
        description: 'message'
      });
    });
  });

  describe('submitSurveySummarySubmissionToBioHub', () => {
    it('should upload survey summary submission to biohub successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(EmlService.prototype, 'buildSurveyEmlPackage').resolves({
        toString: () => 'string',
        packageId: '123-456-789'
      } as EmlPackage);

      const surveySummarySubmissionMock = ({
        survey_summary_submission_id: 2,
        key: '/key/test.csv'
      } as unknown) as ISurveySummaryDetails;

      sinon.stub(SummaryService.prototype, 'getLatestSurveySummarySubmission').resolves(surveySummarySubmissionMock);

      const summaryArtifactMock = { dataPackageId: 'test' } as IArtifact;

      const _makeArtifactFromSummaryStub = sinon
        .stub(PlatformService.prototype, '_makeArtifactFromSurveySummarySubmission')
        .resolves(summaryArtifactMock);

      const _submitArtifactToBioHubStub = sinon
        .stub(PlatformService.prototype, '_submitArtifactToBioHub')
        .resolves({ artifact_id: 3 });

      const insertSurveySummaryPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'insertSurveySummaryPublishRecord')
        .resolves();

      await platformService.submitSurveySummarySubmissionToBioHub('123-456-789', 1);

      expect(_makeArtifactFromSummaryStub).to.be.calledWith('123-456-789', surveySummarySubmissionMock);
      expect(_submitArtifactToBioHubStub).to.be.calledWith(summaryArtifactMock);
      expect(insertSurveySummaryPublishRecordStub).to.be.calledWith({
        survey_summary_submission_id: 2,
        artifact_id: 3
      });
    });
  });

  describe('_makeArtifactFromSurveySummarySubmission', () => {
    it('should make an artifact from the given data', async () => {
      const mockDBConnection = getMockDBConnection();

      const platformService = new PlatformService(mockDBConnection);

      const testData = {
        survey_summary_submission_id: 1,
        key: 'test-key',
        uuid: 'test-uuid',
        file_name: 'test-filename.txt',
        delete_timestamp: null,
        submission_message_type_id: 1,
        message: 'test-message',
        submission_message_type_name: 'test-message-type',
        summary_submission_message_class_id: 1,
        submission_message_class_name: MESSAGE_CLASS_NAME.NOTICE
      } as ISurveySummaryDetails;

      const testArtifactZip = new AdmZip();
      testArtifactZip.addFile('test-filename.txt', Buffer.from('hello-world'));

      const s3FileStub = sinon.stub(file_utils, 'getFileFromS3').resolves({
        Body: 'hello-world'
      });

      const artifact = await platformService._makeArtifactFromSurveySummarySubmission('aaaa', testData);

      expect(s3FileStub).to.be.calledWith('test-key');
      expect(artifact).to.eql({
        dataPackageId: 'aaaa',
        archiveFile: {
          data: testArtifactZip.toBuffer(),
          fileName: `${testData.uuid}.zip`,
          mimeType: 'application/zip'
        },
        metadata: {
          file_name: testData.file_name,
          file_size: 'undefined',
          file_type: 'Summary Results',
          title: testData.file_name,
          description: testData.message
        }
      });
    });
  });

  describe('_submitArtifactToBioHub', () => {
    beforeEach(() => {
      process.env.BACKBONE_API_HOST = 'http://backbone-host.dev/';
      process.env.BACKBONE_INTAKE_PATH = 'api/intake';
      process.env.BACKBONE_ARTIFACT_INTAKE_PATH = 'api/artifact/intake';
      process.env.BACKBONE_INTAKE_ENABLED = 'true';
    });

    it('should submit an artifact to biohub successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const getKeycloakServiceTokenStub = sinon
        .stub(KeycloakService.prototype, 'getKeycloakServiceToken')
        .resolves('token');

      const axiosStub = sinon.stub(axios, 'post').resolves({
        data: {
          artifact_id: 222
        }
      });

      const testArtifactZip = new AdmZip();
      testArtifactZip.addFile('test-filename.txt', Buffer.from('hello-world'));

      const testArtifact = {
        dataPackageId: 'aaaa',
        archiveFile: {
          data: testArtifactZip.toBuffer(),
          fileName: `test-uuid.zip`,
          mimeType: 'application/zip'
        },
        metadata: {
          file_name: 'test-filename.txt',
          file_size: '20',
          file_type: 'Test File',
          title: 'test-title',
          description: 'test-description'
        }
      };

      await platformService._submitArtifactToBioHub(testArtifact);

      expect(getKeycloakServiceTokenStub).to.have.been.calledOnce;

      expect(axiosStub).to.have.been.calledOnceWith(
        'http://backbone-host.dev/api/artifact/intake',
        sinon.match.instanceOf(Buffer),
        {
          headers: {
            authorization: `Bearer token`,
            'content-type': sinon.match(new RegExp(/^multipart\/form-data; boundary=[-]*[0-9]*$/))
          }
        }
      );
    });
  });

  describe('deleteAttachmentFromBiohub', () => {
    beforeEach(() => {
      process.env.BACKBONE_API_HOST = 'http://backbone-host.dev/';
      process.env.BACKBONE_ARTIFACT_DELETE_PATH = 'api/artifact/delete';
      process.env.BACKBONE_INTAKE_ENABLED = 'true';
      sinon.restore();
    });

    it('should delete an attachment from biohub successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const getKeycloakServiceTokenStub = sinon
        .stub(KeycloakService.prototype, 'getKeycloakServiceToken')
        .resolves('token');

      const axiosStub = sinon.stub(axios, 'post').resolves({
        data: {
          success: true
        }
      });

      await platformService.deleteAttachmentFromBiohub('uuid');

      expect(getKeycloakServiceTokenStub).to.have.been.calledOnce;
      expect(axiosStub).to.have.been.calledOnceWith(
        'http://backbone-host.dev/api/artifact/delete',
        {
          artifactUUIDs: ['uuid']
        },
        {
          headers: {
            authorization: `Bearer token`
          }
        }
      );
    });
  });
});
