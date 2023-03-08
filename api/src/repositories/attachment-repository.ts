import { QueryResult } from 'pg';
import SQL from 'sql-template-strings';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { PostReportAttachmentMetadata, PutReportAttachmentMetadata } from '../models/project-survey-attachments';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

export type IAttachment = ISurveyAttachment | ISurveyReportAttachment | IProjectAttachment | IProjectReportAttachment;

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
  uuid: string;
  title: string | null;
  description: string | null;
  key: string;
  revision_count: number;
}

export interface IProjectReportAttachment {
  id: number;
  uuid: string;
  file_name: string;
  create_user: number;
  title: string;
  description: string;
  year_published: number;
  last_modified: string;
  key: string;
  file_size: string;
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
        uuid,
        file_name,
        file_type,
        title,
        description,
        create_user,
        update_date,
        create_date,
        file_size,
        key
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
        uuid,
        file_name,
        file_type,
        title,
        description,
        create_user,
        update_date,
        create_date,
        file_size,
        key
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
   * Query to get all project attachment by the given attachment IDs
   * @param {number} projectId The ID of the project
   * @param {number[]} attachmentIds The ID of the attachment
   * @return {Promise<IProjectAttachment[]>} The project attachment having the given IDs.
   * @memberof AttachmentRepository
   */
  async getProjectAttachmentsByIds(projectId: number, attachmentIds: number[]): Promise<IProjectAttachment[]> {
    defaultLog.debug({ label: 'getProjectAttachmentsByIds' });

    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .select([
        'project_attachment_id AS id',
        'uuid',
        'file_name',
        'file_type',
        'title',
        'description',
        'create_user',
        'update_date',
        'create_date',
        'file_size',
        'key'
      ])
      .from('project_attachment')
      .whereIn('project_attachment_id', attachmentIds)
      .andWhere('project_id', projectId);

    const response = await this.connection.knex<IProjectAttachment>(queryBuilder);

    return response.rows;
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
        uuid,
        file_name,
        create_user,
        title,
        description,
        year::int as year_published,
        CASE
          WHEN update_date IS NULL
          THEN create_date::text
          ELSE update_date::text
        END AS last_modified,
        file_size,
        key,
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
        uuid,
        file_name,
        title,
        description,
        year::int as year_published,
        CASE
          WHEN update_date IS NULL
          THEN create_date::text
          ELSE update_date::text
        END AS last_modified,
        file_size,
        key,
        revision_count
      FROM
        project_report_attachment
      WHERE
        project_report_attachment_id = ${reportAttachmentId}
      AND
        project_id = ${projectId};
    `;

    const response = await this.connection.sql<IProjectReportAttachment>(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to get project report attachments by reportAttachmentId', [
        'AttachmentRepository->getProjectReportAttachmentById',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Query to return the report attachments having the given IDs and belonging to the given project.
   * @param {number} projectId the ID of the project
   * @param {number[]} reportAttachmentIds the IDs of the report attachments
   * @return {Promise<IProjectReportAttachment[]>} Promise resolving the report attachment
   * @memberof AttachmentRepository
   */
  async getProjectReportAttachmentsByIds(
    projectId: number,
    reportAttachmentIds: number[]
  ): Promise<IProjectReportAttachment[]> {
    defaultLog.debug({ label: 'getProjectReportAttachmentsByIds' });

    const knex = getKnex();
    const queryBuilder = knex
      .queryBuilder()
      .select([
        'project_report_attachment_id as id',
        'uuid',
        'file_name',
        'title',
        'description',
        knex.raw('year::int as year_published'),
        knex.raw(`
          CASE
            WHEN update_date IS NULL
            THEN create_date::text
            ELSE update_date::text
          END AS last_modified
        `),
        'file_size',
        'key',
        'revision_count'
      ])
      .from('project_report_attachment')
      .whereIn('project_report_attachment_id', reportAttachmentIds)
      .andWhere('project_id', projectId);

    const response = await this.connection.knex<IProjectReportAttachment>(queryBuilder);

    return response.rows;
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
        uuid,
        file_name,
        file_type,
        title,
        description,
        create_date,
        update_date,
        create_date,
        file_size,
        key
      FROM
        survey_attachment
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql<ISurveyAttachment>(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey attachments by surveyId', [
        'AttachmentRepository->getSurveyAttachments',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * SQL query to get all survey attachments for a single project with the given surveyAttachmentIds
   *
   * @param {number} surveyId The survey ID
   * @param {number[]} attachmentIds The IDs of the survey attachments
   * @return {Promise<IProjectAttachment[]>} All survey attachments having the given IDs
   * @memberof AttachmentRepository
   */
  async getSurveyAttachmentsByIds(surveyId: number, attachmentIds: number[]): Promise<ISurveyAttachment[]> {
    defaultLog.debug({ label: 'getSurveyAttachmentsByIds' });

    const knex = getKnex();
    const queryBuilder = knex
      .queryBuilder()
      .select([
        'survey_attachment_id as id',
        'uuid',
        'file_name',
        'file_type',
        'title',
        'description',
        'create_date',
        'update_date',
        'create_date',
        'file_size',
        'key'
      ])
      .from('survey_attachment')
      .whereIn('survey_attachment_id', attachmentIds)
      .andWhere('survey_id', surveyId);

    const response = await this.connection.knex<ISurveyAttachment>(queryBuilder);

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
        uuid,
        file_name,
        create_user,
        title,
        description,
        year::int as year_published,
        CASE
          WHEN update_date IS NULL
          THEN create_date::text
          ELSE update_date::text
        END AS last_modified,
        file_size,
        key,
        revision_count
      FROM
        survey_report_attachment
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql<ISurveyReportAttachment>(sqlStatement);

    if (!response.rows) {
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
   * @return {Promise<ISurveyReportAttachment>} Promise resolving the report attachment
   * @memberof AttachmentRepository
   */
  async getSurveyReportAttachmentById(surveyId: number, reportAttachmentId: number): Promise<ISurveyReportAttachment> {
    defaultLog.debug({ label: 'getSurveyReportAttachmentById' });

    const sqlStatement = SQL`
      SELECT
        survey_report_attachment_id as id,
        uuid,
        file_name,
        title,
        description,
        year::int as year_published,
        CASE
          WHEN update_date IS NULL
          THEN create_date::text
          ELSE update_date::text
        END AS last_modified,
        file_size,
        key,
        revision_count
      FROM
        survey_report_attachment
      WHERE
        survey_report_attachment_id = ${reportAttachmentId}
      AND
        survey_id = ${surveyId}
      `;

    const response = await this.connection.sql<ISurveyReportAttachment>(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey report attachments by reportAttachmentId', [
        'AttachmentRepository->getSurveyReportAttachmentById',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Query to return the report attachment having the given IDs and belonging to the given survey.
   * @param {number} surveyId the ID of the survey
   * @param {number[]} reportAttachmentIds the IDs of the report attachments
   * @return {Promise<ISurveyReportAttachment[]>} The survey report attachments having the given IDs
   * @memberof AttachmentRepository
   */
  async getSurveyReportAttachmentsByIds(
    surveyId: number,
    reportAttachmentIds: number[]
  ): Promise<ISurveyReportAttachment[]> {
    defaultLog.debug({ label: 'getSurveyReportAttachmentsByIds' });

    console.log('surveyId', surveyId);
    console.log('reportAttachmentIds', reportAttachmentIds);
    const knex = getKnex();
    const queryBuilder = knex
      .queryBuilder()
      .select([
        'survey_report_attachment_id as id',
        'uuid',
        'file_name',
        'title',
        'description',
        knex.raw('year::int as year_published'),
        knex.raw(`
          CASE
            WHEN update_date IS NULL
            THEN create_date::text
            ELSE update_date::text
          END AS last_modified
        `),
        'file_size',
        'key',
        'revision_count'
      ])
      .from('survey_report_attachment')
      .whereIn('survey_report_attachment_id', reportAttachmentIds)
      .andWhere('survey_id', surveyId);

    console.log('queryBuilder', queryBuilder);
    const response = await this.connection.knex<ISurveyReportAttachment>(queryBuilder);
    console.log('response', response);

    return response.rows;
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

    if (!response.rows) {
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

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey report attachment authors by reportAttachmentId', [
        'AttachmentRepository->getSurveyAttachmentAuthors',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Insert new Project Attachment
   *
   * @param {Express.Multer.File} file
   * @param {number} projectId
   * @param {string} attachmentType
   * @param {string} key
   * @return {*}  {Promise<{ id: number; revision_count: number }>}
   * @memberof AttachmentRepository
   */
  async insertProjectAttachment(
    file: Express.Multer.File,
    projectId: number,
    attachmentType: string,
    key: string
  ): Promise<{ id: number; revision_count: number }> {
    const sqlStatement = SQL`
    INSERT INTO project_attachment (
      project_id,
      file_name,
      file_size,
      file_type,
      key
    ) VALUES (
      ${projectId},
      ${file.originalname},
      ${file.size},
      ${attachmentType},
      ${key}
    )
    RETURNING
      project_attachment_id as id,
      revision_count;
  `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rows || !response?.rows[0]) {
      throw new ApiExecuteSQLError('Failed to insert project attachment data', [
        'AttachmentRepository->insertProjectAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Update Project Attachment
   *
   * @param {string} fileName
   * @param {number} projectId
   * @param {string} attachmentType
   * @return {*}  {Promise<{ id: number; revision_count: number }>}
   * @memberof AttachmentRepository
   */
  async updateProjectAttachment(
    fileName: string,
    projectId: number,
    attachmentType: string
  ): Promise<{ id: number; revision_count: number }> {
    const sqlStatement = SQL`
    UPDATE
      project_attachment
    SET
      file_name = ${fileName},
      file_type = ${attachmentType}
    WHERE
      file_name = ${fileName}
    AND
      project_id = ${projectId}
    RETURNING
      project_attachment_id as id,
      revision_count;
  `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rows || !response?.rows[0]) {
      throw new ApiExecuteSQLError('Failed to update project attachment data', [
        'AttachmentRepository->updateProjectAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Get Project Atachment by filename
   *
   * @param {number} projectId
   * @param {string} fileName
   * @return {*}  {Promise<QueryResult>}
   * @memberof AttachmentRepository
   */
  async getProjectAttachmentByFileName(projectId: number, fileName: string): Promise<QueryResult> {
    const sqlStatement = SQL`
    SELECT
      project_attachment_id as id,
      uuid,
      file_name,
      title,
      description,
      update_date,
      create_date,
      file_size
    from
      project_attachment
    where
      project_id = ${projectId}
    and
      file_name = ${fileName};
  `;

    const response = await this.connection.sql(sqlStatement);

    return response;
  }

  /**
   * Insert new Project Report Attachment
   *
   * @param {string} fileName
   * @param {number} fileSize
   * @param {number} projectId
   * @param {PostReportAttachmentMetadata} attachmentMeta
   * @param {string} key
   * @return {*}  {Promise<{ id: number; revision_count: number }>}
   * @memberof AttachmentRepository
   */
  async insertProjectReportAttachment(
    fileName: string,
    fileSize: number,
    projectId: number,
    attachmentMeta: PostReportAttachmentMetadata,
    key: string
  ): Promise<{ id: number; revision_count: number }> {
    const sqlStatement = SQL`
    INSERT INTO project_report_attachment (
      project_id,
      file_name,
      title,
      year,
      description,
      file_size,
      key
    ) VALUES (
      ${projectId},
      ${fileName},
      ${attachmentMeta.title},
      ${attachmentMeta.year_published},
      ${attachmentMeta.description},
      ${fileSize},
      ${key}
    )
    RETURNING
      project_report_attachment_id as id,
      revision_count;
  `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rows || !response?.rows[0]) {
      throw new ApiExecuteSQLError('Failed to insert project report attachment data', [
        'AttachmentRepository->insertProjectReportAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Update Project Report Attachment
   *
   * @param {string} fileName
   * @param {number} projectId
   * @param {PutReportAttachmentMetadata} attachmentMeta
   * @return {*}  {Promise<{ id: number; revision_count: number }>}
   * @memberof AttachmentRepository
   */
  async updateProjectReportAttachment(
    fileName: string,
    projectId: number,
    attachmentMeta: PutReportAttachmentMetadata
  ): Promise<{ id: number; revision_count: number }> {
    const sqlStatement = SQL`
    UPDATE
      project_report_attachment
    SET
      file_name = ${fileName},
      title = ${attachmentMeta.title},
      year = ${attachmentMeta.year_published},
      description = ${attachmentMeta.description}
    WHERE
      file_name = ${fileName}
    AND
      project_id = ${projectId}
    RETURNING
      project_report_attachment_id as id,
      revision_count;
  `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rows || !response?.rows[0]) {
      throw new ApiExecuteSQLError('Failed to update project attachment data', [
        'AttachmentRepository->updateProjectReportAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Delete Attachment authors on project report
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<QueryResult>}
   * @memberof AttachmentRepository
   */
  async deleteProjectReportAttachmentAuthors(attachmentId: number): Promise<QueryResult> {
    const sqlStatement = SQL`
      DELETE
        FROM project_report_author
      WHERE
        project_report_attachment_id = ${attachmentId};
    `;

    const response = await this.connection.sql(sqlStatement);

    return response;
  }

  /**
   * Insert Attachment authors on project Report
   *
   * @param {number} attachmentId
   * @param {{ first_name: string; last_name: string }} author
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async insertProjectReportAttachmentAuthor(
    attachmentId: number,
    author: { first_name: string; last_name: string }
  ): Promise<void> {
    const sqlStatement = SQL`
      INSERT INTO project_report_author (
        project_report_attachment_id,
        first_name,
        last_name
      ) VALUES (
        ${attachmentId},
        ${author.first_name},
        ${author.last_name}
      );
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert attachment report author record', [
        'AttachmentRepository->insertProjectReportAttachmentAuthor',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  async getProjectReportAttachmentByFileName(projectId: number, fileName: string): Promise<QueryResult> {
    const sqlStatement = SQL`
      SELECT
        project_report_attachment_id as id,
        uuid,
        file_name,
        title,
        description,
        update_date,
        create_date,
        file_size
      from
        project_report_attachment
      where
        project_id = ${projectId}
      and
        file_name = ${fileName};
    `;

    const response = await this.connection.sql(sqlStatement);

    return response;
  }

  async getProjectAttachmentS3Key(projectId: number, attachmentId: number): Promise<string> {
    const sqlStatement = SQL`
      SELECT
        key
      FROM
        project_attachment
      WHERE
        project_id = ${projectId}
      AND
        project_attachment_id = ${attachmentId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to get Project Attachment S3 Key', [
        'AttachmentRepository->getProjectAttachmentS3Key',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].key;
  }

  async updateProjectReportAttachmentMetadata(
    projectId: number,
    attachmentId: number,
    metadata: PutReportAttachmentMetadata
  ): Promise<void> {
    const sqlStatement = SQL`
      UPDATE
        project_report_attachment
      SET
        title = ${metadata.title},
        year = ${metadata.year_published},
        description = ${metadata.description}
      WHERE
        project_id = ${projectId}
      AND
        project_report_attachment_id = ${attachmentId}
      AND
        revision_count = ${metadata.revision_count};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update Project Report Attachment Metadata', [
        'AttachmentRepository->updateProjectReportAttachmentMetadata',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  async getProjectReportAttachmentS3Key(projectId: number, attachmentId: number): Promise<string> {
    const sqlStatement = SQL`
      SELECT
        key
      FROM
        project_report_attachment
      WHERE
        project_id = ${projectId}
      AND
        project_report_attachment_id = ${attachmentId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to get Project Report Attachment S3 Key', [
        'AttachmentRepository->getProjectReportAttachmentS3Key',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].key;
  }

  async deleteProjectAttachment(attachmentId: number): Promise<{ key: string }> {
    const sqlStatement = SQL`
      DELETE
        from project_attachment
      WHERE
        project_attachment_id = ${attachmentId}
      RETURNING
        key;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete Project Attachment by id', [
        'AttachmentRepository->deleteProjectAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  async deleteProjectReportAttachment(attachmentId: number): Promise<{ key: string }> {
    const sqlStatement = SQL`
      DELETE
        from project_report_attachment
      WHERE
        project_report_attachment_id = ${attachmentId}
      RETURNING
        key;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete Project Report Attachment by id', [
        'AttachmentRepository->deleteProjectReportAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  async insertSurveyReportAttachment(
    fileName: string,
    fileSize: number,
    surveyId: number,
    attachmentMeta: PostReportAttachmentMetadata,
    key: string
  ): Promise<{ id: number; revision_count: number }> {
    const sqlStatement = SQL`
      INSERT INTO survey_report_attachment (
        survey_id,
        file_name,
        title,
        year,
        description,
        file_size,
        key
      ) VALUES (
        ${surveyId},
        ${fileName},
        ${attachmentMeta.title},
        ${attachmentMeta.year_published},
        ${attachmentMeta.description},
        ${fileSize},
        ${key}
      )
      RETURNING
        survey_report_attachment_id as id,
        revision_count;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to insert survey report attachment', [
        'AttachmentRepository->insertSurveyReportAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  async updateSurveyReportAttachment(
    fileName: string,
    surveyId: number,
    attachmentMeta: PutReportAttachmentMetadata
  ): Promise<{ id: number; revision_count: number }> {
    const sqlStatement = SQL`
      UPDATE
        survey_report_attachment
      SET
        file_name = ${fileName},
        title = ${attachmentMeta.title},
        year = ${attachmentMeta.year_published},
        description = ${attachmentMeta.description}
      WHERE
        file_name = ${fileName}
      AND
        survey_id = ${surveyId}
      RETURNING
        survey_report_attachment_id as id,
        revision_count;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to update survey report attachment', [
        'AttachmentRepository->updateSurveyReportAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  async deleteSurveyReportAttachmentAuthors(attachmentId: number): Promise<void> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_report_author
      WHERE
        survey_report_attachment_id = ${attachmentId};
    `;

    await this.connection.sql(sqlStatement);
  }

  async insertSurveyReportAttachmentAuthor(
    attachmentId: number,
    author: { first_name: string; last_name: string }
  ): Promise<void> {
    const sqlStatement = SQL`
      INSERT INTO survey_report_author (
        survey_report_attachment_id,
        first_name,
        last_name
      ) VALUES (
        ${attachmentId},
        ${author.first_name},
        ${author.last_name}
      );
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert survey report attachment', [
        'AttachmentRepository->insertSurveyReportAttachmentAuthor',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  async getSurveyReportAttachmentByFileName(surveyId: number, fileName: string): Promise<QueryResult> {
    const sqlStatement = SQL`
      SELECT
        survey_report_attachment_id as id,
        uuid,
        file_name,
        title,
        description,
        update_date,
        create_date,
        file_size
      from
        survey_report_attachment
      where
        survey_id = ${surveyId}
      and
        file_name = ${fileName};
    `;

    const response = await this.connection.sql(sqlStatement);

    return response;
  }

  async deleteSurveyReportAttachment(attachmentId: number): Promise<{ key: string }> {
    const sqlStatement = SQL`
      DELETE
        from survey_report_attachment
      WHERE
        survey_report_attachment_id = ${attachmentId}
      RETURNING
        key;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete Survey Report Attachment', [
        'AttachmentRepository->deleteSurveyReportAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  async deleteSurveyAttachment(attachmentId: number): Promise<{ key: string }> {
    const sqlStatement = SQL`
      DELETE
        from survey_attachment
      WHERE
        survey_attachment_id = ${attachmentId}
      RETURNING
        key;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete Survey Attachment', [
        'AttachmentRepository->deleteSurveyAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  async getSurveyAttachmentS3Key(surveyId: number, attachmentId: number): Promise<string> {
    const sqlStatement = SQL`
      SELECT
        key
      FROM
        survey_attachment
      WHERE
        survey_id = ${surveyId}
      AND
        survey_attachment_id = ${attachmentId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to get Survey Attachment S3 key', [
        'AttachmentRepository->getSurveyAttachmentS3Key',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].key;
  }

  async getSurveyReportAttachmentS3Key(surveyId: number, attachmentId: number): Promise<string> {
    const sqlStatement = SQL`
      SELECT
        key
      FROM
        survey_report_attachment
      WHERE
        survey_id = ${surveyId}
      AND
        survey_report_attachment_id = ${attachmentId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to get Survey Report Attachment S3 key', [
        'AttachmentRepository->getSurveyReportAttachmentS3Key',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].key;
  }

  async updateSurveyReportAttachmentMetadata(
    surveyId: number,
    attachmentId: number,
    metadata: PutReportAttachmentMetadata
  ): Promise<void> {
    const sqlStatement = SQL`
      UPDATE
        survey_report_attachment
      SET
        title = ${metadata.title},
        year = ${metadata.year_published},
        description = ${metadata.description}
      WHERE
        survey_id = ${surveyId}
      AND
        survey_report_attachment_id = ${attachmentId}
      AND
        revision_count = ${metadata.revision_count};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update Survey Report Attachment metadata', [
        'AttachmentRepository->updateSurveyReportAttachmentMetadata',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  async updateSurveyAttachment(
    surveyId: number,
    fileName: string,
    fileType: string
  ): Promise<{ id: number; revision_count: number }> {
    const sqlStatement = SQL`
      UPDATE
        survey_attachment
      SET
        file_name = ${fileName},
        file_type = ${fileType}
      WHERE
        file_name = ${fileName}
      AND
        survey_id = ${surveyId}
      RETURNING
        survey_attachment_id as id,
        revision_count;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to update survey attachment data', [
        'AttachmentRepository->updateSurveyAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  async insertSurveyAttachment(
    fileName: string,
    fileSize: number,
    fileType: string,
    surveyId: number,
    key: string
  ): Promise<{ id: number; revision_count: number }> {
    const sqlStatement = SQL`
    INSERT INTO survey_attachment (
      survey_id,
      file_name,
      file_size,
      file_type,
      key
    ) VALUES (
      ${surveyId},
      ${fileName},
      ${fileSize},
      ${fileType},
      ${key}
    )
    RETURNING
      survey_attachment_id as id,
      revision_count;
  `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to insert survey attachment data', [
        'AttachmentRepository->insertSurveyAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  async getSurveyAttachmentByFileName(fileName: string, surveyId: number): Promise<QueryResult> {
    const sqlStatement = SQL`
      SELECT
        survey_attachment_id as id,
        uuid,
        file_name,
        title,
        description,
        update_date,
        create_date,
        file_size
      from
        survey_attachment
      where
        survey_id = ${surveyId}
      and
        file_name = ${fileName};
    `;

    const response = await this.connection.sql(sqlStatement);

    return response;
  }
}
