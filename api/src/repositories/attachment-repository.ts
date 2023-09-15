import { QueryResult } from 'pg';
import SQL from 'sql-template-strings';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { PostReportAttachmentMetadata, PutReportAttachmentMetadata } from '../models/project-survey-attachments';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

export type IAttachment = ISurveyAttachment | ISurveyReportAttachment | IProjectAttachment | IProjectReportAttachment;

export interface IProjectAttachment extends IAttachmentData {
  project_attachment_id: number;
}

export interface ISurveyAttachment extends IAttachmentData {
  survey_attachment_id: number;
}

export interface IAttachmentData {
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

export interface ISurveyReportAttachment extends IReportAttachmentData {
  survey_report_attachment_id: number;
}

export interface IProjectReportAttachment extends IReportAttachmentData {
  project_report_attachment_id: number;
}

export interface IReportAttachmentData {
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
        project_attachment_id,
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
        project_attachment_id,
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
        'project_attachment_id',
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
        project_report_attachment_id,
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
        project_report_attachment_id,
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
        'project_report_attachment_id',
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
        survey_attachment_id,
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

    return response.rows;
  }

  /**
   * SQL query to get a single attachment for a single survey.
   *
   * @param {number} surveyId
   * @param {number} attachmentId
   * @return {*}  {Promise<ISurveyAttachment>}
   * @memberof AttachmentRepository
   */
  async getSurveyAttachmentById(surveyId: number, attachmentId: number): Promise<ISurveyAttachment> {
    defaultLog.debug({ label: 'getProjectAttachmentById' });

    const sqlStatement = SQL`
      SELECT
        survey_attachment_id,
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
        survey_attachment_id = ${attachmentId}
      AND
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql<ISurveyAttachment>(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get survey attachment by attachmentId', [
        'AttachmentRepository->getSurveyAttachmentById',
        'rowCount was null, undefined or > 1, expected rowCount === 1'
      ]);
    }

    return response.rows[0];
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
        'survey_attachment_id',
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
        survey_report_attachment_id,
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
        survey_report_attachment_id,
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

    const knex = getKnex();
    const queryBuilder = knex
      .queryBuilder()
      .select([
        'survey_report_attachment_id',
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

    const response = await this.connection.knex<ISurveyReportAttachment>(queryBuilder);

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

    return response.rows;
  }

  /**
   * Insert new Project Attachment
   *
   * @param {Express.Multer.File} file
   * @param {number} projectId
   * @param {string} attachmentType
   * @param {string} key
   * @return {*}  {Promise<{ project_attachment_id: number; revision_count: number }>}
   * @memberof AttachmentRepository
   */
  async insertProjectAttachment(
    file: Express.Multer.File,
    projectId: number,
    attachmentType: string,
    key: string
  ): Promise<{ project_attachment_id: number; revision_count: number }> {
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
      project_attachment_id,
      revision_count;
  `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rows[0]) {
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
   * @return {*}  {Promise<{ project_attachment_id: number; revision_count: number }>}
   * @memberof AttachmentRepository
   */
  async updateProjectAttachment(
    fileName: string,
    projectId: number,
    attachmentType: string
  ): Promise<{ project_attachment_id: number; revision_count: number }> {
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
      project_attachment_id,
      revision_count;
  `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rows[0]) {
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
      project_attachment_id,
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
   * @return {*}  {Promise<{ project_report_attachment_id: number; revision_count: number }>}
   * @memberof AttachmentRepository
   */
  async insertProjectReportAttachment(
    fileName: string,
    fileSize: number,
    projectId: number,
    attachmentMeta: PostReportAttachmentMetadata,
    key: string
  ): Promise<{ project_report_attachment_id: number; revision_count: number }> {
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
      project_report_attachment_id,
      revision_count;
  `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rows[0]) {
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
   * @return {*}  {Promise<{ project_report_attachment_id: number; revision_count: number }>}
   * @memberof AttachmentRepository
   */
  async updateProjectReportAttachment(
    fileName: string,
    projectId: number,
    attachmentMeta: PutReportAttachmentMetadata
  ): Promise<{ project_report_attachment_id: number; revision_count: number }> {
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
      project_report_attachment_id,
      revision_count;
  `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rows[0]) {
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

  /**
   * Gets Project Report Attachment by filename
   *
   * @param {number} projectId
   * @param {string} fileName
   * @return {*}  {Promise<QueryResult>}
   * @memberof AttachmentRepository
   */
  async getProjectReportAttachmentByFileName(projectId: number, fileName: string): Promise<QueryResult> {
    const sqlStatement = SQL`
      SELECT
        project_report_attachment_id,
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

  /**
   * Get Project Attachment S3 Key
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @return {*}  {Promise<string>}
   * @memberof AttachmentRepository
   */
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

  /**
   * Update Project Report Attachment Metadata
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @param {PutReportAttachmentMetadata} metadata
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
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

  /**
   * Get Project Report Attachment S3 Key
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @return {*}  {Promise<string>}
   * @memberof AttachmentRepository
   */
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

  /**
   * Delete Project Attachment by id
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<{ key: string; uuid: string }>}
   * @memberof AttachmentRepository
   */
  async deleteProjectAttachment(attachmentId: number): Promise<{ key: string; uuid: string }> {
    const sqlStatement = SQL`
      DELETE
        from project_attachment
      WHERE
        project_attachment_id = ${attachmentId}
      RETURNING
        key, uuid;
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

  /**
   * Delete Project Report Attachment by id
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<{ key: string }>}
   * @memberof AttachmentRepository
   */
  async deleteProjectReportAttachment(attachmentId: number): Promise<{ key: string; uuid: string }> {
    const sqlStatement = SQL`
      DELETE
        from project_report_attachment
      WHERE
        project_report_attachment_id = ${attachmentId}
      RETURNING
        key, uuid;
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

  /**
   * Insert Survey Report Attachment
   *
   * @param {string} fileName
   * @param {number} fileSize
   * @param {number} surveyId
   * @param {PostReportAttachmentMetadata} attachmentMeta
   * @param {string} key
   * @return {*}  {Promise<{ survey_report_attachment_id: number; revision_count: number }>}
   * @memberof AttachmentRepository
   */
  async insertSurveyReportAttachment(
    fileName: string,
    fileSize: number,
    surveyId: number,
    attachmentMeta: PostReportAttachmentMetadata,
    key: string
  ): Promise<{ survey_report_attachment_id: number; revision_count: number }> {
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
        survey_report_attachment_id,
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

  /**
   * Update Survey Report Attachment
   *
   * @param {string} fileName
   * @param {number} surveyId
   * @param {PutReportAttachmentMetadata} attachmentMeta
   * @return {*}  {Promise<{ survey_report_attachment_id: number; revision_count: number }>}
   * @memberof AttachmentRepository
   */
  async updateSurveyReportAttachment(
    fileName: string,
    surveyId: number,
    attachmentMeta: PutReportAttachmentMetadata
  ): Promise<{ survey_report_attachment_id: number; revision_count: number }> {
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
        survey_report_attachment_id,
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

  /**
   * Delete Survey Report Attachment Authors
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async deleteSurveyReportAttachmentAuthors(attachmentId: number): Promise<void> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_report_author
      WHERE
        survey_report_attachment_id = ${attachmentId};
    `;

    await this.connection.sql(sqlStatement);
  }

  /**
   * Insert Survey Report Attachment Author
   *
   * @param {number} attachmentId
   * @param {{ first_name: string; last_name: string }} author
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
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

  /**
   * Get Survey Report Attachment by Filename
   *
   * @param {number} surveyId
   * @param {string} fileName
   * @return {*}  {Promise<QueryResult>}
   * @memberof AttachmentRepository
   */
  async getSurveyReportAttachmentByFileName(surveyId: number, fileName: string): Promise<QueryResult> {
    const sqlStatement = SQL`
      SELECT
        survey_report_attachment_id,
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

  /**
   * Delete Survey Report Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<{ key: string; uuid: string }>}
   * @memberof AttachmentRepository
   */
  async deleteSurveyReportAttachment(attachmentId: number): Promise<{ key: string; uuid: string }> {
    const sqlStatement = SQL`
      DELETE
        from survey_report_attachment
      WHERE
        survey_report_attachment_id = ${attachmentId}
      RETURNING
        key, uuid;
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

  /**
   * Delete Survey Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<{ key: string; uuid: string }>}
   * @memberof AttachmentRepository
   */
  async deleteSurveyAttachment(attachmentId: number): Promise<{ key: string; uuid: string }> {
    const sqlStatement = SQL`
      WITH deleted_keyx AS (
        DELETE
          from survey_attachment_keyx
        WHERE
          survey_attachment_id = ${attachmentId}
      )
      DELETE
        from survey_attachment
      WHERE
        survey_attachment_id = ${attachmentId}
      RETURNING
        key, uuid;
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

  /**
   * Get Survey Attachment S3 Key
   *
   * @param {number} surveyId
   * @param {number} attachmentId
   * @return {*}  {Promise<string>}
   * @memberof AttachmentRepository
   */
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

  /**
   * Get Survey Report Attachment S3 Key
   *
   * @param {number} surveyId
   * @param {number} attachmentId
   * @return {*}  {Promise<string>}
   * @memberof AttachmentRepository
   */
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

  /**
   * Update Survey Report Attachment Metadata
   *
   * @param {number} surveyId
   * @param {number} attachmentId
   * @param {PutReportAttachmentMetadata} metadata
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
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

  /**
   * Update Survey Attachment
   *
   * @param {number} surveyId
   * @param {string} fileName
   * @param {string} fileType
   * @return {*}  {Promise<{ survey_attachment_id: number; revision_count: number }>}
   * @memberof AttachmentRepository
   */
  async updateSurveyAttachment(
    surveyId: number,
    fileName: string,
    fileType: string
  ): Promise<{ survey_attachment_id: number; revision_count: number }> {
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
        survey_attachment_id,
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

  /**
   * Insert Survey Attachment
   *
   * @param {string} fileName
   * @param {number} fileSize
   * @param {string} fileType
   * @param {number} surveyId
   * @param {string} key
   * @return {*}  {Promise<{ survey_attachment_id: number; revision_count: number }>}
   * @memberof AttachmentRepository
   */
  async insertSurveyAttachment(
    fileName: string,
    fileSize: number,
    fileType: string,
    surveyId: number,
    key: string
  ): Promise<{ survey_attachment_id: number; revision_count: number }> {
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
      survey_attachment_id,
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

  /**
   * Get Survey Attachment By File Name
   *
   * @param {string} fileName
   * @param {number} surveyId
   * @return {*}  {Promise<QueryResult>}
   * @memberof AttachmentRepository
   */
  async getSurveyAttachmentByFileName(fileName: string, surveyId: number): Promise<QueryResult> {
    const sqlStatement = SQL`
      SELECT
        survey_attachment_id,
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

  /**
   * Insert Survey Attachment Keyx Record
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async insertSurveyAttachmentKeyx(attachmentId: number): Promise<{ survey_attachment_keyx_id: number }> {
    const sqlStatement = SQL`
      INSERT INTO survey_attachment_keyx (
        survey_attachment_id
      ) VALUES (
        ${attachmentId}
      ) RETURNING survey_attachment_keyx_id;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to insert survey attachment keyx data', [
        'AttachmentRepository->insertSurveyAttachmentKeyx',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Update Survey Attachment Keyx Record
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async updateSurveyAttachmentKeyx(attachmentId: number): Promise<void> {
    const sqlStatement = SQL`
      UPDATE
        survey_attachment_keyx
      SET
        processed_at = now()
      WHERE
        survey_attachment_id = ${attachmentId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to update survey attachment keyx data', [
        'AttachmentRepository->updateSurveyAttachmentKeyx',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * Get survey attachments to process
   *
   * @return {*}  {Promise<string[]>}
   * @memberof AttachmentRepository
   */
  async getSurveyKeyxAttachmentsToProcess(): Promise<{ survey_attachment_id: number; key: string }[]> {
    const sqlStatement = SQL`
      SELECT 
        survey_attachment.survey_attachment_id,
        survey_attachment.key
      FROM 
        survey_attachment 
      INNER JOIN 
        survey_attachment_keyx 
      ON 
        survey_attachment.survey_attachment_id = survey_attachment_keyx.survey_attachment_id 
      WHERE 
        survey_attachment_keyx.processed_at IS NULL`;

    const response = await this.connection.sql(sqlStatement);

    return response?.rows ?? [];
  }
}
