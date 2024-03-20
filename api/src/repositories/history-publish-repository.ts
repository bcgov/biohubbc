import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export interface ISurveyMetadataPublish {
  survey_id: number;
  submission_uuid: string;
}
export interface ISurveyAttachmentPublish {
  survey_attachment_id: number;
  artifact_uuid: string;
}

export interface ISurveyReportPublish {
  survey_report_attachment_id: number;
  artifact_uuid: string;
}

export const SurveyMetadataPublish = z.object({
  survey_metadata_publish_id: z.number(),
  survey_id: z.number(),
  event_timestamp: z.string(),
  submission_uuid: z.string().uuid(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyMetadataPublish = z.infer<typeof SurveyMetadataPublish>;

export const SurveyReportPublish = z.object({
  survey_report_publish_id: z.number(),
  survey_report_attachment_id: z.number(),
  event_timestamp: z.string(),
  artifact_revision_id: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyReportPublish = z.infer<typeof SurveyReportPublish>;

export const SurveyAttachmentPublish = z.object({
  survey_attachment_publish_id: z.number(),
  survey_attachment_id: z.number(),
  event_timestamp: z.string(),
  artifact_revision_id: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyAttachmentPublish = z.infer<typeof SurveyAttachmentPublish>;

export const SurveySummarySubmissionPublish = z.object({
  survey_summary_submission_publish_id: z.number(),
  survey_summary_submission_id: z.number(),
  event_timestamp: z.string(),
  artifact_revision_id: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveySummarySubmissionPublish = z.infer<typeof SurveySummarySubmissionPublish>;

export const SurveyAttachmentWithPublishData = z.object({
  survey_attachment_publish_id: z.number(),
  survey_attachment_id: z.number(),
  survey_id: z.number(),
  file_type: z.string(),
  file_name: z.string(),
  title: z.string(),
  description: z.string(),
  key: z.string(),
  file_size: z.number(),
  create_date: z.string().nullable(),
  create_user: z.number().nullable(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number(),
  uuid: z.string().uuid(),
  event_timestamp: z.string(),
  artifact_revision_id: z.string()
});

export type SurveyAttachmentWithPublishData = z.infer<typeof SurveyAttachmentWithPublishData>;

export const SurveyReportWithPublishData = z.object({
  survey_report_publish_id: z.number(),
  survey_report_attachment_id: z.number(),
  survey_id: z.number(),
  file_name: z.string(),
  title: z.string(),
  description: z.string(),
  year: z.number(),
  key: z.string(),
  file_size: z.number(),
  create_date: z.string().nullable(),
  create_user: z.number().nullable(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number(),
  uuid: z.string().uuid(),
  event_timestamp: z.string(),
  artifact_revision_id: z.string()
});

export type SurveyReportWithPublishData = z.infer<typeof SurveyReportWithPublishData>;

export enum PublishStatus {
  NO_DATA = 'NO_DATA',
  UNSUBMITTED = 'UNSUBMITTED',
  SUBMITTED = 'SUBMITTED'
}

export class HistoryPublishRepository extends BaseRepository {
  /**
   * Inserts a record into `survey_metadata_publish` for a given queue and survey id
   * and returns an id
   * @param {ISurveyMetadataPublish} data
   * @returns {*} {Promise<number>}
   * @memberof HistoryPublishRepository
   */
  async insertSurveyMetadataPublishRecord(data: ISurveyMetadataPublish): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO survey_metadata_publish
        (survey_id, submission_uuid, event_timestamp)
      VALUES
        (${data.survey_id}, ${data.submission_uuid}, NOW())
      ON CONFLICT (submission_uuid) DO UPDATE SET event_timestamp = NOW()
      RETURNING survey_metadata_publish_id;
    `;

    // NOTE: ON CONFLICT is used to update the timestamp if the same submission_uuid is used
    //      to publish the same survey multiple times

    const response = await this.connection.sql(sqlStatement);
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Survey Metadata Publish record', [
        'HistoryPublishRepository->insertSurveyMetadataPublishRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].project_metadata_publish_id;
  }

  /**
   * Inserts a record into `survey_attachment_publish` for a given queue and survey id
   * and returns an id
   * @param {ISurveyAttachmentPublish} data
   * @returns {*} {Promise<number>}
   * @memberof HistoryPublishRepository
   */
  async insertSurveyAttachmentPublishRecord(
    data: ISurveyAttachmentPublish
  ): Promise<{ survey_attachment_publish_id: number }> {
    const sqlStatement = SQL`
      INSERT INTO survey_attachment_publish
        (survey_attachment_id, artifact_revision_id, event_timestamp)
      VALUES
        (${data.survey_attachment_id}, ${data.artifact_uuid}, NOW())
      RETURNING survey_attachment_publish_id;
    `;
    const response = await this.connection.sql(sqlStatement);
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Survey Attachment Publish record', [
        'HistoryPublishRepository->insertSurveyAttachmentPublishRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a record into `survey_report_publish` for a given queue and survey id
   * and returns an id
   * @param {ISurveyReportPublish} data
   * @returns {*} {Promise<number>}
   * @memberof HistoryPublishRepository
   */
  async insertSurveyReportPublishRecord(data: ISurveyReportPublish): Promise<{ survey_report_publish_id: number }> {
    const sqlStatement = SQL`
      INSERT INTO survey_report_publish
        (survey_report_attachment_id, artifact_revision_id, event_timestamp)
      VALUES
        (${data.survey_report_attachment_id}, ${data.artifact_uuid}, NOW())
      RETURNING survey_report_publish_id;
    `;
    const response = await this.connection.sql(sqlStatement);
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Survey Report Publish record', [
        'HistoryPublishRepository->insertSurveyReportPublishRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Gets a record from `survey_metadata_publish` for a given survey id.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<(SurveyMetadataPublish | null)>}
   * @memberof HistoryPublishRepository
   */
  async getSurveyMetadataPublishRecord(surveyId: number): Promise<SurveyMetadataPublish | null> {
    // Select 1 record with latest timestamp
    const sqlStatement = SQL`
      select
        *
      from
        survey_metadata_publish
      where
        survey_id = ${surveyId}
      order by
        event_timestamp desc
      limit 1;
    `;

    const response = await this.connection.sql<SurveyMetadataPublish>(sqlStatement);

    return (response.rows.length && response.rows[0]) || null;
  }

  /**
   * Gets a record from `survey_attachment_publish` for a given survey id.
   *
   * @param {number} surveyAttachmentId
   * @return {*}  {Promise<(SurveyAttachmentPublish | null)>}
   * @memberof HistoryPublishRepository
   */
  async getSurveyAttachmentPublishRecord(surveyAttachmentId: number): Promise<SurveyAttachmentPublish | null> {
    // Select 1 record with latest timestamp
    const sqlStatement = SQL`
      select
        *
      from
        survey_attachment_publish
      where
        survey_attachment_id = ${surveyAttachmentId}
      order by
        event_timestamp desc
      limit 1;
    `;

    const response = await this.connection.sql<SurveyAttachmentPublish>(sqlStatement);

    return (response.rows.length && response.rows[0]) || null;
  }

  /**
   * Gets a record from `survey_report_publish` for a given survey id.
   *
   * @param {number} surveyReportAttachmentId
   * @return {*}  {Promise<(SurveyReportPublish | null)>}
   * @memberof HistoryPublishRepository
   */
  async getSurveyReportPublishRecord(surveyReportAttachmentId: number): Promise<SurveyReportPublish | null> {
    // Select 1 record with latest timestamp
    const sqlStatement = SQL`
      select
        *
      from
        survey_report_publish
      where
        survey_report_attachment_id = ${surveyReportAttachmentId}
      order by
        event_timestamp desc
      limit 1;
    `;

    const response = await this.connection.sql<SurveyReportPublish>(sqlStatement);

    return (response.rows.length && response.rows[0]) || null;
  }

  /**
   * Deletes a record from `survey_attachment_publish` for a given attachment id.
   *
   * @param {number} surveyAttachmentId
   * @return {*}  {Promise<void>}
   * @memberof HistoryPublishRepository
   */
  async deleteSurveyAttachmentPublishRecord(surveyAttachmentId: number): Promise<void> {
    const sqlStatement = SQL`
      delete
      from
        survey_attachment_publish
      where
        survey_attachment_id = ${surveyAttachmentId};
    `;

    await this.connection.sql(sqlStatement);
  }

  /**
   * Deletes a record from `survey_report_publish` for a given attachment id.
   *
   * @param {number} surveyAttachmentId
   * @return {*}  {Promise<void>}
   * @memberof HistoryPublishRepository
   */
  async deleteSurveyReportAttachmentPublishRecord(surveyAttachmentId: number): Promise<void> {
    const sqlStatement = SQL`
      delete
      from
        survey_report_publish
      where
        survey_report_attachment_id = ${surveyAttachmentId};
    `;

    await this.connection.sql(sqlStatement);
  }
}
