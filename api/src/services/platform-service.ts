import AdmZip from 'adm-zip';
import axios from 'axios';
import FormData from 'form-data';
import { URL } from 'url';
import { HTTP400 } from '../errors/http-error';
import { HistoryPublishRepository } from '../repositories/history-publish-repository';
import { ISurveyProprietorModel } from '../repositories/survey-repository';
import { getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';
import { EmlService } from './eml-service';
import { KeycloakService } from './keycloak-service';
import { SurveyService } from './survey-service';

export interface IDwCADataset {
  archiveFile: {
    /**
     * A Darwin Core Archive (DwCA) zip file.
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
  };
  /**
   * A UUID that uniquely identifies this DwCA dataset.
   */
  dataPackageId: string;

  securityRequest?: ISurveyProprietorModel;
}

export class PlatformService extends DBService {
  BACKBONE_INTAKE_ENABLED = process.env.BACKBONE_INTAKE_ENABLED === 'true' || false;
  BACKBONE_API_HOST = process.env.BACKBONE_API_HOST;
  BACKBONE_INTAKE_PATH = process.env.BACKBONE_INTAKE_PATH || '/api/dwc/submission/queue';

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
    try {
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
    } catch (error) {
      const defaultLog = getLogger('platformService->submitDwCAMetadataPackage');
      // Don't fail the rest of the endpoint if submitting metadata fails
      defaultLog.error({ label: 'platformService->submitDwCAMetadataPackage', message: 'error', error });
    }
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
  async _submitDwCADatasetToBioHubBackbone(dwcaDataset: IDwCADataset): Promise<{ queue_id: number }> {
    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakToken();

    const formData = new FormData();

    formData.append('media', dwcaDataset.archiveFile.data, {
      filename: dwcaDataset.archiveFile.fileName,
      contentType: dwcaDataset.archiveFile.mimeType
    });

    formData.append('data_package_id', dwcaDataset.dataPackageId);

    if (dwcaDataset.securityRequest) {
      formData.append('security_request[first_nations_id]', dwcaDataset.securityRequest.first_nations_id || 0);
      formData.append('security_request[proprietor_type_id]', dwcaDataset.securityRequest.proprietor_type_id || 0);
      formData.append('security_request[survey_id]', dwcaDataset.securityRequest.survey_id);
      formData.append('security_request[rational]', dwcaDataset.securityRequest.rational || 'ok what about this');
      formData.append('security_request[proprietor_name]', dwcaDataset.securityRequest.proprietor_name || '');
      formData.append('security_request[disa_required]', `${dwcaDataset.securityRequest.disa_required}`);
    }

    const backboneIntakeUrl = new URL(this.BACKBONE_INTAKE_PATH, this.BACKBONE_API_HOST).href;

    const { data } = await axios.post<{ queue_id: number }>(backboneIntakeUrl, formData.getBuffer(), {
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

    const publishRepo = new HistoryPublishRepository(this.connection);
    const surveyService = new SurveyService(this.connection);
    const surveyData = await surveyService.getLatestSurveyOccurrenceSubmission(surveyId);
    const securityRequest = await surveyService.getSurveyProprietorDataForSecurityRequest(surveyId);

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

    const dwCADataset: IDwCADataset = {
      archiveFile: {
        data: dwcArchiveZip.toBuffer(),
        fileName: `${emlService.packageId}.zip`,
        mimeType: 'application/zip'
      },
      dataPackageId: emlService.packageId,
      securityRequest
    };

    const queueResponse = await this._submitDwCADatasetToBioHubBackbone(dwCADataset);

    Promise.all([
      publishRepo.insertProjectMetadataPublishRecord({
        project_id: projectId,
        queue_id: queueResponse.queue_id
      }),
      publishRepo.insertSurveyMetadataPublishRecord({
        survey_id: surveyId,
        queue_id: queueResponse.queue_id
      }),
      publishRepo.insertOccurrenceSubmissionPublishRecord({
        occurrence_submission_id: surveyData.id,
        queue_id: queueResponse.queue_id
      })
    ]);
  }
}
