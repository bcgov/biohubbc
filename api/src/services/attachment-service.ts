import { IDBConnection } from '../database/db';
import {
  AttachmentRepository,
  IProjectAttachment,
  IProjectReportAttachment,
  IReportAttachmentAuthor,
  ISurveyAttachment,
  ISurveyReportAttachment,
} from '../repositories/attachment-repository';
import { DBService } from './db-service';

export interface IAttachmentType {
  id: number;
  type: 'Report' | 'Other';
}

/**
 * A repository class for accessing project and survey attachment data and
 * enumerating attachment security rules.
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
   * Finds all of the survey attachments for the given survey ID.
   * @param {number} surveyId the ID of the survey
   * @return {Promise<ISurveyAttachment[]>} Promise resolving all survey attachments.
   * @memberof AttachmentService
   */
  async getSurveyAttachments(surveyId: number): Promise<ISurveyAttachment[]> {
    return this.attachmentRepository.getSurveyAttachments(surveyId);
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
   * @return {Promise<ISurveyAttachment>} Promise resolving the given survey attachment
   * @memberof AttachmentService
   */
  async getSurveyReportAttachmentById(surveyId: number, reportAttachmentId: number): Promise<ISurveyReportAttachment> {
    return this.attachmentRepository.getSurveyReportAttachmentById(surveyId, reportAttachmentId);
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
}
