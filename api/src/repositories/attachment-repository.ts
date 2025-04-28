import { QueryResult } from 'pg';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { PostReportAttachmentMetadata, PutReportAttachmentMetadata } from '../models/survey-attachments';
import { IDeviceKeyData } from '../services/attachment-service';
import { IValidationData } from '../services/telemetry-services/telemetry-utils';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

export type IAttachment = ISurveyAttachment | ISurveyReportAttachment;

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

export interface ISurveyReportAttachmentAuthor {
  survey_report_author_id: number;
  survey_report_attachment_id: number;
  first_name: string;
  last_name: string;
  update_date: string;
  revision_count: number;
}

export const SurveyTelemetryCredentialAttachment = z.object({
  survey_telemetry_credential_attachment_id: z.number(),
  uuid: z.string().uuid(),
  file_name: z.string(),
  file_type: z.string(),
  file_size: z.number(),
  create_date: z.string(),
  update_date: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  key: z.string()
});
export type SurveyTelemetryCredentialAttachment = z.infer<typeof SurveyTelemetryCredentialAttachment>;

const defaultLog = getLogger('repositories/attachment-repository');

/**
 * A repository class for accessing  survey attachment data
 *
 * @export
 * @class AttachmentRepository
 * @extends {BaseRepository}
 */
export class AttachmentRepository extends BaseRepository {
  /**
   * SQL query to get survey attachments for a single project.
   *
   * @param {number} surveyId The survey ID
   * @return {Promise<ISurveyAttachment[]>} Promise resolving all survey attachments
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
    defaultLog.debug({ label: 'getSurveyAttachmentById' });

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
   * @return {Promise<ISurveyAttachment[]>} All survey attachments having the given IDs
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
   * Get all survey attachments for the given survey id, which are safe to publish to BioHub.
   *
   * Note: Not all attachment types are publishable to BioHub. This method filters out attachment types that should not
   * be published.
   *
   * @param {number} surveyId
   * @param {number[]} attachmentIds
   * @return {*}  {Promise<ISurveyAttachment[]>}
   * @memberof AttachmentRepository
   */
  async getSurveyAttachmentsForBioHubSubmission(surveyId: number): Promise<ISurveyAttachment[]> {
    defaultLog.debug({ label: 'getSurveyAttachmentsForBioHubSubmission' });

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

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get survey report attachment data', [
        'AttachmentRepository->getSurveyReportAttachmentById',
        'rowCount was !== 1, expected rowCount === 1'
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
   * Query to return all of the authors belonging to a survey report attachment
   * @param {number} reportAttachmentId The ID of the report attachment
   * @return {Promise<ISurveyReportAttachmentAuthor[]>} Promise resolving the report authors
   * @memberof AttachmentRepository
   */
  async getSurveyReportAttachmentAuthors(reportAttachmentId: number): Promise<ISurveyReportAttachmentAuthor[]> {
    defaultLog.debug({ label: 'getSurveyAttachmentAuthors' });

    const sqlStatement = SQL`
      SELECT
        survey_report_author.*
      FROM
        survey_report_author
      WHERE
        survey_report_attachment_id = ${reportAttachmentId};
      `;

    const response = await this.connection.sql<ISurveyReportAttachmentAuthor>(sqlStatement);

    return response.rows;
  }

  /**
   * Get survey telemetry credential attachments.
   *
   * @param {number} surveyId The survey ID
   * @return {Promise<SurveyTelemetryCredentialAttachment[]>} Promise resolving all survey telemetry attachments
   * @memberof AttachmentRepository
   */
  async getSurveyTelemetryCredentialAttachments(surveyId: number): Promise<SurveyTelemetryCredentialAttachment[]> {
    defaultLog.debug({ label: 'getSurveyTelemetryCredentialAttachments' });

    const sqlStatement = SQL`
      SELECT
        survey_telemetry_credential_attachment_id,
        uuid,
        file_name,
        file_type,
        file_size,
        create_date,
        update_date,
        title,
        description,
        key
      FROM
        survey_telemetry_credential_attachment
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, SurveyTelemetryCredentialAttachment);

    return response.rows;
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
  async deleteSurveyReportAttachmentRecord(attachmentId: number): Promise<{ key: string; uuid: string }> {
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
        'AttachmentRepository->deleteSurveyReportAttachmentRecord',
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
  async deleteSurveyAttachmentRecord(attachmentId: number): Promise<{ key: string; uuid: string }> {
    const sqlStatement = SQL`
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
        'AttachmentRepository->deleteSurveyAttachmentRecord',
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
   * Update survey telemetry credential attachment record.
   *
   * @param {number} surveyId
   * @param {string} fileName
   * @param {string} fileType
   * @return {*}  {Promise<{ survey_telemetry_credential_attachment_id: number }>}
   * @memberof AttachmentRepository
   */
  async updateSurveyTelemetryCredentialAttachment(
    surveyId: number,
    fileName: string,
    fileData: IValidationData
  ): Promise<{ survey_telemetry_credential_attachment_id: number }> {
    const sqlStatement = SQL`
      UPDATE
        survey_telemetry_credential_attachment
      SET
        file_name = ${fileName},
        file_type = ${fileData.type}
      WHERE
        file_name = ${fileName}
      AND
        survey_id = ${surveyId}
      RETURNING
        survey_telemetry_credential_attachment_id;
    `;

    const response = await this.connection.sql(
      sqlStatement,
      z.object({ survey_telemetry_credential_attachment_id: z.number() })
    );

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to update survey attachment data', [
        'AttachmentRepository->updateSurveyTelemetryCredentialAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts uploaded device key attachment file
   *
   * @async
   * @param {IDeviceKeyData} deviceKeyData
   * @returns {Promise<number>}
   */
  async insertSurveyTelemetryCredentialAttachment(deviceKeyData: IDeviceKeyData): Promise<number> {
    const sqlStatement = SQL`
    INSERT INTO survey_telemetry_credential_attachment (
      survey_id,
      file_name,
      file_size,
      file_type,
      key
    ) VALUES (
      ${deviceKeyData.surveyId},
      ${deviceKeyData.fileName},
      ${deviceKeyData.fileSize},
      ${deviceKeyData.fileData.type},
      ${deviceKeyData.key}
    )
    RETURNING
      survey_telemetry_credential_attachment_id;
  `;

    const response = await this.connection.sql(
      sqlStatement,
      z.object({ survey_telemetry_credential_attachment_id: z.number() })
    );

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to insert survey attachment data', [
        'AttachmentRepository->insertSurveyTelemetryCredentialAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response?.rows?.[0].survey_telemetry_credential_attachment_id;
  }

  /**
   * Get Survey Telemetry Attachment By File Name
   *
   * @param {string} fileName
   * @param {number} surveyId
   * @return {*}  {Promise<QueryResult>}
   * @memberof AttachmentRepository
   */
  async getSurveyTelemetryCredentialAttachmentByFileName(fileName: string, surveyId: number): Promise<QueryResult> {
    const sqlStatement = SQL`
      SELECT
        survey_telemetry_credential_attachment_id,
        uuid,
        file_name,
        title,
        description,
        update_date,
        create_date,
        file_size
      FROM
        survey_telemetry_credential_attachment
      WHERE
        survey_id = ${surveyId}
      AND
        file_name ILIKE ${fileName};
    `;

    const response = await this.connection.sql(sqlStatement);

    return response;
  }

  /**
   * Get survey telemetry credential attachment S3 key
   *
   * @param {number} surveyId
   * @param {number} attachmentId
   * @return {*}  {Promise<string>}
   * @memberof AttachmentRepository
   */
  async getSurveyTelemetryCredentialAttachmentS3Key(surveyId: number, attachmentId: number): Promise<string> {
    const sqlStatement = SQL`
      SELECT
        key
      FROM
        survey_telemetry_credential_attachment
      WHERE
        survey_telemetry_credential_attachment_id = ${attachmentId}
      AND
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to get Survey Telemetry Credential Attachment S3 Key', [
        'AttachmentRepository->getSurveyTelemetryCredentialAttachmentS3Key',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].key;
  }
}
