import AdmZip from 'adm-zip';
import { S3 } from 'aws-sdk';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import axios from 'axios';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTP400 } from '../errors/http-error';
import { IProjectAttachment, ISurveyAttachment } from '../repositories/attachment-repository';
import { HistoryPublishRepository } from '../repositories/history-publish-repository';
import { IGetLatestSurveyOccurrenceSubmission } from '../repositories/survey-repository';
import * as file_utils from '../utils/file-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { AttachmentService } from './attachment-service';
import { EmlService } from './eml-service';
import { HistoryPublishService } from './history-publish-service';
import { KeycloakService } from './keycloak-service';
import { IDwCADataset, PlatformService } from './platform-service';
import { SurveyService } from './survey-service';

chai.use(sinonChai);

describe('PlatformService', () => {
  describe('submitDwCAMetadataPackage', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('returns if intake Disabled', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'false';

      const platformService = new PlatformService(mockDBConnection);

      const response = await platformService.submitDwCAMetadataPackage(1);

      expect(response).to.eql(undefined);
    });

    it('fetches project EML and submits to the backbone', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const buildProjectEmlStub = sinon.stub(EmlService.prototype, 'buildProjectEml').resolves('xml data');

      sinon.stub(EmlService.prototype, 'packageId').get(() => '123-456-789');

      const _submitDwCADatasetToBioHubBackboneStub = sinon
        .stub(PlatformService.prototype, '_submitDwCADatasetToBioHubBackbone')
        .resolves({ queue_id: 1 });

      const platformService = new PlatformService(mockDBConnection);

      await platformService.submitDwCAMetadataPackage(1);

      expect(buildProjectEmlStub).to.have.been.calledOnce;
      expect(_submitDwCADatasetToBioHubBackboneStub).to.have.been.calledOnceWith({
        archiveFile: {
          data: sinon.match.any,
          fileName: 'DwCA.zip',
          mimeType: 'application/zip'
        },
        dataPackageId: '123-456-789'
      });
    });
  });

  describe('submitDwCADataPackage', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns if intake Disabled', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'false';

      const platformService = new PlatformService(mockDBConnection);

      const response = await platformService.submitDwCADataPackage(1);

      expect(response).to.eql(undefined);
    });

    it('fetches project EML and occurrence data and submits to the backbone', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const buildProjectEmlStub = sinon.stub(EmlService.prototype, 'buildProjectEml').resolves('xml data');

      sinon.stub(EmlService.prototype, 'packageId').get(() => '123-456-789');

      const _submitDwCADatasetToBioHubBackboneStub = sinon
        .stub(PlatformService.prototype, '_submitDwCADatasetToBioHubBackbone')
        .resolves({ queue_id: 1 });

      const platformService = new PlatformService(mockDBConnection);

      await platformService.submitDwCADataPackage(1);

      expect(buildProjectEmlStub).to.have.been.calledOnce;
      expect(_submitDwCADatasetToBioHubBackboneStub).to.have.been.calledOnceWith({
        archiveFile: {
          data: sinon.match.any,
          fileName: 'DwCA.zip',
          mimeType: 'application/zip'
        },
        dataPackageId: '123-456-789'
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

      await platformService._submitDwCADatasetToBioHubBackbone(dwcaDataset);

      expect(keycloakServiceStub).to.have.been.calledOnce;

      expect(axiosStub).to.have.been.calledOnceWith('http://backbone.com/api/intake', sinon.match.instanceOf(Buffer), {
        headers: {
          authorization: `Bearer token`,
          'content-type': sinon.match(new RegExp(/^multipart\/form-data; boundary=[-]*[0-9]*$/))
        }
      });
    });
  });

  describe('uploadSurveyDataToBioHub', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns if intake Disabled', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'false';

      const platformService = new PlatformService(mockDBConnection);

      const response = await platformService.uploadSurveyDataToBioHub(1, 1);

      expect(response).to.eql(undefined);
    });

    it('Throw error if no s3 key found', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const getLatestSurveyOccurrenceSubmissionStub = sinon
        .stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission')
        .resolves();

      const platformService = new PlatformService(mockDBConnection);

      try {
        await platformService.uploadSurveyDataToBioHub(1, 1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTP400).message).to.equal('no s3Key found');
        expect(getLatestSurveyOccurrenceSubmissionStub).to.have.been.calledOnce;
      }
    });

    it('Throw error if no s3 file found', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const getLatestSurveyOccurrenceSubmissionStub = sinon
        .stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission')
        .resolves(({ output_key: 'key' } as unknown) as IGetLatestSurveyOccurrenceSubmission);

      const getFileFromS3Stub = sinon
        .stub(file_utils, 'getFileFromS3')
        .resolves((false as unknown) as S3.GetObjectOutput);

      const platformService = new PlatformService(mockDBConnection);

      try {
        await platformService.uploadSurveyDataToBioHub(1, 1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTP400).message).to.equal('no s3File found');
        expect(getLatestSurveyOccurrenceSubmissionStub).to.have.been.calledOnce;
        expect(getFileFromS3Stub).to.have.been.calledOnce;
      }
    });

    it('Throw error if eml string failed to build', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const zipFile = new AdmZip();

      zipFile.addFile('file1.txt', Buffer.from('file1data'));
      zipFile.addFile('folder2/', Buffer.from('')); // add folder
      zipFile.addFile('folder2/file2.csv', Buffer.from('file2data'));

      const s3File = ({
        Metadata: { filename: 'zipFile.zip' },
        ContentType: 'application/zip',
        Body: zipFile.toBuffer()
      } as unknown) as GetObjectOutput;

      const getLatestSurveyOccurrenceSubmissionStub = sinon
        .stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission')
        .resolves(({ output_key: 'key' } as unknown) as IGetLatestSurveyOccurrenceSubmission);

      const getFileFromS3Stub = sinon.stub(file_utils, 'getFileFromS3').resolves(s3File);

      const buildProjectEmlStub = sinon.stub(EmlService.prototype, 'buildProjectEml').resolves();

      const platformService = new PlatformService(mockDBConnection);

      try {
        await platformService.uploadSurveyDataToBioHub(1, 1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTP400).message).to.equal('emlString failed to build');
        expect(getLatestSurveyOccurrenceSubmissionStub).to.have.been.calledOnce;
        expect(buildProjectEmlStub).to.have.been.calledOnce;
        expect(getFileFromS3Stub).to.have.been.calledOnce;
      }
    });

    it('Should succeed with valid data', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const zipFile = new AdmZip();

      zipFile.addFile('file1.txt', Buffer.from('file1data'));
      zipFile.addFile('folder2/', Buffer.from('')); // add folder
      zipFile.addFile('folder2/file2.csv', Buffer.from('file2data'));

      const s3File = ({
        Metadata: { filename: 'zipFile.zip' },
        ContentType: 'application/zip',
        Body: zipFile.toBuffer()
      } as unknown) as GetObjectOutput;

      const getLatestSurveyOccurrenceSubmissionStub = sinon
        .stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission')
        .resolves(({ output_key: 'key' } as unknown) as IGetLatestSurveyOccurrenceSubmission);

      const getFileFromS3Stub = sinon.stub(file_utils, 'getFileFromS3').resolves(s3File);

      const buildProjectEmlStub = sinon.stub(EmlService.prototype, 'buildProjectEml').resolves('string');
      sinon.stub(EmlService.prototype, 'packageId').get(() => 1);

      const _submitDwCADatasetToBioHubBackboneStub = sinon
        .stub(PlatformService.prototype, '_submitDwCADatasetToBioHubBackbone')
        .resolves({ queue_id: 1 });

      const insertProject = sinon
        .stub(HistoryPublishRepository.prototype, 'insertProjectMetadataPublishRecord')
        .resolves(1);
      const insertSurvey = sinon
        .stub(HistoryPublishRepository.prototype, 'insertSurveyMetadataPublishRecord')
        .resolves(1);
      const insertOccurrence = sinon
        .stub(HistoryPublishRepository.prototype, 'insertOccurrenceSubmissionPublishRecord')
        .resolves(1);

      const platformService = new PlatformService(mockDBConnection);

      await platformService.uploadSurveyDataToBioHub(1, 1);

      expect(buildProjectEmlStub).to.have.been.calledOnce;
      expect(getLatestSurveyOccurrenceSubmissionStub).to.have.been.calledOnce;
      expect(getFileFromS3Stub).to.have.been.calledOnce;
      expect(_submitDwCADatasetToBioHubBackboneStub).to.have.been.calledOnce;
      expect(insertProject).to.have.been.calledOnce;
      expect(insertSurvey).to.have.been.calledOnce;
      expect(insertOccurrence).to.have.been.calledOnce;
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

      const response = await platformService.uploadProjectAttachmentsToBioHub('cccc', 1, [1, 2]);

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

      const response = await platformService.uploadSurveyAttachmentsToBioHub('cccc', 1, [1, 2]);

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
});
