import { QueryResult } from 'pg';
import { ATTACHMENT_TYPE, TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE } from '../constants/attachments';
import { IDBConnection } from '../database/db';
import { HTTP400 } from '../errors/http-error';
import {
  GetAttachmentsWithSupplementalData,
  PostReportAttachmentMetadata,
  PutReportAttachmentMetadata
} from '../models/survey-attachments';
import {
  AttachmentRepository,
  ISurveyAttachment,
  ISurveyReportAttachment,
  ISurveyReportAttachmentAuthor,
  SurveyTelemetryCredentialAttachment
} from '../repositories/attachment-repository';
import { TelemetryLotekRepository } from '../repositories/telemetry-repositories/telemetry-lotek-repository';
import { TelemetryVectronicRepository } from '../repositories/telemetry-repositories/telemetry-vectronic-repository';
import { TelemetryVendorRepository } from '../repositories/telemetry-repositories/telemetry-vendor-repository';
import { TelemetryVendorEnum } from '../repositories/telemetry-repositories/telemetry-vendor-repository.interface';
import { deleteFileFromS3, generateS3FileKey } from '../utils/file-utils';
import { DBService } from './db-service';
import { HistoryPublishService } from './history-publish-service';
import { getTelemetryDeviceKey, IValidationData } from './telemetry-services/telemetry-utils';

/**
 * Response object for inserting a device key into the tables
 *
 * @export
 * @interface IResponseTelemetryCredentialAttachment
 * @typedef {IResponseTelemetryCredentialAttachment}
 */
export interface IResponseTelemetryCredentialAttachment {
  key?: string;
  survey_telemetry_credential_attachment_id?: number;
  survey_telemetry_vendor_credential_id?: number[];
  telemetry_credential_lotek_id?: number[];
  telemetry_credential_vectronic_id?: number[];
}

/**
 * Data required to persist a device key
 *
 * @export
 * @interface IDeviceKeyData
 * @typedef {IDeviceKeyData}
 */
export interface IDeviceKeyData {
  fileName: string;
  fileSize: number;
  fileData: IValidationData;
  surveyId: number;
  key: string;
}

/**
 * A service class for accessing project and survey attachment data.
 *
 * @export
 * @class AttachmentService
 * @extends {DBService}
 */
export class AttachmentService extends DBService {
  attachmentRepository: AttachmentRepository;
  telemetryVectronicRepository: TelemetryVectronicRepository;
  telemetryLotekRepository: TelemetryLotekRepository;
  telemetryVendorRepository: TelemetryVendorRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.attachmentRepository = new AttachmentRepository(connection);
    this.telemetryVectronicRepository = new TelemetryVectronicRepository(connection);
    this.telemetryLotekRepository = new TelemetryLotekRepository(connection);
    this.telemetryVendorRepository = new TelemetryVendorRepository(connection);
  }

  /**
   * Finds all of the survey attachments for the given survey ID.
   * @param {number} surveyId the ID of the survey
   * @return {Promise<ISurveyAttachment[]>} Promise resolving all survey attachments.
   * @memberof AttachmentService
   */
  async getSurveyAttachments(surveyId: number): Promise<ISurveyAttachment[]> {
    return this.attachmentRepository.getSurveyAttachments(surveyId);
  }

  /**
   * Finds a survey attachment having the given survey ID and attachment ID
   *
   * @param {number} surveyId
   * @param {number} attachmentId
   * @return {*}  {Promise<ISurveyAttachment>}
   * @memberof AttachmentService
   */
  async getSurveyAttachmentById(surveyId: number, attachmentId: number): Promise<ISurveyAttachment> {
    return this.attachmentRepository.getSurveyAttachmentById(surveyId, attachmentId);
  }

  /**
   * Finds all of the survey attachments and Supplementary Data for the given survey ID.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<GetAttachmentsData[]>}
   * @memberof AttachmentService
   */
  async getSurveyAttachmentsWithSupplementaryData(surveyId: number): Promise<GetAttachmentsWithSupplementalData[]> {
    const historyPublishService = new HistoryPublishService(this.connection);

    const attachment = await this.attachmentRepository.getSurveyAttachments(surveyId);

    return Promise.all(
      attachment.map(async (attachment: any) => {
        const supplementaryData = await historyPublishService.getSurveyAttachmentPublishRecord(
          attachment.survey_attachment_id
        );

        return new GetAttachmentsWithSupplementalData(attachment, supplementaryData);
      })
    );
  }

  /**
   * Finds all of the survey attachments for the given survey ID and attachment IDs.
   * @param {number} surveyId the ID of the survey
   * @param {number[]} attachmentIds the IDs of the attachments to retreive
   * @return {Promise<ISurveyAttachment[]>} The given survey attachments.
   * @memberof AttachmentService
   */
  async getSurveyAttachmentsByIds(surveyId: number, attachmentIds: number[]): Promise<ISurveyAttachment[]> {
    return this.attachmentRepository.getSurveyAttachmentsByIds(surveyId, attachmentIds);
  }

  /**
   * Get all survey attachments for the given survey ID, which are publishable to BioHub.
   *
   * Note: Not all attachment types are publishable to BioHub. This method filters out attachment types that should not
   * be published.
   *
   * @param {number} surveyId the ID of the survey.
   * @return {Promise<ISurveyAttachment[]>} Promise resolving all survey publishable attachments.
   * @memberof AttachmentService
   */
  async getSurveyAttachmentsForBioHubSubmission(surveyId: number): Promise<ISurveyAttachment[]> {
    return this.attachmentRepository.getSurveyAttachmentsForBioHubSubmission(surveyId);
  }

  /**
   * Finds all of the survey report attachments for the given survey ID.
   * @param {number} surveyId the ID of the survey
   * @return {Promise<ISurveyReportAttachment[]>} Promise resolving all survey report attachments.
   * @memberof AttachmentService
   */
  async getSurveyReportAttachments(surveyId: number): Promise<ISurveyReportAttachment[]> {
    return this.attachmentRepository.getSurveyReportAttachments(surveyId);
  }

  /**
   * Finds all of the survey report attachments and Supplementary Data for the given survey ID.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<GetAttachmentsData[]>}
   * @memberof AttachmentService
   */
  async getSurveyReportAttachmentsWithSupplementaryData(
    surveyId: number
  ): Promise<GetAttachmentsWithSupplementalData[]> {
    const historyPublishService = new HistoryPublishService(this.connection);

    const attachment = await this.attachmentRepository.getSurveyReportAttachments(surveyId);

    return Promise.all(
      attachment.map(async (attachment: ISurveyReportAttachment) => {
        const supplementaryData = await historyPublishService.getSurveyReportPublishRecord(
          attachment.survey_report_attachment_id
        );

        return new GetAttachmentsWithSupplementalData(attachment, supplementaryData);
      })
    );
  }

  /**
   * Finds a survey report attachment having the given survey ID and attachment ID
   * @param {number} surveyId the ID of the survey
   * @param {number} reportAttachmentId the ID of the survey report attachment
   * @return {Promise<ISurveyReportAttachment>} Promise resolving the given survey attachment
   * @memberof AttachmentService
   */
  async getSurveyReportAttachmentById(surveyId: number, reportAttachmentId: number): Promise<ISurveyReportAttachment> {
    return this.attachmentRepository.getSurveyReportAttachmentById(surveyId, reportAttachmentId);
  }

  /**
   * Finds a survey report attachment having the given survey ID and attachment IDs
   * @param {number} surveyId the ID of the survey
   * @param {number[]} reportAttachmentIds the IDs of the survey report attachments
   * @return {Promise<ISurveyReportAttachment[]>} The given survey attachments
   * @memberof AttachmentService
   */
  async getSurveyReportAttachmentsByIds(
    surveyId: number,
    reportAttachmentIds: number[]
  ): Promise<ISurveyReportAttachment[]> {
    return this.attachmentRepository.getSurveyReportAttachmentsByIds(surveyId, reportAttachmentIds);
  }

  /**
   * Finds all authors belonging to the given survey attachment
   * @param {number} reportAttachmentId the ID of the report attachment
   * @return {Promise<ISurveyReportAttachmentAuthor[]>} Promise resolving all of the report authors
   * @memberof AttachmentService
   */
  async getSurveyAttachmentAuthors(reportAttachmentId: number): Promise<ISurveyReportAttachmentAuthor[]> {
    return this.attachmentRepository.getSurveyReportAttachmentAuthors(reportAttachmentId);
  }

  /**
   * Gets all of the survey telemetry credential attachments for the given survey ID.
   *
   * @param {number} surveyId the ID of the survey
   * @return {Promise<SurveyTelemetryCredentialAttachment[]>} Promise resolving all survey telemetry attachments.
   * @memberof AttachmentService
   */
  async getSurveyTelemetryCredentialAttachments(surveyId: number): Promise<SurveyTelemetryCredentialAttachment[]> {
    return this.attachmentRepository.getSurveyTelemetryCredentialAttachments(surveyId);
  }

  /**
   * Insert Survey Report Attachment
   *
   * @param {string} fileName
   * @param {number} fileSize
   * @param {number} surveyId
   * @param {PostReportAttachmentMetadata} attachmentMeta
   * @param {string} key
   * @return {*}  {Promise<{ survey_report_attachment_id: number; revision_count: number }>}
   * @memberof AttachmentService
   */
  async insertSurveyReportAttachment(
    fileName: string,
    fileSize: number,
    surveyId: number,
    attachmentMeta: PostReportAttachmentMetadata,
    key: string
  ): Promise<{ survey_report_attachment_id: number; revision_count: number }> {
    return this.attachmentRepository.insertSurveyReportAttachment(fileName, fileSize, surveyId, attachmentMeta, key);
  }

  /**
   * Update Survey Report Attachment
   *
   * @param {string} fileName
   * @param {number} surveyId
   * @param {PutReportAttachmentMetadata} attachmentMeta
   * @return {*}  {Promise<{ survey_report_attachment_id: number; revision_count: number }>}
   * @memberof AttachmentService
   */
  async updateSurveyReportAttachment(
    fileName: string,
    surveyId: number,
    attachmentMeta: PutReportAttachmentMetadata
  ): Promise<{ survey_report_attachment_id: number; revision_count: number }> {
    return this.attachmentRepository.updateSurveyReportAttachment(fileName, surveyId, attachmentMeta);
  }

  /**
   * Delete Survey Report Attachment Authors
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentService
   */
  async deleteSurveyReportAttachmentAuthors(attachmentId: number): Promise<void> {
    return this.attachmentRepository.deleteSurveyReportAttachmentAuthors(attachmentId);
  }

  /**
   * Insert Survey Report Attachment Author
   *
   * @param {number} attachmentId
   * @param {{ first_name: string; last_name: string }} author
   * @return {*}  {Promise<void>}
   * @memberof AttachmentService
   */
  async insertSurveyReportAttachmentAuthor(
    attachmentId: number,
    author: { first_name: string; last_name: string }
  ): Promise<void> {
    return this.attachmentRepository.insertSurveyReportAttachmentAuthor(attachmentId, author);
  }

  /**
   * Get Survey Report Attachment By File Name
   *
   * @param {number} surveyId
   * @param {string} fileName
   * @return {*}  {Promise<QueryResult>}
   * @memberof AttachmentService
   */
  async getSurveyReportAttachmentByFileName(surveyId: number, fileName: string): Promise<QueryResult> {
    return this.attachmentRepository.getSurveyReportAttachmentByFileName(surveyId, fileName);
  }

  /**
   * Upsert Survey Report Attachment
   *
   * @param {Express.Multer.File} file
   
   * @param {number} surveyId
   * @param {*} attachmentMeta
   * @return {*}  {Promise<{ survey_report_attachment_id: number; revision_count: number; key: string }>}
   * @memberof AttachmentService
   */
  async upsertSurveyReportAttachment(
    file: Express.Multer.File,

    surveyId: number,
    attachmentMeta: any
  ): Promise<{ survey_report_attachment_id: number; revision_count: number; key: string }> {
    const key = generateS3FileKey({
      surveyId: surveyId,
      fileName: file.originalname,
      folder: 'reports'
    });

    const getResponse = await this.getSurveyReportAttachmentByFileName(surveyId, file.originalname);

    let metadata;
    let attachmentResult: { survey_report_attachment_id: number; revision_count: number };

    if (getResponse && getResponse.rowCount) {
      // Existing attachment with matching name found, update it
      metadata = new PutReportAttachmentMetadata(attachmentMeta);
      attachmentResult = await this.updateSurveyReportAttachment(file.originalname, surveyId, metadata);
    } else {
      // No matching attachment found, insert new attachment
      metadata = new PostReportAttachmentMetadata(attachmentMeta);
      attachmentResult = await this.insertSurveyReportAttachment(
        file.originalname,
        file.size,
        surveyId,
        new PostReportAttachmentMetadata(attachmentMeta),
        key
      );
    }

    // Delete any existing attachment author records
    await this.deleteSurveyReportAttachmentAuthors(attachmentResult.survey_report_attachment_id);

    const promises = [];

    // Insert any new attachment author records
    promises.push(
      metadata.authors.map((author) =>
        this.insertSurveyReportAttachmentAuthor(attachmentResult.survey_report_attachment_id, author)
      )
    );

    await Promise.all(promises);

    return { ...attachmentResult, key };
  }

  /**
   * Delete Survey Report Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<{ key: string; uuid: string }>}
   * @memberof AttachmentService
   */
  async _deleteSurveyReportAttachmentRecord(attachmentId: number): Promise<{ key: string; uuid: string }> {
    return this.attachmentRepository.deleteSurveyReportAttachmentRecord(attachmentId);
  }

  /**
   * Delete Survey Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<{ key: string; uuid: string }>}
   * @memberof AttachmentService
   */
  async _deleteSurveyAttachmentRecord(attachmentId: number): Promise<{ key: string; uuid: string }> {
    return this.attachmentRepository.deleteSurveyAttachmentRecord(attachmentId);
  }

  /**
   * Get Survey Attachment S3 Key
   *
   * @param {number} surveyId
   * @param {number} attachmentId
   * @return {*}  {Promise<string>}
   * @memberof AttachmentService
   */
  async getSurveyAttachmentS3Key(surveyId: number, attachmentId: number): Promise<string> {
    return this.attachmentRepository.getSurveyAttachmentS3Key(surveyId, attachmentId);
  }

  /**
   * Get Survey Report Attachment S3 Key
   *
   * @param {number} surveyId
   * @param {number} attachmentId
   * @return {*}  {Promise<string>}
   * @memberof AttachmentService
   */
  async getSurveyReportAttachmentS3Key(surveyId: number, attachmentId: number): Promise<string> {
    return this.attachmentRepository.getSurveyReportAttachmentS3Key(surveyId, attachmentId);
  }

  /**
   * Update Survey Report Attachment Metadata
   *
   * @param {number} surveyId
   * @param {number} attachmentId
   * @param {PutReportAttachmentMetadata} metadata
   * @return {*}  {Promise<void>}
   * @memberof AttachmentService
   */
  async updateSurveyReportAttachmentMetadata(
    surveyId: number,
    attachmentId: number,
    metadata: PutReportAttachmentMetadata
  ): Promise<void> {
    return this.attachmentRepository.updateSurveyReportAttachmentMetadata(surveyId, attachmentId, metadata);
  }

  /**
   * Update Survey Attachment
   *
   * @param {number} surveyId
   * @param {string} fileName
   * @param {string} fileType
   * @return {*}  {Promise<{ survey_attachment_id: number; revision_count: number }>}
   * @memberof AttachmentService
   */
  async updateSurveyAttachment(
    surveyId: number,
    fileName: string,
    fileType: string
  ): Promise<{ survey_attachment_id: number; revision_count: number }> {
    return this.attachmentRepository.updateSurveyAttachment(surveyId, fileName, fileType);
  }

  /**
   * Insert Survey Attachment
   *
   * @param {string} fileName
   * @param {number} fileSize
   * @param {string} fileType
   * @param {number} surveyId
   * @param {string} key
   * @return {*}  {Promise<{ survey_attachment_id: number; revision_count: number }>}
   * @memberof AttachmentService
   */
  async insertSurveyAttachment(
    fileName: string,
    fileSize: number,
    fileType: string,
    surveyId: number,
    key: string
  ): Promise<{ survey_attachment_id: number; revision_count: number }> {
    return this.attachmentRepository.insertSurveyAttachment(fileName, fileSize, fileType, surveyId, key);
  }

  /**
   * Get Survey Attachment By File Name
   *
   * @param {string} fileName
   * @param {number} surveyId
   * @return {*}  {Promise<QueryResult>}
   * @memberof AttachmentService
   */
  async getSurveyAttachmentByFileName(fileName: string, surveyId: number): Promise<QueryResult> {
    return this.attachmentRepository.getSurveyAttachmentByFileName(fileName, surveyId);
  }

  /**
   * Upsert Survey Attachment
   *
   * @param {Express.Multer.File} file
   
   * @param {number} surveyId
   * @param {string} attachmentType
   * @return {*}  {Promise<{ survey_attachment_id: number; revision_count: number; key: string }>}
   * @memberof AttachmentService
   */
  async upsertSurveyAttachment(
    file: Express.Multer.File,

    surveyId: number,
    attachmentType: string
  ): Promise<{ survey_attachment_id: number; revision_count: number; key: string }> {
    const key = generateS3FileKey({
      surveyId: surveyId,
      fileName: file.originalname
    });

    const getResponse = await this.getSurveyAttachmentByFileName(file.originalname, surveyId);

    let attachmentResult: { survey_attachment_id: number; revision_count: number };

    if (getResponse && getResponse.rowCount) {
      // Existing attachment with matching name found, update it
      attachmentResult = await this.updateSurveyAttachment(surveyId, file.originalname, attachmentType);
    } else {
      // No matching attachment found, insert new attachment
      attachmentResult = await this.insertSurveyAttachment(file.originalname, file.size, attachmentType, surveyId, key);
    }

    return { ...attachmentResult, key };
  }

  /**
   * Handle deletion of Survey Attachment.
   *
   * If (attachmentType = report):
   * - delete authors
   * - delete publish record
   * - delete attachment
   * Else (attachmentType = attachment):
   * - delete publish record
   * - delete attachment
   *
   * @param {number} surveyId
   * @param {number} attachmentId
   * @param {string} attachmentType
   * @return {*}  {Promise<void>}
   * @memberof AttachmentService
   */
  async deleteSurveyAttachment(surveyId: number, attachmentId: number, attachmentType: string): Promise<void> {
    const historyPublishService = new HistoryPublishService(this.connection);

    let attachment: ISurveyAttachment | ISurveyReportAttachment | null;

    if (attachmentType === ATTACHMENT_TYPE.REPORT) {
      // Get the attachment
      attachment = await this.getSurveyReportAttachmentById(surveyId, attachmentId);

      // Delete the publish record, authors, and attachment
      await historyPublishService.deleteSurveyReportAttachmentPublishRecord(attachmentId);
      await this.deleteSurveyReportAttachmentAuthors(attachmentId);
      await this._deleteSurveyReportAttachmentRecord(attachmentId);
    } else {
      // Get the attachment
      attachment = await this.getSurveyAttachmentById(surveyId, attachmentId);

      // Delete the publish record and attachment
      await historyPublishService.deleteSurveyAttachmentPublishRecord(attachmentId);
      await this._deleteSurveyAttachmentRecord(attachmentId);
    }

    // Delete the attachment from S3
    await deleteFileFromS3(attachment.key);
  }

  /**
   * Update survey telemetry credential attachment record.
   *
   * @param {number} surveyId
   * @param {string} fileName
   * @param {IValidationData} fileData
   * @return {*}  {Promise<{ survey_telemetry_credential_attachment_id: number }>}
   * @memberof AttachmentService
   */
  async updateSurveyTelemetryCredentialAttachment(
    surveyId: number,
    fileName: string,
    fileData: IValidationData
  ): Promise<{ survey_telemetry_credential_attachment_id: number }> {
    return this.attachmentRepository.updateSurveyTelemetryCredentialAttachment(surveyId, fileName, fileData);
  }

  /**
   * Insert survey telemetry credential attachment record.
   *
   * @async
   * @param {IDeviceKeyData} deviceKeyData
   * @returns {Promise<IResponseTelemetryCredentialAttachment>}
   */
  async insertSurveyTelemetryCredentialAttachment(
    deviceKeyData: IDeviceKeyData
  ): Promise<IResponseTelemetryCredentialAttachment> {
    // Initialize empty response json object
    const responseJSON: IResponseTelemetryCredentialAttachment = {
      survey_telemetry_vendor_credential_id: [],
      telemetry_credential_lotek_id: [],
      telemetry_credential_vectronic_id: []
    };

    responseJSON.survey_telemetry_credential_attachment_id =
      await this.attachmentRepository.insertSurveyTelemetryCredentialAttachment(deviceKeyData);

    const vendor =
      TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG === deviceKeyData.fileData.type
        ? TelemetryVendorEnum.LOTEK
        : TelemetryVendorEnum.VECTRONIC;
    if (!deviceKeyData.fileData.keyData) {
      return responseJSON;
    }

    for (const keyFile of deviceKeyData.fileData.keyData) {
      if (!keyFile.keysData) {
        continue;
      }

      for (const key of keyFile.keysData) {
        // Generate SIMS device_key
        const serial = key.id;
        const deviceKey = getTelemetryDeviceKey({ vendor, serial });

        // populate device key vendor table
        responseJSON.survey_telemetry_vendor_credential_id?.push(
          await this.telemetryVendorRepository.insertTelemetryCredentialAttachmentVendor(
            deviceKeyData.surveyId,
            deviceKey,
            responseJSON.survey_telemetry_credential_attachment_id
          )
        );

        // the data is for lotek cfg
        if ('Iridium IMEI' in key) {
          responseJSON.telemetry_credential_lotek_id?.push(
            await this.telemetryLotekRepository.insertTelemetryCredentialLotek(key)
          );
        }

        // the data is for vectronic keyx
        if ('comID' in key && 'comType' in key && 'collarType' in key) {
          responseJSON.telemetry_credential_vectronic_id?.push(
            await this.telemetryVectronicRepository.insertTelemetryCredentialVectronic(key)
          );
        }
      }
    }

    return responseJSON;
  }

  /**
   * Get Survey Telemetry Attachment By File Name
   *
   * @param {string} fileName
   * @param {number} surveyId
   * @return {*}  {Promise<QueryResult>}
   * @memberof AttachmentService
   */
  async getSurveyTelemetryCredentialAttachmentByFileName(fileName: string, surveyId: number): Promise<QueryResult> {
    return this.attachmentRepository.getSurveyTelemetryCredentialAttachmentByFileName(fileName, surveyId);
  }

  /**
   * Upsert survey telemetry credential attachment record.
   *
   * @param {Express.Multer.File} file
   
   * @param {number} surveyId
   * @param {string} attachmentType
   * @return {*}  {Promise<IResponseTelemetryCredentialAttachment>}
   * @memberof AttachmentService
   */
  async upsertSurveyTelemetryCredentialAttachment(
    file: Express.Multer.File,

    surveyId: number,
    attachmentData: IValidationData
  ): Promise<IResponseTelemetryCredentialAttachment> {
    const key = generateS3FileKey({
      surveyId: surveyId,
      fileName: file.originalname,
      folder: 'telemetry-credentials'
    });

    const getResponse = await this.getSurveyTelemetryCredentialAttachmentByFileName(file.originalname, surveyId);
    if (getResponse && getResponse.rowCount) {
      // Existing attachment with matching name found, throw error
      throw new HTTP400('Device key file already exists.');
    }

    const attachmentResult = await this.insertSurveyTelemetryCredentialAttachment({
      fileName: file.originalname,
      fileSize: file.size,
      fileData: attachmentData,
      surveyId: surveyId,
      key: key
    });

    return { ...attachmentResult, key };
  }

  /**
   * Get Survey telemetry credential attachment S3 Key
   *
   * @param {number} surveyId
   * @param {number} attachmentId
   * @return {*}  {Promise<string>}
   * @memberof AttachmentService
   */
  async getSurveyTelemetryCredentialAttachmentS3Key(surveyId: number, attachmentId: number): Promise<string> {
    return this.attachmentRepository.getSurveyTelemetryCredentialAttachmentS3Key(surveyId, attachmentId);
  }
}
