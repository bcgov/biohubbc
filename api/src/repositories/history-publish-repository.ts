import SQL from "sql-template-strings";
import { ApiExecuteSQLError } from "../errors/api-error";
import { BaseRepository } from "./base-repository";

export interface IProjectMetadataPublish {
  project_id: number
  queue_id: number
}

export interface ISurveyMetadataPublish {
  survey_id: number
  queue_id: number
}

export interface IOccurrenceSubmissionPublish {
  occurrence_submission_id: number
  queue_id: number
}

export class HistoryPublishRepository extends BaseRepository {

  async insertProjectMetadataRecord(data: IProjectMetadataPublish): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO project_metadata_publish 
        (project_id, queue_id, event_timestamp)
      VALUES
        (${data.project_id}, ${data.queue_id}, NOW())
      RETURNING project_metadata_publish_id;
    `;
    const response = await this.connection.sql(sqlStatement);
    if (response.rowCount < 1) {
      throw new ApiExecuteSQLError('Failed to insert Project Metadata Publish record', [
        'ProjectMetadataPublishRepository->insertProjectMetadataRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].project_metadata_publish_id
  }

  async insertSurveyMetadataRecord(data: ISurveyMetadataPublish): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO survey_metadata_publish 
        (survey_id, queue_id, event_timestamp)
      VALUES
        (${data.survey_id}, ${data.queue_id}, NOW())
      RETURNING survey_metadata_publish_id;
    `;
    const response = await this.connection.sql(sqlStatement);
    if (response.rowCount < 1) {
      throw new ApiExecuteSQLError('Failed to insert Survey Metadata Publish record', [
        'ProjectMetadataPublishRepository->insertSurveyMetadataRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].project_metadata_publish_id
  }

  async insertOccurrenceSubmissionRecord(data: IOccurrenceSubmissionPublish): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO occurrence_submission_publish 
        (occurrence_submission_id, queue_id, event_timestamp)
      VALUES
        (${data.occurrence_submission_id}, ${data.queue_id}, NOW())
      RETURNING occurrence_submission_publish_id;
    `;
    const response = await this.connection.sql(sqlStatement);
    if (response.rowCount < 1) {
      throw new ApiExecuteSQLError('Failed to insert Occurrence Submission Publish record', [
        'ProjectMetadataPublishRepository->insertOccurrenceSubmissionRecord',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].project_metadata_publish_id
  }
}