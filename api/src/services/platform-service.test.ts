import AdmZip from 'adm-zip';
import { S3 } from 'aws-sdk';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import axios from 'axios';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTP400 } from '../errors/http-error';
import { IGetLatestSurveyOccurrenceSubmission } from '../repositories/survey-repository';
import * as file_utils from '../utils/file-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { EmlService } from './eml-service';
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

      const platformService = new PlatformService(mockDBConnection);

      await platformService.uploadSurveyDataToBioHub(1, 1);

      expect(buildProjectEmlStub).to.have.been.calledOnce;
      expect(getLatestSurveyOccurrenceSubmissionStub).to.have.been.calledOnce;
      expect(getFileFromS3Stub).to.have.been.calledOnce;
      expect(_submitDwCADatasetToBioHubBackboneStub).to.have.been.calledOnce;
    });
  });
});
