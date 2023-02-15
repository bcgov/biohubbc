import AdmZip from 'adm-zip';
import axios from 'axios';
import FormData from 'form-data';
import { URL } from 'url';
import { v4 as uuidV4 } from 'uuid';
import { HTTP400 } from '../errors/http-error';
import { getFileFromS3 } from '../utils/file-utils';
import { DBService } from './db-service';
import { EmlService } from './eml-service';
import { KeycloakService } from './keycloak-service';
import { SurveyService } from './survey-service';

export interface IArchiveFile {
  /**
   * Raw file data
   */
  data: Buffer;
  /**
   * The name of the archive file.
   */
  fileName: string;
  /**
   * The mime type, should be `application/zip` or similar.
   */
  mimeType: string;
}

export interface IDwCADataset {
  /**
   * A Darwin Core Archive (DwCA) zip file.
   */
  archiveFile: IArchiveFile;
  /**
   * A UUID that uniquely identifies this DwCA dataset.
   */
  dataPackageId: string;
}

export interface IArtifactMetadata {
  file_type: string;
  title?: string;
  description?: string;
}

export interface IArtifact {
  /**
   * An artifact zip file.
   */
  archiveFile: IArchiveFile;
  /**
   * UUID that uniquely identifies the artifact
   */
  dataPackageId: string;

  metadata: IArtifactMetadata & {
    file_name: string;
    file_size: number;
  };
}
export class PlatformService extends DBService {
  BACKBONE_INTAKE_ENABLED = process.env.BACKBONE_INTAKE_ENABLED === 'true' || false;
  BACKBONE_API_HOST = process.env.BACKBONE_API_HOST;
  BACKBONE_INTAKE_PATH = process.env.BACKBONE_INTAKE_PATH || '/api/dwc/submission/intake';
  BACKBONE_ARTIFACT_INTAKE_PATH = process.env.BACKBONE_ARTIFACT_INTAKE_PATH || '/api/artifact/intake';

  /**
   * Submit a Darwin Core Archive (DwCA) data package, that only contains the project/survey metadata, to the BioHub
   * Platform Backbone.
   *
   * Why submit only metadata? It is beneficial to submit the metadata as early as possible, so that the project/survey
   * is discoverable by users of BioHub, even if the project/survey has not yet completed or not all inventory data has
   * been submitted.
   *
   * Note: Does nothing if `process.env.BACKBONE_INTAKE_ENABLED` is not `true`.
   *
   * @param {number} projectId
   * @return {*}
   * @memberof PlatformService
   */
  async submitDwCAMetadataPackage(projectId: number) {
    if (!this.BACKBONE_INTAKE_ENABLED) {
      return;
    }

    const emlService = new EmlService({ projectId: projectId }, this.connection);

    const emlString = await emlService.buildProjectEml();

    const dwcArchiveZip = new AdmZip();
    dwcArchiveZip.addFile('eml.xml', Buffer.from(emlString));

    const dwCADataset = {
      archiveFile: {
        data: dwcArchiveZip.toBuffer(),
        fileName: 'DwCA.zip',
        mimeType: 'application/zip'
      },
      dataPackageId: emlService.packageId
    };

    return this._submitDwCADatasetToBioHubBackbone(dwCADataset);
  }

  /**
   * Submit a Darwin Core Archive (DwCA) data package, that contains both project/survey metadata and survey occurrence
   * data, to the BioHub Platform Backbone.
   *
   * Note: Does nothing if `process.env.BACKBONE_INTAKE_ENABLED` is not `true`.
   *
   * @param {number} projectId
   * @return {*}
   * @memberof PlatformService
   */
  async submitDwCADataPackage(projectId: number) {
    if (!this.BACKBONE_INTAKE_ENABLED) {
      return;
    }

    const emlService = new EmlService({ projectId: projectId }, this.connection);

    const emlString = await emlService.buildProjectEml();

    const dwcArchiveZip = new AdmZip();
    dwcArchiveZip.addFile('eml.xml', Buffer.from(emlString));
    // TODO fetch and add DwCA data files to archive

    const dwCADataset = {
      archiveFile: {
        data: dwcArchiveZip.toBuffer(),
        fileName: 'DwCA.zip',
        mimeType: 'application/zip'
      },
      dataPackageId: emlService.packageId
    };

    return this._submitDwCADatasetToBioHubBackbone(dwCADataset);
  }

  /**
   * Submit a new Darwin Core Archive (DwCA) data package to the BioHub Platform Backbone.
   *
   * @param {IDwCADataset} dwcaDataset
   * @return {*}  {Promise<{ data_package_id: string }>}
   * @memberof PlatformService
   */
  async _submitDwCADatasetToBioHubBackbone(dwcaDataset: IDwCADataset): Promise<{ data_package_id: string }> {
    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakToken();

    const formData = new FormData();

    formData.append('media', dwcaDataset.archiveFile.data, {
      filename: dwcaDataset.archiveFile.fileName,
      contentType: dwcaDataset.archiveFile.mimeType
    });

    formData.append('data_package_id', dwcaDataset.dataPackageId);

    const backboneIntakeUrl = new URL(this.BACKBONE_INTAKE_PATH, this.BACKBONE_API_HOST).href;

    const { data } = await axios.post<{ data_package_id: string }>(backboneIntakeUrl, formData.getBuffer(), {
      headers: {
        authorization: `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    return data;
  }

  /**
   * Upload Survey/Project/Observation data to Backbone
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}
   * @memberof PlatformService
   */
  async uploadSurveyDataToBioHub(projectId: number, surveyId: number) {
    if (!this.BACKBONE_INTAKE_ENABLED) {
      return;
    }

    const surveyService = new SurveyService(this.connection);
    const surveyData = await surveyService.getLatestSurveyOccurrenceSubmission(surveyId);

    if (!surveyData || !surveyData.output_key) {
      throw new HTTP400('no s3Key found');
    }

    const s3File = await getFileFromS3(surveyData.output_key);

    if (!s3File) {
      throw new HTTP400('no s3File found');
    }

    const dwcArchiveZip = new AdmZip(s3File.Body as Buffer);

    const emlService = new EmlService({ projectId: projectId }, this.connection);
    const emlString = await emlService.buildProjectEml();

    if (!emlString) {
      throw new HTTP400('emlString failed to build');
    }

    dwcArchiveZip.addFile('eml.xml', Buffer.from(emlString));

    const dwCADataset = {
      archiveFile: {
        data: dwcArchiveZip.toBuffer(),
        fileName: 'DwCA.zip',
        mimeType: 'application/zip'
      },
      dataPackageId: emlService.packageId
    };

    return this._submitDwCADatasetToBioHubBackbone(dwCADataset);
  }

  async uploadArtifactsToBioHub(dataPackageId: string, artifacts: { file: Express.Multer.File, metadata: IArtifactMetadata}[]): Promise<{artifact_id: number}[]> {
    const promises = artifacts.map((artifact) => {
      const artifactZip = new AdmZip();
      artifactZip.addFile(artifact.file.originalname, artifact.file.buffer);

      const artifactUuid = uuidV4();

      return this._submitArtifactToBioHub({
        dataPackageId,
        archiveFile: {
          data: artifactZip.toBuffer(),
          fileName: `${artifactUuid}.zip`,
          mimeType: 'application/zip'
        },
        metadata: {
          ...artifact.metadata,
          file_name: artifact.file.originalname,
          file_size: artifact.file.size
        },
      });
    });

    return Promise.all(promises);
  }

  async _submitArtifactToBioHub(artifact: IArtifact): Promise<{ artifact_id : number }> {
    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakToken();

    const formData = new FormData();

    formData.append('media', artifact.archiveFile.data, {
      filename: artifact.archiveFile.fileName,
      contentType: artifact.archiveFile.mimeType
    });

    formData.append('data_package_id', artifact.dataPackageId);

    Object.entries(artifact.metadata)
      .forEach(([metadataKey, metadataValue]) => {
        formData.append(`metadata[${metadataKey}]`, metadataValue)
      });

    const backboneArtifactIntakeUrl = new URL(this.BACKBONE_ARTIFACT_INTAKE_PATH, this.BACKBONE_API_HOST).href;

    const { data } = await axios.post<{ artifact_id: number }>(backboneArtifactIntakeUrl, formData.getBuffer(), {
      headers: {
        authorization: `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    return data;
  }
}
