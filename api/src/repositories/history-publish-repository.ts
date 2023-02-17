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

export interface IProjectAttachmentPublish {
  project_attachment_publish_id: number;
  queue_id: number;
}

export interface IProjectReportPublish {
  project_report_publish_id: number;
  queue_id: number;
}

export interface ISurveyAttachmentPublish {
  survey_attachment_publish_id: number;
  queue_id: number;
}

export interface ISurveyReportPublish {
  survey_report_publish_id: number;
  queue_id: number;
}

export class HistoryPublishRepository extends BaseRepository {
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
        'ProjectMetadataPublishRepository->insertProjectMetadataRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].project_metadata_publish_id;
  }

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
        'ProjectMetadataPublishRepository->insertSurveyMetadataRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].project_metadata_publish_id;
  }

  async insertOccurrenceSubmissionPublishRecord(data: IOccurrenceSubmissionPublish): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO occurrence_submission_publish 
        (occurrence_submission_id, queue_id, event_timestamp)
      VALUES
        (${data.occurrence_submission_id}, ${data.queue_id}, NOW())
      RETURNING occurrence_submission_publish_id;
    `;
    const response = await this.connection.sql(sqlStatement);
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Occurrence Submission Publish record', [
        'ProjectMetadataPublishRepository->insertOccurrenceSubmissionRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].project_metadata_publish_id;
  }

  async insertProjectAttachmentPublishRecord(data: IProjectAttachmentPublish): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO project_attachment_publish 
        (project_attachment_publish_id, queue_id, event_timestamp)
      VALUES
        (${data.project_attachment_publish_id}, ${data.queue_id}, NOW())
      RETURNING project_attachment_publish_id;
    `;
    const response = await this.connection.sql(sqlStatement);
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Project Attachment Publish record', [
        'ProjectMetadataPublishRepository->insertProjectAttachmentPublishRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].project_metadata_publish_id;
  }

  async insertProjectReportPublishRecord(data: IProjectReportPublish): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO project_report_publish 
        (project_report_publish_id, queue_id, event_timestamp)
      VALUES
        (${data.project_report_publish_id}, ${data.queue_id}, NOW())
      RETURNING project_report_publish_id;
    `;
    const response = await this.connection.sql(sqlStatement);
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Project Report Publish record', [
        'ProjectMetadataPublishRepository->insertProjectReportPublishRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].project_metadata_publish_id;
  }

  async insertSurveyAttachmentPublishRecord(data: ISurveyAttachmentPublish): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO survey_attachment_publish 
        (survey_attachment_publish_id, queue_id, event_timestamp)
      VALUES
        (${data.survey_attachment_publish_id}, ${data.queue_id}, NOW())
      RETURNING survey_attachment_publish_id;
    `;
    const response = await this.connection.sql(sqlStatement);
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Survey Attachment Publish record', [
        'ProjectMetadataPublishRepository->insertSurveyAttachmentPublishRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].project_metadata_publish_id;
  }

  async insertSurveyReportPublishRecord(data: ISurveyReportPublish): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO survey_report_publish 
        (survey_report_publish_id, queue_id, event_timestamp)
      VALUES
        (${data.survey_report_publish_id}, ${data.queue_id}, NOW())
      RETURNING survey_report_publish_id;
    `;
    const response = await this.connection.sql(sqlStatement);
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Survey Report Publish record', [
        'ProjectMetadataPublishRepository->insertSurveyReportPublishRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].survey_report_publish_id;
  }
}
