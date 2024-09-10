import { QueryResult } from 'pg';
import { ATTACHMENT_TYPE } from '../constants/attachments';
import { IDBConnection } from '../database/db';
import {
  GetAttachmentsWithSupplementalData,
  IReportAttachmentAuthor,
  PostReportAttachmentMetadata,
  PutReportAttachmentMetadata
} from '../models/project-survey-attachments';
import {
  AttachmentRepository,
  CritterCaptureAttachmentPayload,
  CritterMortalityAttachmentPayload,
  IProjectAttachment,
  IProjectReportAttachment,
  IProjectReportAttachmentAuthor,
  ISurveyAttachment,
  ISurveyReportAttachment,
  ISurveyReportAttachmentAuthor,
  SurveyTelemetryCredentialAttachment
} from '../repositories/attachment-repository';
import { deleteFileFromS3, generateS3FileKey } from '../utils/file-utils';
import { DBService } from './db-service';
import { HistoryPublishService } from './history-publish-service';

export interface IAttachmentType {
  id: number;
  type: 'Report' | 'Other';
}

/**
 * A repository class for accessing project and survey attachment data.
 *
 * @export
 * @class AttachmentRepository
 * @extends {BaseRepository}
 */
export class AttachmentService extends DBService {
  attachmentRepository: AttachmentRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.attachmentRepository = new AttachmentRepository(connection);
  }

  /**
   * Finds all of the project attachments for the given project ID.
   * @param {number} projectId the ID of the project
   * @return {Promise<IProjectAttachment[]>} Promise resolving all project attachments.
   * @memberof AttachmentService
   */
  async getProjectAttachments(projectId: number): Promise<IProjectAttachment[]> {
    return this.attachmentRepository.getProjectAttachments(projectId);
  }

  /**
   * Finds a project attachment having the given project ID and attachment ID
   * @param {number} projectId the ID of the project
   * @param {number} attachmentId the ID of the attachment
   * @return {Promise<IProjectAttachment>} Promise resolving the given project attachment
   * @memberof AttachmentService
   */
  async getProjectAttachmentById(projectId: number, attachmentId: number): Promise<IProjectAttachment> {
    return this.attachmentRepository.getProjectAttachmentById(projectId, attachmentId);
  }

  /**
   * Finds an array of project attachments having the given project ID and attachment IDs
   * @param {number} projectId the ID of the project
   * @param {number[]} attachmentIds the IDs of the attachments
   * @return {Promise<IProjectAttachment[]>} The given project attachments
   * @memberof AttachmentService
   */
  async getProjectAttachmentsByIds(projectId: number, attachmentIds: number[]): Promise<IProjectAttachment[]> {
    return this.attachmentRepository.getProjectAttachmentsByIds(projectId, attachmentIds);
  }

  /**
   * Finds all authors belonging to the given project report attachment
   * @param {number} reportAttachmentId the ID of the report attachment
   * @return {Promise<IProjectReportAttachmentAuthor[]>} Promise resolving all of the report authors
   * @memberof AttachmentService
   */
  async getProjectReportAttachmentAuthors(reportAttachmentId: number): Promise<IProjectReportAttachmentAuthor[]> {
    return this.attachmentRepository.getProjectReportAttachmentAuthors(reportAttachmentId);
  }

  /**
   * Finds all of the project report attachments for the given project ID.
   * @param {number} projectId the ID of the project
   * @return {Promise<IProjectReportAttachment[]>} Promise resolving all project report attachments.
   * @memberof AttachmentService
   */
  async getProjectReportAttachments(projectId: number): Promise<IProjectReportAttachment[]> {
    return this.attachmentRepository.getProjectReportAttachments(projectId);
  }

  /**
   * Finds a project report attachment having the given project ID and report attachment ID
   * @param {number} projectId the ID of the project
   * @param {number} reportAttachmentId the ID of the report attachment
   * @return {Promise<IProjectReportAttachment>} Promise resolving the given project report attachment
   * @memberof AttachmentService
   */
  async getProjectReportAttachmentById(
    projectId: number,
    reportAttachmentId: number
  ): Promise<IProjectReportAttachment> {
    return this.attachmentRepository.getProjectReportAttachmentById(projectId, reportAttachmentId);
  }

  /**
   * Finds project report attachments having the given project ID and report attachment IDs
   * @param {number} projectId the ID of the project
   * @param {number[]} reportAttachmentIds the IDs of the report attachments
   * @return {Promise<IProjectReportAttachment[]>} The given project report attachments
   * @memberof AttachmentService
   */
  async getProjectReportAttachmentsByIds(
    projectId: number,
    reportAttachmentIds: number[]
  ): Promise<IProjectReportAttachment[]> {
    return this.attachmentRepository.getProjectReportAttachmentsByIds(projectId, reportAttachmentIds);
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
   *Insert Project Attachment
   *
   * @param {Express.Multer.File} file
   * @param {number} projectId
   * @param {string} attachmentType
   * @param {string} key
   * @return {*}  {Promise<{ id: number; revision_count: number }>}
   * @memberof AttachmentService
   */
  async insertProjectAttachment(
    file: Express.Multer.File,
    projectId: number,
    attachmentType: string,
    key: string
  ): Promise<{ project_attachment_id: number; revision_count: number }> {
    return this.attachmentRepository.insertProjectAttachment(file, projectId, attachmentType, key);
  }

  /**
   * Update Project Attachment
   *
   * @param {string} fileName
   * @param {number} projectId
   * @param {string} attachmentType
   * @return {*}  {Promise<{ id: number; revision_count: number }>}
   * @memberof AttachmentService
   */
  async updateProjectAttachment(
    fileName: string,
    projectId: number,
    attachmentType: string
  ): Promise<{ project_attachment_id: number; revision_count: number }> {
    return this.attachmentRepository.updateProjectAttachment(fileName, projectId, attachmentType);
  }

  /**
   * Get Project Attachment by filename
   *
   * @param {string} fileName
   * @param {number} projectId
   * @return {*}  {Promise<QueryResult>}
   * @memberof AttachmentService
   */
  async getProjectAttachmentByFileName(fileName: string, projectId: number): Promise<QueryResult> {
    return this.attachmentRepository.getProjectAttachmentByFileName(projectId, fileName);
  }

  /**
   * Update or Insert Project Attachment
   *
   * @param {Express.Multer.File} file
   * @param {number} projectId
   * @param {string} attachmentType
   * @return {*}  {Promise<{ id: number; revision_count: number; key: string }>}
   * @memberof AttachmentService
   */
  async upsertProjectAttachment(
    file: Express.Multer.File,
    projectId: number,
    attachmentType: string
  ): Promise<{ project_attachment_id: number; revision_count: number; key: string }> {
    const key = generateS3FileKey({ projectId: projectId, fileName: file.originalname });

    const getResponse = await this.getProjectAttachmentByFileName(file.originalname, projectId);

    let attachmentResult: { project_attachment_id: number; revision_count: number };

    if (getResponse && getResponse.rowCount) {
      // Existing attachment with matching name found, update it
      attachmentResult = await this.updateProjectAttachment(file.originalname, projectId, attachmentType);
    } else {
      // No matching attachment found, insert new attachment
      attachmentResult = await this.insertProjectAttachment(file, projectId, attachmentType, key);
    }

    return { ...attachmentResult, key };
  }

  /**
   * Insert Project Report Attachment
   *
   * @param {string} fileName
   * @param {string} fileSize
   * @param {number} projectId
   * @param {PostReportAttachmentMetadata} attachmentMeta
   * @param {string} key
   * @return {*}  {Promise<{ id: number; revision_count: number }>}
   * @memberof AttachmentService
   */
  async insertProjectReportAttachment(
    fileName: string,
    fileSize: number,
    projectId: number,
    attachmentMeta: PostReportAttachmentMetadata,
    key: string
  ): Promise<{ project_report_attachment_id: number; revision_count: number }> {
    return this.attachmentRepository.insertProjectReportAttachment(fileName, fileSize, projectId, attachmentMeta, key);
  }

  /**
   * Update Project Report Attachment
   *
   * @param {string} fileName
   * @param {number} projectId
   * @param {PutReportAttachmentMetadata} attachmentMeta
   * @return {*}  {Promise<{ id: number; revision_count: number }>}
   * @memberof AttachmentService
   */
  async updateProjectReportAttachment(
    fileName: string,
    projectId: number,
    attachmentMeta: PutReportAttachmentMetadata
  ): Promise<{ project_report_attachment_id: number; revision_count: number }> {
    return this.attachmentRepository.updateProjectReportAttachment(fileName, projectId, attachmentMeta);
  }

  /**
   * Delete Project Report Attachment Authors
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<QueryResult>}
   * @memberof AttachmentService
   */
  async deleteProjectReportAttachmentAuthors(attachmentId: number): Promise<QueryResult> {
    return this.attachmentRepository.deleteProjectReportAttachmentAuthors(attachmentId);
  }

  /**
   * Insert Project Report Attachment Author
   *
   * @param {number} attachmentId
   * @param {IReportAttachmentAuthor} author
   * @return {*}  {Promise<void>}
   * @memberof AttachmentService
   */
  async insertProjectReportAttachmentAuthor(
    attachmentId: number,
    author: { first_name: string; last_name: string }
  ): Promise<void> {
    return this.attachmentRepository.insertProjectReportAttachmentAuthor(attachmentId, author);
  }

  /**
   * Get Project Report Attachment by Filename
   *
   * @param {number} projectId
   * @param {string} fileName
   * @return {*}  {Promise<QueryResult>}
   * @memberof AttachmentService
   */
  async getProjectReportAttachmentByFileName(projectId: number, fileName: string): Promise<QueryResult> {
    return this.attachmentRepository.getProjectReportAttachmentByFileName(projectId, fileName);
  }

  async upsertProjectReportAttachment(
    file: Express.Multer.File,
    projectId: number,
    attachmentMeta: any
  ): Promise<{ project_report_attachment_id: number; revision_count: number; key: string }> {
    const key = generateS3FileKey({ projectId: projectId, fileName: file.originalname, folder: 'reports' });

    const getResponse = await this.getProjectReportAttachmentByFileName(projectId, file.originalname);

    let metadata: any;
    let attachmentResult: { project_report_attachment_id: number; revision_count: number };

    if (getResponse && getResponse.rowCount) {
      // Existing attachment with matching name found, update it
      metadata = new PutReportAttachmentMetadata(attachmentMeta);
      attachmentResult = await this.updateProjectReportAttachment(file.originalname, projectId, metadata);
    } else {
      // No matching attachment found, insert new attachment
      metadata = new PostReportAttachmentMetadata(attachmentMeta);
      attachmentResult = await this.insertProjectReportAttachment(
        file.originalname,
        file.size,
        projectId,
        metadata,
        key
      );
    }

    // Delete any existing attachment author records
    await this.deleteProjectReportAttachmentAuthors(attachmentResult.project_report_attachment_id);

    const promises = [];

    // Insert any new attachment author records
    promises.push(
      metadata.authors.map((author: IReportAttachmentAuthor) =>
        this.insertProjectReportAttachmentAuthor(attachmentResult.project_report_attachment_id, author)
      )
    );
    await Promise.all(promises);

    return { ...attachmentResult, key };
  }

  /**
   * Get Project Attachment S3 Key
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @return {*}  {Promise<string>}
   * @memberof AttachmentService
   */
  async getProjectAttachmentS3Key(projectId: number, attachmentId: number): Promise<string> {
    return this.attachmentRepository.getProjectAttachmentS3Key(projectId, attachmentId);
  }

  /**
   * Get Project Report Attachment S3 Key
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @return {*}  {Promise<string>}
   * @memberof AttachmentService
   */
  async getProjectReportAttachmentS3Key(projectId: number, attachmentId: number): Promise<string> {
    return this.attachmentRepository.getProjectReportAttachmentS3Key(projectId, attachmentId);
  }

  /**
   * Update Project Report Attachment Metadata
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @param {PutReportAttachmentMetadata} metadata
   * @return {*}  {Promise<void>}
   * @memberof AttachmentService
   */
  async updateProjectReportAttachmentMetadata(
    projectId: number,
    attachmentId: number,
    metadata: PutReportAttachmentMetadata
  ): Promise<void> {
    return this.attachmentRepository.updateProjectReportAttachmentMetadata(projectId, attachmentId, metadata);
  }

  /**
   * Delete Project Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<{ key: string }>}
   * @memberof AttachmentService
   */
  async _deleteProjectAttachmentRecord(attachmentId: number): Promise<{ key: string; uuid: string }> {
    return this.attachmentRepository.deleteProjectAttachmentRecord(attachmentId);
  }

  /**
   * Delete Project Report Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<{ key: string; uuid: string }>}
   * @memberof AttachmentService
   */
  async _deleteProjectReportAttachmentRecord(attachmentId: number): Promise<{ key: string; uuid: string }> {
    return this.attachmentRepository.deleteProjectReportAttachmentRecord(attachmentId);
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
   * @param {number} projectId
   * @param {number} surveyId
   * @param {*} attachmentMeta
   * @return {*}  {Promise<{ survey_report_attachment_id: number; revision_count: number; key: string }>}
   * @memberof AttachmentService
   */
  async upsertSurveyReportAttachment(
    file: Express.Multer.File,
    projectId: number,
    surveyId: number,
    attachmentMeta: any
  ): Promise<{ survey_report_attachment_id: number; revision_count: number; key: string }> {
    const key = generateS3FileKey({
      projectId: projectId,
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
   * @param {number} projectId
   * @param {number} surveyId
   * @param {string} attachmentType
   * @return {*}  {Promise<{ survey_attachment_id: number; revision_count: number; key: string }>}
   * @memberof AttachmentService
   */
  async upsertSurveyAttachment(
    file: Express.Multer.File,
    projectId: number,
    surveyId: number,
    attachmentType: string
  ): Promise<{ survey_attachment_id: number; revision_count: number; key: string }> {
    const key = generateS3FileKey({
      projectId: projectId,
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
   * Handle deletion of Project Attachment.
   *
   * If (attachmentType = report):
   * - delete authors
   * - delete attachment
   * Else (attachmentType = attachment):
   * - delete attachment
   *
   * If attachment was published and user is admin:
   * - delete from Platform
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @param {string} attachmentType
   * @return {*}  {Promise<void>}
   * @memberof AttachmentService
   */
  async deleteProjectAttachment(projectId: number, attachmentId: number, attachmentType: string): Promise<void> {
    let attachment: IProjectAttachment | IProjectReportAttachment | null;

    if (attachmentType === ATTACHMENT_TYPE.REPORT) {
      // Get the attachment
      attachment = await this.getProjectReportAttachmentById(projectId, attachmentId);

      // Delete the authors, and attachment
      await this.deleteProjectReportAttachmentAuthors(attachmentId);
      await this._deleteProjectReportAttachmentRecord(attachmentId);
    } else {
      // Get the attachment
      attachment = await this.getProjectAttachmentById(projectId, attachmentId);

      // Delete the attachment
      await this._deleteProjectAttachmentRecord(attachmentId);
    }

    // Delete the attachment from S3
    await deleteFileFromS3(attachment.key);
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
   * @param {string} fileType
   * @return {*}  {Promise<{ survey_telemetry_credential_attachment_id: number }>}
   * @memberof AttachmentService
   */
  async updateSurveyTelemetryCredentialAttachment(
    surveyId: number,
    fileName: string,
    fileType: string
  ): Promise<{ survey_telemetry_credential_attachment_id: number }> {
    return this.attachmentRepository.updateSurveyTelemetryCredentialAttachment(surveyId, fileName, fileType);
  }

  /**
   * Insert survey telemetry credential attachment record.
   *
   * @param {string} fileName
   * @param {number} fileSize
   * @param {string} fileType
   * @param {number} surveyId
   * @param {string} key
   * @return {*}  {Promise<{ survey_telemetry_credential_attachment_id: number }>}
   * @memberof AttachmentService
   */
  async insertSurveyTelemetryCredentialAttachment(
    fileName: string,
    fileSize: number,
    fileType: string,
    surveyId: number,
    key: string
  ): Promise<{ survey_telemetry_credential_attachment_id: number }> {
    return this.attachmentRepository.insertSurveyTelemetryCredentialAttachment(
      fileName,
      fileSize,
      fileType,
      surveyId,
      key
    );
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
   * @param {number} projectId
   * @param {number} surveyId
   * @param {string} attachmentType
   * @return {*}  {Promise<{ survey_telemetry_credential_attachment_id: number; key: string }>}
   * @memberof AttachmentService
   */
  async upsertSurveyTelemetryCredentialAttachment(
    file: Express.Multer.File,
    projectId: number,
    surveyId: number,
    attachmentType: string
  ): Promise<{ survey_telemetry_credential_attachment_id: number; key: string }> {
    const key = generateS3FileKey({
      projectId: projectId,
      surveyId: surveyId,
      fileName: file.originalname,
      folder: 'telemetry-credentials'
    });

    const getResponse = await this.getSurveyTelemetryCredentialAttachmentByFileName(file.originalname, surveyId);

    let attachmentResult: { survey_telemetry_credential_attachment_id: number };

    if (getResponse && getResponse.rowCount) {
      // Existing attachment with matching name found, update it
      attachmentResult = await this.updateSurveyTelemetryCredentialAttachment(
        surveyId,
        file.originalname,
        attachmentType
      );
    } else {
      // No matching attachment found, insert new attachment
      attachmentResult = await this.insertSurveyTelemetryCredentialAttachment(
        file.originalname,
        file.size,
        attachmentType,
        surveyId,
        key
      );
    }

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

  /**
   * Insert Critter Capture Attachment.
   *
   * @param {CritterCaptureAttachmentPayload} payload
   * @return {*} {Promise<{critter_capture_attachment_id: number}>}
   */
  async insertCritterCaptureAttachment(payload: CritterCaptureAttachmentPayload) {
    return this.attachmentRepository.insertCritterCaptureAttachment(payload);
  }

  /**
   * Insert Critter Mortality Attachment.
   *
   * @param {CritterMortalityAttachmentPayload} payload
   * @return {*} {Promise<{critter_mortality_attachment_id: number}>}
   */
  async insertCritterMortalityAttachment(payload: CritterMortalityAttachmentPayload) {
    return this.attachmentRepository.insertCritterMortalityAttachment(payload);
  }
}
