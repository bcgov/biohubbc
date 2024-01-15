import { QueryResult } from 'pg';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export interface IProjectMetadataPublish {
  project_id: number;
  submission_uuid: number;
}

export interface ISurveyMetadataPublish {
  survey_id: number;
  submission_uuid: string;
}

export interface IOccurrenceSubmissionPublish {
  occurrence_submission_id: number;
  submission_uuid: number;
}

export interface ISummarySubmissionPublish {
  survey_summary_submission_id: number;
  artifact_id: number;
}

export interface IProjectAttachmentPublish {
  project_attachment_id: number;
  artifact_id: number;
}

export interface IProjectReportPublish {
  project_report_attachment_id: number;
  artifact_id: number;
}

export interface ISurveyAttachmentPublish {
  survey_attachment_id: number;
  artifact_uuid: string;
}

export interface ISurveyReportPublish {
  survey_report_attachment_id: number;
  artifact_id: number;
}

export const ProjectMetadataPublish = z.object({
  project_metadata_publish_id: z.number(),
  project_id: z.number(),
  event_timestamp: z.string(),
  submission_uuid: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type ProjectMetadataPublish = z.infer<typeof ProjectMetadataPublish>;

export const SurveyMetadataPublish = z.object({
  survey_metadata_publish_id: z.number(),
  survey_id: z.number(),
  event_timestamp: z.string(),
  submission_uuid: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyMetadataPublish = z.infer<typeof SurveyMetadataPublish>;

export const OccurrenceSubmissionPublish = z.object({
  occurrence_submission_publish_id: z.number(),
  occurrence_submission_id: z.number(),
  event_timestamp: z.string(),
  submission_uuid: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type OccurrenceSubmissionPublish = z.infer<typeof OccurrenceSubmissionPublish>;

export const ProjectReportPublish = z.object({
  project_report_publish_id: z.number(),
  project_report_attachment_id: z.number(),
  event_timestamp: z.string(),
  artifact_revision_id: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type ProjectReportPublish = z.infer<typeof ProjectReportPublish>;

export const ProjectAttachmentPublish = z.object({
  project_attachment_publish_id: z.number(),
  project_attachment_id: z.number(),
  event_timestamp: z.string(),
  artifact_revision_id: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type ProjectAttachmentPublish = z.infer<typeof ProjectAttachmentPublish>;

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
  uuid: z.string(),
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
  uuid: z.string(),
  event_timestamp: z.string(),
  artifact_revision_id: z.string()
});

export type SurveyReportWithPublishData = z.infer<typeof SurveyReportWithPublishData>;

export const ProjectAttachmentWithPublishData = z.object({
  project_attachment_publish_id: z.number(),
  project_attachment_id: z.number(),
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
  uuid: z.string(),
  event_timestamp: z.string(),
  artifact_revision_id: z.string()
});

export type ProjectAttachmentWithPublishData = z.infer<typeof ProjectAttachmentWithPublishData>;

export const ProjectReportWithPublishData = z.object({
  project_report_publish_id: z.number(),
  project_report_attachment_id: z.number(),
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
  uuid: z.string(),
  event_timestamp: z.string(),
  artifact_revision_id: z.string()
});

export type ProjectReportWithPublishData = z.infer<typeof ProjectReportWithPublishData>;

export enum PublishStatus {
  NO_DATA = 'NO_DATA',
  UNSUBMITTED = 'UNSUBMITTED',
  SUBMITTED = 'SUBMITTED'
}

export class HistoryPublishRepository extends BaseRepository {
  /**
   * Inserts a record into `project_metadata_publish` for a given queue and project id
   * and returns an id
   * @param {IProjectMetadataPublish} data
   * @returns {*} {Promise<number>}
   * @memberof HistoryPublishRepository
   */
  async insertProjectMetadataPublishRecord(data: IProjectMetadataPublish): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO project_metadata_publish
        (project_id, submission_uuid, event_timestamp)
      VALUES
        (${data.project_id}, ${data.submission_uuid}, NOW())
      RETURNING project_metadata_publish_id;
    `;
    const response = await this.connection.sql(sqlStatement);
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Project Metadata Publish record', [
        'HistoryPublishRepository->insertProjectMetadataPublishRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].project_metadata_publish_id;
  }

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
   * Inserts a record into `occurrence_submission_publish` for a given queue and occurrence id
   * and returns an id
   * @param {IOccurrenceSubmissionPublish} data
   * @returns {*} {Promise<number>}
   * @memberof HistoryPublishRepository
   */
  async insertOccurrenceSubmissionPublishRecord(data: IOccurrenceSubmissionPublish): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO occurrence_submission_publish
        (occurrence_submission_id, submission_uuid, event_timestamp)
      VALUES
        (${data.occurrence_submission_id}, ${data.submission_uuid}, NOW())
      RETURNING occurrence_submission_id;
    `;
    const response = await this.connection.sql(sqlStatement);
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Occurrence Submission Publish record', [
        'HistoryPublishRepository->insertOccurrenceSubmissionPublishRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].occurrence_submission_id;
  }

  /**
   * Inserts a record into `survey_summary_submission_publish` for a given artifact and summary id
   * and returns an id
   *
   * @param {ISummarySubmissionPublish} data
   * @return {*}  {Promise<{ survey_summary_submission_publish_id: number }>}
   * @memberof HistoryPublishRepository
   */
  async insertSurveySummaryPublishRecord(
    data: ISummarySubmissionPublish
  ): Promise<{ survey_summary_submission_publish_id: number }> {
    const sqlStatement = SQL`
    INSERT INTO survey_summary_submission_publish
    (survey_summary_submission_id, artifact_revision_id, event_timestamp)
    VALUES
    (${data.survey_summary_submission_id}, ${data.artifact_id}, NOW())
    RETURNING survey_summary_submission_publish_id;
    `;

    const response = await this.connection.sql(sqlStatement);
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Survey Summary Publish record', [
        'HistoryPublishRepository->insertSurveySummaryPublishRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].survey_summary_submission_publish_id;
  }

  /**
   * Inserts a record into `project_attachment_publish` for a given queue and project id
   * and returns an id
   * @param {IProjectAttachmentPublish} data
   * @returns {*} {Promise<number>}
   * @memberof HistoryPublishRepository
   */
  async insertProjectAttachmentPublishRecord(
    data: IProjectAttachmentPublish
  ): Promise<{ project_attachment_publish_id: number }> {
    const sqlStatement = SQL`
      INSERT INTO project_attachment_publish
        (project_attachment_id, artifact_revision_id, event_timestamp)
      VALUES
        (${data.project_attachment_id}, ${data.artifact_id}, NOW())
      RETURNING project_attachment_publish_id;
    `;
    const response = await this.connection.sql(sqlStatement);
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Project Attachment Publish record', [
        'HistoryPublishRepository->insertProjectAttachmentPublishRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a record into `project_report_publish` for a given queue and project id
   * and returns an id
   * @param {IProjectReportPublish} data
   * @returns {*} {Promise<number>}
   * @memberof HistoryPublishRepository
   */
  async insertProjectReportPublishRecord(data: IProjectReportPublish): Promise<{ project_report_publish_id: number }> {
    const sqlStatement = SQL`
      INSERT INTO project_report_publish
        (project_report_attachment_id, artifact_revision_id, event_timestamp)
      VALUES
        (${data.project_report_attachment_id}, ${data.artifact_id}, NOW())
      RETURNING project_report_publish_id;
    `;
    const response = await this.connection.sql(sqlStatement);
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Project Report Publish record', [
        'HistoryPublishRepository->insertProjectReportPublishRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0];
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
        (${data.survey_report_attachment_id}, ${data.artifact_id}, NOW())
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
   * Gets a record from `project_metadata_publish` for a given project id.
   *
   * @param {number} projectId
   * @return {*}  {Promise<(ProjectMetadataPublish | null)>}
   * @memberof HistoryPublishRepository
   */
  async getProjectMetadataPublishRecord(projectId: number): Promise<ProjectMetadataPublish | null> {
    // Select 1 record with latest timestamp
    const sqlStatement = SQL`
      select
        *
      from
        project_metadata_publish
      where
        project_id = ${projectId}
      order by
        event_timestamp desc
      limit 1;
    `;

    const response = await this.connection.sql<ProjectMetadataPublish>(sqlStatement);

    return (response.rows.length && response.rows[0]) || null;
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
   * Gets a record from `occurrence_submission_publish` for a given occurrence id.
   *
   * @param {number} occurrenceSubmissionId
   * @return {*}  {Promise<(OccurrenceSubmissionPublish | null)>}
   * @memberof HistoryPublishRepository
   */
  async getOccurrenceSubmissionPublishRecord(
    occurrenceSubmissionId: number
  ): Promise<OccurrenceSubmissionPublish | null> {
    // Select 1 record with latest timestamp
    const sqlStatement = SQL`
      select
        *
      from
        occurrence_submission_publish
      where
        occurrence_submission_id = ${occurrenceSubmissionId}
      order by
        event_timestamp desc
      limit 1;
    `;

    const response = await this.connection.sql<OccurrenceSubmissionPublish>(sqlStatement);

    return (response.rows.length && response.rows[0]) || null;
  }

  /**
   * Gets a record from `project_attachment_publish` for a given project id.
   *
   * @param {number} projectAttachmentId
   * @return {*}  {Promise<(ProjectAttachmentPublish | null)>}
   * @memberof HistoryPublishRepository
   */
  async getProjectAttachmentPublishRecord(projectAttachmentId: number): Promise<ProjectAttachmentPublish | null> {
    // Select 1 record with latest timestamp
    const sqlStatement = SQL`
      select
        *
      from
        project_attachment_publish
      where
        project_attachment_id = ${projectAttachmentId}
      order by
        event_timestamp desc
      limit 1;
    `;

    const response = await this.connection.sql<ProjectAttachmentPublish>(sqlStatement);

    return (response.rows.length && response.rows[0]) || null;
  }

  /**
   * Gets a record from `project_report_publish` for a given project id.
   *
   * @param {number} projectReportAttachmentId
   * @return {*}  {Promise<(ProjectReportPublish | null)>}
   * @memberof HistoryPublishRepository
   */
  async getProjectReportPublishRecord(projectReportAttachmentId: number): Promise<ProjectReportPublish | null> {
    // Select 1 record with latest timestamp
    const sqlStatement = SQL`
      select
        *
      from
        project_report_publish
      where
        project_report_attachment_id = ${projectReportAttachmentId}
      order by
        event_timestamp desc
      limit 1;
    `;

    const response = await this.connection.sql<ProjectReportPublish>(sqlStatement);

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
   * Gets a record from `survey_summary_submission_publish` for a given artifact and summary id.
   *
   * @param {number} surveySummarySubmissionId
   * @return {*}  {Promise<(SurveySummarySubmissionPublish | null)>}
   * @memberof HistoryPublishRepository
   */
  async getSurveySummarySubmissionPublishRecord(
    surveySummarySubmissionId: number
  ): Promise<SurveySummarySubmissionPublish | null> {
    // Select 1 record with latest timestamp
    const sqlStatement = SQL`
      select
        *
      from
        survey_summary_submission_publish
      where
        survey_summary_submission_id = ${surveySummarySubmissionId}
      order by
        event_timestamp desc
      limit 1;
    `;

    const response = await this.connection.sql<SurveySummarySubmissionPublish>(sqlStatement);

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

  /**
   * Deletes a record from `project_attachment_publish` for a given attachment id.
   *
   * @param {number} projectAttachmentId
   * @return {*}  {Promise<void>}
   * @memberof HistoryPublishRepository
   */
  async deleteProjectAttachmentPublishRecord(projectAttachmentId: number): Promise<void> {
    const sqlStatement = SQL`
      delete
      from
        project_attachment_publish
      where
        project_attachment_id = ${projectAttachmentId};
    `;

    await this.connection.sql(sqlStatement);
  }

  /**
   * Deletes a record from `project_report_publish` for a given attachment id.
   *
   * @param {number} projectAttachmentId
   * @return {*}  {Promise<void>}
   * @memberof HistoryPublishRepository
   */
  async deleteProjectReportAttachmentPublishRecord(projectAttachmentId: number): Promise<void> {
    const sqlStatement = SQL`
      delete
      from
        project_report_publish
      where
        project_report_attachment_id = ${projectAttachmentId};
    `;

    await this.connection.sql(sqlStatement);
  }

  /**
   * Get Survey Attachments with Publish Data
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyAttachmentWithPublishData[]>}
   * @memberof HistoryPublishRepository
   */
  async getSurveyAttachmentsWithPublishData(surveyId: number): Promise<SurveyAttachmentWithPublishData[]> {
    const sqlStatement = SQL`
    SELECT
      *
    from
      survey_attachment sa
    left join
      survey_attachment_publish sap
    on
      sa.survey_attachment_id = sap.survey_attachment_id
    where
      sa.survey_id =${surveyId};
  `;

    const response = await this.connection.sql<SurveyAttachmentWithPublishData>(sqlStatement);

    return response.rows;
  }

  /**
   * Get Survey Reports with Publish Data
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyReportWithPublishData[]>}
   * @memberof HistoryPublishRepository
   */
  async getSurveyReportsWithPublishData(surveyId: number): Promise<SurveyReportWithPublishData[]> {
    const sqlStatement = SQL`
    SELECT
      *
    from
      survey_report_attachment sra
    left join
      survey_report_publish srp
    on
      sra.survey_report_attachment_id = srp.survey_report_attachment_id
    where
      sra.survey_id =${surveyId};
  `;

    const response = await this.connection.sql<SurveyReportWithPublishData>(sqlStatement);

    return response.rows;
  }

  /**
   * Gets the latest survey observation that wasn't deleted
   *
   * @param {number} surveyId
   * @return {*}  {Promise<QueryResult>}
   * @memberof HistoryPublishRepository
   */
  async getLatestUndeletedObservationRecordId(surveyId: number): Promise<QueryResult> {
    const sqlStatement = SQL`
    select
      occurrence_submission_id
    from
      occurrence_submission os
    where
      os.survey_id = ${surveyId}
    and
      os.delete_timestamp is null
    order by
      event_timestamp desc
    limit 1;`;
    const response = await this.connection.sql(sqlStatement);

    return response;
  }

  /**
   * Get Project Attachments with Publish Data
   *
   * @param {number} projectId
   * @return {*}  {Promise<ProjectAttachmentWithPublishData[]>}
   * @memberof HistoryPublishRepository
   */
  async getProjectAttachmentsWithPublishData(projectId: number): Promise<ProjectAttachmentWithPublishData[]> {
    const sqlStatement = SQL`
    SELECT
      *
    from
      project_attachment pa
    left join
      project_attachment_publish pap
    on
      pa.project_attachment_id = pap.project_attachment_id
    where
      pa.project_id =${projectId};
  `;

    const response = await this.connection.sql<ProjectAttachmentWithPublishData>(sqlStatement);

    return response.rows;
  }

  /**
   * Get Project Reports with Publish Data
   *
   * @param {number} projectId
   * @return {*}  {Promise<ProjectReportWithPublishData>}
   * @memberof HistoryPublishRepository
   */
  async getProjectReportsWithPublishData(projectId: number): Promise<ProjectReportWithPublishData[]> {
    const sqlStatement = SQL`
    SELECT
      *
    from
      project_report_attachment pra
    left join
      project_report_publish prp
    on
      pra.project_report_attachment_id = prp.project_report_attachment_id
    where
      pra.project_id =${projectId};
  `;

    const response = await this.connection.sql<ProjectReportWithPublishData>(sqlStatement);

    return response.rows;
  }
}
