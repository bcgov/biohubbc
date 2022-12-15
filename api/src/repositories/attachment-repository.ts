import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

export type ISurveyAttachment = IProjectAttachment;

export type ISurveyReportAttachment = IProjectReportAttachment;

export interface IProjectAttachment {
  id: number;
  file_name: string;
  file_type: string;
  create_user: number;
  create_date: string;
  update_date: string;
  file_size: string;
  key: string;
  security_token: string;
}

export interface IProjectReportAttachment {
  id: number;
  file_name: string;
  create_user: number;
  title: string;
  description: string;
  year_published: number;
  last_modified: string;
  create_date: string;
  key: string;
  file_size: string;
  security_token: string;
  revision_count: number;
}

export interface IReportAttachmentAuthor {
  project_report_author_id: number;
  project_report_attachment_id: number;
  first_name: string;
  last_name: string;
  update_date: string;
  revision_count: number;
}

const defaultLog = getLogger('repositories/attachment-repository');

/**
 * A repository class for accessing project and survey attachment data
 *
 * @export
 * @class AttachmentRepository
 * @extends {BaseRepository}
 */
export class AttachmentRepository extends BaseRepository {
  /**
   * SQL query to get report attachments for a single project.
   *
   * @param {number} projectId The project ID
   * @return {Promise<IProjectAttachment[]>} Promise resolving all project attachments
   * @memberof AttachmentRepository
   */
  async getProjectAttachments(projectId: number): Promise<IProjectAttachment[]> {
    defaultLog.debug({ label: 'getProjectAttachments' });

    const sqlStatement = SQL`
      SELECT
        project_attachment_id AS id,
        file_name,
        file_type,
        create_user,
        update_date,
        create_date,
        file_size,
        key,
        security_token,
      FROM
        project_attachment
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.sql<IProjectAttachment>(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to get project attachments by projectId', [
        'AttachmentRepository->getProjectAttachments',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Query to get a single project attachment by attachment ID/
   * @param {number} projectId The ID of the project
   * @param {number} attachmentId The ID of the attachment
   * @return {Promise<IProjectAttachment>} A promise resolving the project attachment having the
   * given ID.
   * @memberof AttachmentRepository
   */
  async getProjectAttachmentById(projectId: number, attachmentId: number): Promise<IProjectAttachment> {
    defaultLog.debug({ label: 'getProjectAttachmentById' });

    const sqlStatement = SQL`
      SELECT
        project_attachment_id AS id,
        file_name,
        file_type,
        create_user,
        update_date,
        create_date,
        file_size,
        key,
        security_token,
      FROM
        project_attachment
      WHERE
        project_attachment_id = ${attachmentId}
      AND
        project_id = ${projectId};
    `;

    const response = await this.connection.sql<IProjectAttachment>(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to get project attachment by attachmentId', [
        'AttachmentRepository->getProjectAttachmentById',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Query to return all project report attachments belonging to the given project.
   * @param {number} projectId the ID of the project
   * @return {Promise<IProjectReportAttachment[]>} Promise resolving all of the attachments for the
   * given project
   * @memberof AttachmentRepository
   */
  async getProjectReportAttachments(projectId: number): Promise<IProjectReportAttachment[]> {
    defaultLog.debug({ label: 'getProjectReportAttachments' });

    const sqlStatement = SQL`
      SELECT
        project_report_attachment_id as id,
        file_name,
        create_user,
        title,
        description,
        year::int as year_published,
        update_date::text as last_modified,
        create_date,
        file_size,
        key,
        security_token,
        revision_count
      FROM
        project_report_attachment
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.sql<IProjectReportAttachment>(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to get project report attachments by projectId', [
        'AttachmentRepository->getProjectReportAttachments',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Query to return the report attachment having the given ID and belonging to the given project.
   * @param {number} projectId the ID of the project
   * @param {number} reportAttachmentId the ID of the report attachment
   * @return {Promise<IProjectReportAttachment>} Promise resolving the report attachment
   * @memberof AttachmentRepository
   */
  async getProjectReportAttachmentById(
    projectId: number,
    reportAttachmentId: number
  ): Promise<IProjectReportAttachment> {
    defaultLog.debug({ label: 'getProjectReportAttachmentById' });

    const sqlStatement = SQL`
      SELECT
        project_report_attachment_id as id,
        file_name,
        title,
        description,
        year::int as year_published,
        update_date::text as last_modified,
        create_date,
        file_size,
        key,
        security_token,
        revision_count
      FROM
        project_report_attachment
      WHERE
        project_report_attachment_id = ${reportAttachmentId}
      AND
        project_id = ${projectId};
    `;

    const response = await this.connection.sql<IProjectReportAttachment>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get project report attachments by reportAttachmentId', [
        'AttachmentRepository->getProjectReportAttachmentById',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * SQL query to get survey attachments for a single project.
   *
   * @param {number} surveyId The survey ID
   * @return {Promise<IProjectAttachment[]>} Promise resolving all survey attachments
   * @memberof AttachmentRepository
   */
  async getSurveyAttachments(surveyId: number): Promise<ISurveyAttachment[]> {
    defaultLog.debug({ label: 'getSurveyAttachments' });

    const sqlStatement = SQL`
      SELECT
        survey_attachment_id as id,
        file_name,
        file_type,
        create_date,
        update_date,
        create_date,
        file_size,
        key,
        security_token,
      FROM
        survey_attachment
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql<ISurveyAttachment>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey attachments by surveyId', [
        'AttachmentRepository->getSurveyAttachments',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Query to return all survey report attachments belonging to the given survey.
   * @param {number} surveyId the ID of the survey
   * @return {Promise<ISurveyReportAttachment[]>} Promise resolving all of the attachments for the
   * given survey
   * @memberof AttachmentRepository
   */
  async getSurveyReportAttachments(surveyId: number): Promise<ISurveyReportAttachment[]> {
    defaultLog.debug({ label: 'getSurveyReportAttachments' });

    const sqlStatement = SQL`
      SELECT
        survey_report_attachment_id as id,
        file_name,
        create_user,
        title,
        description,
        year::int as year_published,
        update_date::text as last_modified,
        create_date,
        file_size,
        key,
        security_token,
        revision_count
      FROM
        survey_report_attachment
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql<ISurveyReportAttachment>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey report attachments by surveyId', [
        'AttachmentRepository->getSurveyReportAttachments',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Query to return the report attachment having the given ID and belonging to the given survey.
   * @param {number} surveyId the ID of the survey
   * @param {number} reportAttachmentId the ID of the report attachment
   * @return {Promise<IProjectReportAttachment>} Promise resolving the report attachment
   * @memberof AttachmentRepository
   */
  async getSurveyReportAttachmentById(surveyId: number, reportAttachmentId: number): Promise<ISurveyReportAttachment> {
    defaultLog.debug({ label: 'getSurveyReportAttachmentById' });

    const sqlStatement = SQL`
      SELECT
        survey_report_attachment_id as id,
        file_name,
        title,
        description,
        year::int as year_published,
        update_date::text as last_modified,
        create_date,
        file_size,
        key,
        security_token,
        revision_count
      FROM
        survey_report_attachment
      WHERE
        survey_report_attachment_id = ${reportAttachmentId}
      AND
        survey_id = ${surveyId}
      `;

    const response = await this.connection.sql<ISurveyReportAttachment>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey report attachments by reportAttachmentId', [
        'AttachmentRepository->getSurveyReportAttachmentById',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Query to return all of the authors belonging to a project report attachment
   * @param {number} reportAttachmentId The ID of the report attachment
   * @return {Promise<IReportAttachmentAuthor[]>} Promise resolving the report authors
   * @memberof AttachmentRepository
   */
  async getProjectReportAttachmentAuthors(reportAttachmentId: number): Promise<IReportAttachmentAuthor[]> {
    defaultLog.debug({ label: 'getProjectAttachmentAuthors' });

    const sqlStatement = SQL`
      SELECT
        project_report_author.*
      FROM
        project_report_author
      WHERE
        project_report_attachment_id = ${reportAttachmentId}
      `;

    const response = await this.connection.sql<IReportAttachmentAuthor>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get project report attachment authors by reportAttachmentId', [
        'AttachmentRepository->getProjectAttachmentAuthors',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Query to return all of the authors belonging to a survey report attachment
   * @param {number} reportAttachmentId The ID of the report attachment
   * @return {Promise<IReportAttachmentAuthor[]>} Promise resolving the report authors
   * @memberof AttachmentRepository
   */
  async getSurveyReportAttachmentAuthors(reportAttachmentId: number): Promise<IReportAttachmentAuthor[]> {
    defaultLog.debug({ label: 'getSurveyAttachmentAuthors' });

    const sqlStatement = SQL`
      SELECT
        survey_report_author.*
      FROM
        survey_report_author
      WHERE
        survey_report_attachment_id = ${reportAttachmentId};
      `;

    const response = await this.connection.sql<IReportAttachmentAuthor>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey report attachment authors by reportAttachmentId', [
        'AttachmentRepository->getSurveyAttachmentAuthors',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }
}
