import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export interface IProjectMetadataPublish {
  project_id: number;
  queue_id: number;
}

export interface ISurveyMetadataPublish {
  survey_id: number;
  queue_id: number;
}

export interface IOccurrenceSubmissionPublish {
  occurrence_submission_id: number;
  queue_id: number;
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
  artifact_id: number;
}

export interface ISurveyReportPublish {
  survey_report_attachment_id: number;
  artifact_id: number;
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
        (project_id, queue_id, event_timestamp)
      VALUES
        (${data.project_id}, ${data.queue_id}, NOW())
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
        (survey_id, queue_id, event_timestamp)
      VALUES
        (${data.survey_id}, ${data.queue_id}, NOW())
      RETURNING survey_metadata_publish_id;
    `;
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
        (occurrence_submission_id, queue_id, event_timestamp)
      VALUES
        (${data.occurrence_submission_id}, ${data.queue_id}, NOW())
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
        (${data.survey_attachment_id}, ${data.artifact_id}, NOW())
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
}
