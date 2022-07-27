import AdmZip from 'adm-zip';
import axios from 'axios';
import FormData from 'form-data';
import { URL } from 'url';
import xml2js from 'xml2js';
import { HTTP400 } from '../errors/custom-error';
import { queries } from '../queries/queries';
import { getFileFromS3 } from '../utils/file-utils';
import { EmlService } from './eml-service';
import { KeycloakService } from './keycloak-service';
import { DBService } from './service';
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
}

export class PlatformService extends DBService {
  BACKBONE_INTAKE_ENABLED = process.env.BACKBONE_INTAKE_ENABLED === 'true' || false;
  BACKBONE_API_HOST = process.env.BACKBONE_API_HOST;
  BACKBONE_INTAKE_PATH = process.env.BACKBONE_INTAKE_PATH || '/api/dwc/submission/intake';

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

  async submitSurveyToBackbone(projectId: number, surveyId: number) {
    if (!this.BACKBONE_INTAKE_ENABLED) {
      return;
    }

    const xml2jsBuilder = new xml2js.Builder({ renderOpts: { pretty: false } });

    console.log('xml2jsBuilder:', xml2jsBuilder);

    const emlService = new EmlService({ projectId: projectId }, this.connection);
    const surveyService = new SurveyService(this.connection);

    const surveyData = await surveyService.getSurveyById(surveyId);

    console.log('surveyData:', surveyData);

    await emlService.loadCodes();

    const emlRecord = await emlService.getSurveyEML(surveyData);

    console.log('emlRecord:', emlRecord);

    const surveyZip = new AdmZip();
    surveyZip.addFile('eml.xml', Buffer.from(xml2jsBuilder.buildObject(emlRecord)));

    const surveyAttachmentS3Keys: string[] = await this.getSurveyAttachmentS3Keys(surveyId);
    console.log('surveyAttachmentS3Keys:', surveyAttachmentS3Keys);

    if (surveyAttachmentS3Keys.length == 1) {
      const s3File = await getFileFromS3(surveyAttachmentS3Keys[0]);

      console.log('s3File:', s3File);
    }

    const dwCADataset = {
      archiveFile: {
        data: surveyZip.toBuffer(),
        fileName: 'survey.zip',
        mimeType: 'application/zip'
      },
      dataPackageId: emlService.packageId
    };

    return this._submitDwCADatasetToBioHubBackbone(dwCADataset);
  }

  getSurveyAttachmentS3Keys = async (surveyId: number) => {
    const getSurveyAttachmentSQLStatement = queries.survey.getSurveyAttachmentsSQL(surveyId);

    if (!getSurveyAttachmentSQLStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const getResult = await this.connection.query(
      getSurveyAttachmentSQLStatement.text,
      getSurveyAttachmentSQLStatement.values
    );

    console.log('getResult:', getResult);

    if (!getResult || !getResult.rows) {
      throw new HTTP400('Failed to get survey attachments');
    }

    return getResult.rows.map((attachment: any) => attachment.key);
  };
}
