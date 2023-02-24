import { QueryResult } from 'pg';
import { IDBConnection } from '../database/db';
import { PostReportAttachmentMetadata, PutReportAttachmentMetadata } from '../models/project-survey-attachments';
import {
  AttachmentRepository,
  IProjectAttachment,
  IProjectReportAttachment,
  IReportAttachmentAuthor,
  ISurveyAttachment,
  ISurveyReportAttachment
} from '../repositories/attachment-repository';
import { generateS3FileKey } from '../utils/file-utils';
import { DBService } from './db-service';

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
   * @return {Promise<IReportAttachmentAuthor[]>} Promise resolving all of the report authors
   * @memberof AttachmentService
   */
  async getProjectReportAttachmentAuthors(reportAttachmentId: number): Promise<IReportAttachmentAuthor[]> {
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
   * Finds all of the survey report attachments for the given survey ID.
   * @param {number} surveyId the ID of the survey
   * @return {Promise<ISurveyReportAttachment[]>} Promise resolving all survey report attachments.
   * @memberof AttachmentService
   */
  async getSurveyReportAttachments(surveyId: number): Promise<ISurveyReportAttachment[]> {
    return this.attachmentRepository.getSurveyReportAttachments(surveyId);
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
   * @return {Promise<IReportAttachmentAuthor[]>} Promise resolving all of the report authors
   * @memberof AttachmentService
   */
  async getSurveyAttachmentAuthors(reportAttachmentId: number): Promise<IReportAttachmentAuthor[]> {
    return this.attachmentRepository.getSurveyReportAttachmentAuthors(reportAttachmentId);
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
  ): Promise<{ id: number; revision_count: number }> {
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
  ): Promise<{ id: number; revision_count: number }> {
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
  ): Promise<{ id: number; revision_count: number; key: string }> {
    const key = generateS3FileKey({ projectId: projectId, fileName: file.originalname });

    const getResponse = await this.getProjectAttachmentByFileName(file.originalname, projectId);

    let attachmentResult: { id: number; revision_count: number };

    if (getResponse && getResponse.rowCount > 0) {
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
  ): Promise<{ id: number; revision_count: number }> {
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
  ): Promise<{ id: number; revision_count: number }> {
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
  ): Promise<{ id: number; revision_count: number; key: string }> {
    const key = generateS3FileKey({ projectId: projectId, fileName: file.originalname, folder: 'reports' });

    const getResponse = await this.getProjectReportAttachmentByFileName(projectId, file.originalname);

    let metadata: any;
    let attachmentResult: { id: number; revision_count: number };

    if (getResponse && getResponse.rowCount > 0) {
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
    await this.deleteProjectReportAttachmentAuthors(attachmentResult.id);

    const promises = [];

    // Insert any new attachment author records
    promises.push(
      metadata.authors.map((author: IReportAttachmentAuthor) =>
        this.insertProjectReportAttachmentAuthor(attachmentResult.id, author)
      )
    );
    await Promise.all(promises);

    return { ...attachmentResult, key };
  }

  async getProjectAttachmentS3Key(projectId: number, attachmentId: number): Promise<string> {
    return this.attachmentRepository.getProjectAttachmentS3Key(projectId, attachmentId);
  }

  async getProjectReportAttachmentS3Key(projectId: number, attachmentId: number): Promise<string> {
    return this.attachmentRepository.getProjectReportAttachmentS3Key(projectId, attachmentId);
  }

  async updateProjectReportAttachmentMetadata(
    projectId: number,
    attachmentId: number,
    metadata: PutReportAttachmentMetadata
  ): Promise<void> {
    return this.attachmentRepository.updateProjectReportAttachmentMetadata(projectId, attachmentId, metadata);
  }

  async deleteProjectAttachment(attachmentId: number): Promise<{ key: string }> {
    return this.attachmentRepository.deleteProjectAttachment(attachmentId);
  }

  async deleteProjectReportAttachment(attachmentId: number): Promise<{ key: string }> {
    return this.attachmentRepository.deleteProjectReportAttachment(attachmentId);
  }

  async insertSurveyReportAttachment(
    fileName: string,
    fileSize: number,
    surveyId: number,
    attachmentMeta: PostReportAttachmentMetadata,
    key: string
  ): Promise<{ id: number; revision_count: number }> {
    return this.attachmentRepository.insertSurveyReportAttachment(fileName, fileSize, surveyId, attachmentMeta, key);
  }

  async updateSurveyReportAttachment(
    fileName: string,
    surveyId: number,
    attachmentMeta: PutReportAttachmentMetadata
  ): Promise<{ id: number; revision_count: number }> {
    return this.attachmentRepository.updateSurveyReportAttachment(fileName, surveyId, attachmentMeta);
  }

  async deleteSurveyReportAttachmentAuthors(attachmentId: number): Promise<void> {
    return this.attachmentRepository.deleteSurveyReportAttachmentAuthors(attachmentId);
  }

  async insertSurveyReportAttachmentAuthor(
    attachmentId: number,
    author: { first_name: string; last_name: string }
  ): Promise<void> {
    return this.attachmentRepository.insertSurveyReportAttachmentAuthor(attachmentId, author);
  }

  async getSurveyReportAttachmentByFileName(surveyId: number, fileName: string): Promise<QueryResult> {
    return this.attachmentRepository.getSurveyReportAttachmentByFileName(surveyId, fileName);
  }

  async upsertSurveyReportAttachment(
    file: Express.Multer.File,
    projectId: number,
    surveyId: number,
    attachmentMeta: any
  ): Promise<{ id: number; revision_count: number; key: string }> {
    const key = generateS3FileKey({
      projectId: projectId,
      surveyId: surveyId,
      fileName: file.originalname,
      folder: 'reports'
    });

    const getResponse = await this.getSurveyReportAttachmentByFileName(surveyId, file.originalname);

    let metadata;
    let attachmentResult: { id: number; revision_count: number };

    if (getResponse && getResponse.rowCount > 0) {
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
    await this.deleteSurveyReportAttachmentAuthors(attachmentResult.id);

    const promises = [];

    // Insert any new attachment author records
    promises.push(
      metadata.authors.map((author) => this.insertSurveyReportAttachmentAuthor(attachmentResult.id, author))
    );

    await Promise.all(promises);

    return { ...attachmentResult, key };
  }

  async deleteSurveyReportAttachment(attachmentId: number): Promise<{ key: string }> {
    return this.attachmentRepository.deleteSurveyReportAttachment(attachmentId);
  }

  async deleteSurveyAttachment(attachmentId: number): Promise<{ key: string }> {
    return this.attachmentRepository.deleteSurveyAttachment(attachmentId);
  }

  async getSurveyAttachmentS3Key(surveyId: number, attachmentId: number): Promise<string> {
    return this.attachmentRepository.getSurveyAttachmentS3Key(surveyId, attachmentId);
  }

  async getSurveyReportAttachmentS3Key(surveyId: number, attachmentId: number): Promise<string> {
    return this.attachmentRepository.getSurveyReportAttachmentS3Key(surveyId, attachmentId);
  }

  async updateSurveyReportAttachmentMetadata(
    surveyId: number,
    attachmentId: number,
    metadata: PutReportAttachmentMetadata
  ): Promise<void> {
    return this.attachmentRepository.updateSurveyReportAttachmentMetadata(surveyId, attachmentId, metadata);
  }

  async updateSurveyAttachment(
    surveyId: number,
    fileName: string,
    fileType: string
  ): Promise<{ id: number; revision_count: number }> {
    return this.attachmentRepository.updateSurveyAttachment(surveyId, fileName, fileType);
  }

  async insertSurveyAttachment(
    fileName: string,
    fileSize: number,
    fileType: string,
    surveyId: number,
    key: string
  ): Promise<{ id: number; revision_count: number }> {
    return this.attachmentRepository.insertSurveyAttachment(fileName, fileSize, fileType, surveyId, key);
  }

  async getSurveyAttachmentByFileName(fileName: string, surveyId: number): Promise<QueryResult> {
    return this.attachmentRepository.getSurveyAttachmentByFileName(fileName, surveyId);
  }

  async upsertSurveyAttachment(
    file: Express.Multer.File,
    projectId: number,
    surveyId: number,
    attachmentType: string
  ): Promise<{ id: number; revision_count: number; key: string }> {
    const key = generateS3FileKey({
      projectId: projectId,
      surveyId: surveyId,
      fileName: file.originalname,
      folder: 'reports'
    });

    const getResponse = await this.getSurveyReportAttachmentByFileName(surveyId, file.originalname);

    let attachmentResult: { id: number; revision_count: number };

    if (getResponse && getResponse.rowCount > 0) {
      // Existing attachment with matching name found, update it
      attachmentResult = await this.updateSurveyAttachment(surveyId, file.originalname, attachmentType);
    } else {
      // No matching attachment found, insert new attachment
      attachmentResult = await this.insertSurveyAttachment(file.originalname, file.size, attachmentType, surveyId, key);
    }

    return { ...attachmentResult, key };
  }
}
