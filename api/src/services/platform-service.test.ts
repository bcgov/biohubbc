import AdmZip from 'adm-zip';
import axios from 'axios';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { MESSAGE_CLASS_NAME } from '../constants/status';
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
import {
  IArtifact,
  IDwCADataset,
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

  describe('submitSurveyDataPackage', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('throws an error if intake is not enabled', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'false';

      const platformService = new PlatformService(mockDBConnection);

      try {
        await platformService.submitSurveyDwcArchiveToBiohub(1, {
          observations: [],
          summary: [],
          reports: [],
          attachments: []
        });
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Biohub intake is not enabled');
      }
    });

    it('throws an error if eml string failed to build', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(EmlService.prototype, 'buildSurveyEmlPackage').resolves({
        toString: () => (undefined as unknown) as string
      } as EmlPackage);

      try {
        await platformService.submitSurveyDwcArchiveToBiohub(1, {
          observations: [],
          summary: [],
          reports: [],
          attachments: []
        });
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('EML string failed to build');
      }
    });

    it('throws error when accessing latest survey Occurrence data', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(EmlService.prototype, 'buildSurveyEmlPackage').resolves({
        toString: () => 'string'
      } as EmlPackage);

      sinon
        .stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission')
        .resolves(({ output_key: null } as unknown) as IGetLatestSurveyOccurrenceSubmission);

      try {
        await platformService.submitSurveyDwcArchiveToBiohub(1, {
          observations: [({ inputFileName: 'test.csv' } as unknown) as IGetObservationSubmissionResponse],
          summary: [],
          reports: [],
          attachments: []
        });
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('no s3Key found');
      }
    });

    it('throws error when accessing s3 file from observations', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(EmlService.prototype, 'buildSurveyEmlPackage').resolves({
        toString: () => 'string'
      } as EmlPackage);

      sinon
        .stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission')
        .resolves({ output_key: '/key/test.csv' } as IGetLatestSurveyOccurrenceSubmission);

      sinon.stub(file_utils, 'getFileFromS3').resolves(undefined);
      try {
        await platformService.submitSurveyDwcArchiveToBiohub(1, {
          observations: [({ inputFileName: 'test.csv' } as unknown) as IGetObservationSubmissionResponse],
          summary: [],
          reports: [],
          attachments: []
        });
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('no s3File found');
      }
    });

    it('throws error when accessing latest survey summary data', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(EmlService.prototype, 'buildSurveyEmlPackage').resolves({
        toString: () => 'string'
      } as EmlPackage);

      sinon
        .stub(SummaryService.prototype, 'getLatestSurveySummarySubmission')
        .resolves(({ key: null } as unknown) as ISurveySummaryDetails);

      try {
        await platformService.submitSurveyDwcArchiveToBiohub(1, {
          observations: [],
          summary: [({ fileName: 'test.csv' } as unknown) as IGetSummaryResultsResponse],
          reports: [],
          attachments: []
        });
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('no s3Key found');
      }
    });

    it('creates and sends summary artifact', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(EmlService.prototype, 'buildSurveyEmlPackage').resolves({
        toString: () => 'string',
        packageId: 'packageId'
      } as EmlPackage);

      sinon
        .stub(SummaryService.prototype, 'getLatestSurveySummarySubmission')
        .resolves(({ key: '/key/test.csv' } as unknown) as ISurveySummaryDetails);

      const _makeArtifactFromSummaryStub = sinon
        .stub(PlatformService.prototype, '_makeArtifactFromSummary')
        .resolves({ dataPackageId: 'test' } as IArtifact);

      const _submitArtifactToBioHubStub = sinon
        .stub(PlatformService.prototype, '_submitArtifactToBioHub')
        .resolves({ artifact_id: 1 });

      sinon
        .stub(SurveyService.prototype, 'getSurveyProprietorDataForSecurityRequest')
        .resolves(({ first_nations_id: 1, proprietor_type_id: 1 } as unknown) as ISurveyProprietorModel);

      sinon.stub(PlatformService.prototype, '_submitDwCADatasetToBioHub').resolves({ queue_id: 1 });
      sinon.stub(PlatformService.prototype, 'publishSurveyDataHistory').resolves();
      sinon.stub(HistoryPublishService.prototype, 'insertProjectMetadataPublishRecord').resolves();

      await platformService.submitSurveyDwcArchiveToBiohub(1, {
        observations: [],
        summary: [({ fileName: 'test.csv' } as unknown) as IGetSummaryResultsResponse],
        reports: [],
        attachments: []
      });

      expect(_makeArtifactFromSummaryStub).to.be.calledWith('packageId', ({
        key: '/key/test.csv'
      } as unknown) as ISurveySummaryDetails);

      expect(_submitArtifactToBioHubStub).to.be.calledWith({ dataPackageId: 'test' } as IArtifact);
    });

    it('creates and sends report and attachment artifacts', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(EmlService.prototype, 'buildSurveyEmlPackage').resolves({
        toString: () => 'string',
        packageId: 'packageId'
      } as EmlPackage);

      sinon
        .stub(SurveyService.prototype, 'getSurveyProprietorDataForSecurityRequest')
        .resolves(({ first_nations_id: 1, proprietor_type_id: 1 } as unknown) as ISurveyProprietorModel);

      sinon.stub(PlatformService.prototype, '_submitDwCADatasetToBioHub').resolves({ queue_id: 1 });
      sinon.stub(PlatformService.prototype, 'publishSurveyDataHistory').resolves();
      sinon.stub(HistoryPublishService.prototype, 'insertProjectMetadataPublishRecord').resolves();

      const uploadSurveyReportAttachmentsToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitSurveyReportAttachmentsToBioHub')
        .resolves();
      const uploadSurveyAttachmentsToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitSurveyAttachmentsToBioHub')
        .resolves();

      await platformService.submitSurveyDwcArchiveToBiohub(1, {
        observations: [],
        summary: [],
        reports: [({ id: 1, fileName: 'test.csv' } as unknown) as IGetSurveyReportAttachment],
        attachments: [({ id: 1, fileName: 'test.csv' } as unknown) as IGetSurveyAttachment]
      });

      expect(uploadSurveyReportAttachmentsToBioHubStub).to.be.calledWith('packageId', 1, [1]);
      expect(uploadSurveyAttachmentsToBioHubStub).to.be.calledWith('packageId', 1, [1]);
    });

    it('submits and empty survey Data package', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const platformService = new PlatformService(mockDBConnection);

      sinon.stub(EmlService.prototype, 'buildSurveyEmlPackage').resolves({
        toString: () => 'string',
        packageId: 'packageId'
      } as EmlPackage);

      sinon
        .stub(SurveyService.prototype, 'getSurveyProprietorDataForSecurityRequest')
        .resolves(({ first_nations_id: 1, proprietor_type_id: 1 } as unknown) as ISurveyProprietorModel);

      sinon.stub(PlatformService.prototype, '_submitDwCADatasetToBioHub').resolves({ queue_id: 1 });
      sinon.stub(PlatformService.prototype, 'publishSurveyDataHistory').resolves();
      sinon.stub(HistoryPublishService.prototype, 'insertProjectMetadataPublishRecord').resolves();

      const response = await platformService.submitSurveyDwcArchiveToBiohub(1, {
        observations: [],
        summary: [],
        reports: [],
        attachments: []
      });

      expect(response).to.eql({ uuid: 'packageId' });
    });
  });

  describe('publishSurveyHistory', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('calls all insert function', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const publishIds = { queueId: 1, occurrenceId: 1, summaryInfo: { summaryId: 1, artifactId: 1 } };

      const insertSurveyMetadataPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'insertSurveyMetadataPublishRecord')
        .resolves(1);
      const insertOccurrenceSubmissionPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'insertOccurrenceSubmissionPublishRecord')
        .resolves(1);
      const insertSurveySummaryPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'insertSurveySummaryPublishRecord')
        .resolves({ survey_summary_submission_publish_id: 1 });

      await platformService.publishSurveyDataHistory(1, publishIds);

      expect(insertSurveyMetadataPublishRecordStub).to.have.been.calledOnceWith({
        survey_id: 1,
        queue_id: 1
      });
      expect(insertOccurrenceSubmissionPublishRecordStub).to.have.been.calledOnceWith({
        occurrence_submission_id: 1,
        queue_id: 1
      });
      expect(insertSurveySummaryPublishRecordStub).to.have.been.calledOnceWith({
        survey_summary_submission_id: 1,
        artifact_id: 1
      });
    });
  });

  describe('_submitDwCADatasetToBioHubBackbone', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('makes an axios post to the BioHub Platform Backbone API', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_API_HOST = 'http://backbone.com';
      process.env.BACKBONE_INTAKE_PATH = 'api/intake';
      process.env.BACKBONE_ARTIFACT_INTAKE_PATH = 'api/artifact/intake';
      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const keycloakServiceStub = sinon.stub(KeycloakService.prototype, 'getKeycloakToken').resolves('token');

      const axiosStub = sinon.stub(axios, 'post').resolves({ data_package_id: '123-456-789' });

      const dwcaDataset: IDwCADataset = {
        archiveFile: {
          data: Buffer.from([]),
          fileName: 'testFileName',
          mimeType: 'zip'
        },
        dataPackageId: '123-456-789'
      };

      const platformService = new PlatformService(mockDBConnection);

      await platformService._submitDwCADatasetToBioHub(dwcaDataset);

      expect(keycloakServiceStub).to.have.been.calledOnce;

      expect(axiosStub).to.have.been.calledOnceWith('http://backbone.com/api/intake', sinon.match.instanceOf(Buffer), {
        headers: {
          authorization: `Bearer token`,
          'content-type': sinon.match(new RegExp(/^multipart\/form-data; boundary=[-]*[0-9]*$/))
        }
      });
    });
  });

  describe('_makeArtifactFromAttachment', () => {
    it('should make an artifact from the given data', async () => {
      const mockDBConnection = getMockDBConnection();

      const platformService = new PlatformService(mockDBConnection);

      const testData = {
        dataPackageId: 'aaaa',
        attachment: {
          id: 1,
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

      const artifact = await platformService._makeArtifactFromAttachment(testData);

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

  describe('submitProjectMetadataToBiohubAndInsertHistoryRecords', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should submit and publish project DwCA Metadata', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const submitDwCAMetadataPackageStub = await sinon
        .stub(PlatformService.prototype, 'submitProjectMetadataOnlyToBiohub')
        .resolves({ queue_id: 1 });

      const insertProjectMetadataPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'insertProjectMetadataPublishRecord')
        .resolves();

      await platformService.submitProjectMetadataToBiohubAndInsertHistoryRecords(1);

      expect(submitDwCAMetadataPackageStub).to.be.calledWith(1);
      expect(insertProjectMetadataPublishRecordStub).to.be.calledWith({ project_id: 1, queue_id: 1 });
    });

    it('should throw error', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const submitDwCAMetadataPackageStub = await sinon
        .stub(PlatformService.prototype, 'submitProjectMetadataOnlyToBiohub')
        .rejects(new Error('a test error'));

      try {
        await platformService.submitProjectMetadataToBiohubAndInsertHistoryRecords(1);
        expect.fail();
      } catch (actualError: any) {
        expect(submitDwCAMetadataPackageStub).to.be.calledWith(1);
      }
    });
  });

  describe('_makeArtifactFromSummary', () => {
    it('should make an artifact from the given data', async () => {
      const mockDBConnection = getMockDBConnection();

      const platformService = new PlatformService(mockDBConnection);

      const testData = {
        id: 1,
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

      const artifact = await platformService._makeArtifactFromSummary('aaaa', testData);

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
          file_type: 'Summary',
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

      const keycloakServiceStub = sinon.stub(KeycloakService.prototype, 'getKeycloakToken').resolves('token');

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

      expect(keycloakServiceStub).to.have.been.calledOnce;

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

  describe('uploadProjectAttachmentsToBioHub', () => {
    beforeEach(() => {
      sinon.restore();
    });

    it('should upload attachments to biohub successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const attachmentsStub = sinon.stub(AttachmentService.prototype, 'getProjectAttachmentsByIds').resolves([
        {
          id: 1,
          uuid: 'test-uuid1',
          file_name: 'test-filename1.txt',
          file_size: '20',
          title: 'test-title1',
          description: 'test-description1',
          key: 'test-key1'
        },
        {
          id: 2,
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

  describe('uploadProjectReportAttachmentsToBioHub', () => {
    beforeEach(() => {
      sinon.restore();
    });

    it('should upload attachments to biohub successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const attachmentsStub = sinon.stub(AttachmentService.prototype, 'getProjectReportAttachmentsByIds').resolves([
        {
          id: 1,
          uuid: 'test-uuid1',
          file_name: 'test-filename1.txt',
          file_size: '20',
          title: 'test-title1',
          description: 'test-description1',
          key: 'test-key1'
        },
        {
          id: 2,
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

  describe('uploadSurveyAttachmentsToBioHub', () => {
    beforeEach(() => {
      sinon.restore();
    });

    it('should upload survey attachments to biohub successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const attachmentsStub = sinon.stub(AttachmentService.prototype, 'getSurveyAttachmentsByIds').resolves([
        {
          id: 1,
          uuid: 'test-uuid1',
          file_name: 'test-filename1.txt',
          file_size: '20',
          title: 'test-title1',
          description: 'test-description1',
          key: 'test-key1'
        },
        {
          id: 2,
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

  describe('uploadSurveyReportAttachmentsToBioHub', () => {
    beforeEach(() => {
      sinon.restore();
    });

    it('should upload survey attachments to biohub successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const platformService = new PlatformService(mockDBConnection);

      const attachmentsStub = sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachmentsByIds').resolves([
        {
          id: 1,
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
          id: 2,
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
});
