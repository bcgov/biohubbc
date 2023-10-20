import { IDBConnection } from '../database/db';
import {
  HistoryPublishRepository,
  IOccurrenceSubmissionPublish,
  IProjectAttachmentPublish,
  IProjectMetadataPublish,
  IProjectReportPublish,
  ISummarySubmissionPublish,
  ISurveyAttachmentPublish,
  ISurveyMetadataPublish,
  ISurveyReportPublish,
  OccurrenceSubmissionPublish,
  ProjectAttachmentPublish,
  ProjectMetadataPublish,
  ProjectReportPublish,
  PublishStatus,
  SurveyAttachmentPublish,
  SurveyMetadataPublish,
  SurveyReportPublish,
  SurveySummarySubmissionPublish
} from '../repositories/history-publish-repository';
import { DBService } from './db-service';
import { SummaryService } from './summary-service';

export class HistoryPublishService extends DBService {
  historyRepository: HistoryPublishRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.historyRepository = new HistoryPublishRepository(connection);
  }

  /**
   * Inserts a Project Metadata Publish record for a given queue and project id
   * and returns an id
   * @param {IProjectMetadataPublish} data
   * @returns {*} {Promise<number>}
   * @memberof HistoryPublishRepository
   */
  async insertProjectMetadataPublishRecord(data: IProjectMetadataPublish): Promise<number> {
    return this.historyRepository.insertProjectMetadataPublishRecord(data);
  }

  /**
   * Inserts a Survey Metadata Publish record for a given queue and survey id
   * and returns an id
   * @param {ISurveyMetadataPublish} data
   * @returns {*} {Promise<number>}
   * @memberof HistoryPublishRepository
   */
  async insertSurveyMetadataPublishRecord(data: ISurveyMetadataPublish): Promise<number> {
    return this.historyRepository.insertSurveyMetadataPublishRecord(data);
  }

  /**
   * Inserts a Occurrence Submission Publish record for a given queue and occurrence id
   * and returns an id
   * @param {IOccurrenceSubmissionPublish} data
   * @returns {*} {Promise<number>}
   * @memberof HistoryPublishRepository
   */
  async insertOccurrenceSubmissionPublishRecord(data: IOccurrenceSubmissionPublish): Promise<number> {
    return this.historyRepository.insertOccurrenceSubmissionPublishRecord(data);
  }

  /**
   * Inserts a Project Attachment Publish record for a given queue and project id
   * and returns an id
   * @param {IProjectAttachmentPublish} data
   * @returns {*} {Promise<number>}
   * @memberof HistoryPublishRepository
   */
  async insertProjectAttachmentPublishRecord(
    data: IProjectAttachmentPublish
  ): Promise<{
    project_attachment_publish_id: number;
  }> {
    return this.historyRepository.insertProjectAttachmentPublishRecord(data);
  }

  /**
   * Inserts a Project Report Publish record for a given queue and project id
   * and returns an id
   * @param {IProjectReportPublish} data
   * @returns {*} {Promise<number>}
   * @memberof HistoryPublishRepository
   */
  async insertProjectReportPublishRecord(
    data: IProjectReportPublish
  ): Promise<{
    project_report_publish_id: number;
  }> {
    return this.historyRepository.insertProjectReportPublishRecord(data);
  }

  /**
   * Inserts a Survey Attachment Publish record for a given queue and survey id
   * and returns an id
   * @param {ISurveyAttachmentPublish} data
   * @returns {*} {Promise<number>}
   * @memberof HistoryPublishRepository
   */
  async insertSurveyAttachmentPublishRecord(
    data: ISurveyAttachmentPublish
  ): Promise<{
    survey_attachment_publish_id: number;
  }> {
    return this.historyRepository.insertSurveyAttachmentPublishRecord(data);
  }

  /**
   * Inserts a Survey Report Publish record for a given queue and survey id
   * and returns an id
   * @param {ISurveyReportPublish} data
   * @returns {*} {Promise<number>}
   * @memberof HistoryPublishRepository
   */
  async insertSurveyReportPublishRecord(data: ISurveyReportPublish): Promise<{ survey_report_publish_id: number }> {
    return this.historyRepository.insertSurveyReportPublishRecord(data);
  }

  /**
   * Inserts a record into `survey_summary_submission_publish` for a given artifact and summary id
   * and returns an id
   *
   * @param {ISummarySubmissionPublish} data
   * @return {*}  {Promise<{
   *     survey_summary_submission_publish_id: number;
   *   }>}
   * @memberof HistoryPublishService
   */
  async insertSurveySummaryPublishRecord(
    data: ISummarySubmissionPublish
  ): Promise<{
    survey_summary_submission_publish_id: number;
  }> {
    return this.historyRepository.insertSurveySummaryPublishRecord(data);
  }

  /**
   * Gets a record from `project_metadata_publish` for a given project id, if one exists.
   *
   * @param {IProjectMetadataPublish} data
   * @return {*}  {(Promise<ProjectMetadataPublish | null>)}
   * @memberof HistoryPublishRepository
   */
  async getProjectMetadataPublishRecord(projectId: number): Promise<ProjectMetadataPublish | null> {
    return this.historyRepository.getProjectMetadataPublishRecord(projectId);
  }

  /**
   * Gets a record from `survey_metadata_publish` for a given survey id, if one exists.
   *
   * @param {ISurveyMetadataPublish} data
   * @return {*}  {(Promise<SurveyMetadataPublish | null>)}
   * @memberof HistoryPublishRepository
   */
  async getSurveyMetadataPublishRecord(surveyId: number): Promise<SurveyMetadataPublish | null> {
    return this.historyRepository.getSurveyMetadataPublishRecord(surveyId);
  }

  /**
   * Gets a record from `occurrence_submission_publish` for a given occurrence id, if one exists.
   *
   * @param {IOccurrenceSubmissionPublish} data
   * @return {*}  {(Promise<OccurrenceSubmissionPublish | null>)}
   * @memberof HistoryPublishRepository
   */
  async getOccurrenceSubmissionPublishRecord(
    occurrenceSubmissionId: number
  ): Promise<OccurrenceSubmissionPublish | null> {
    return this.historyRepository.getOccurrenceSubmissionPublishRecord(occurrenceSubmissionId);
  }

  /**
   * Gets a record from `project_attachment_publish` for a given artifact and summary id, if one exists.
   *
   * @param {IProjectAttachmentPublish} data
   * @return {*}  {(Promise<ProjectAttachmentPublish | null>)}
   * @memberof HistoryPublishRepository
   */
  async getProjectAttachmentPublishRecord(projectAttachmentId: number): Promise<ProjectAttachmentPublish | null> {
    return this.historyRepository.getProjectAttachmentPublishRecord(projectAttachmentId);
  }

  /**
   * Gets a record from `project_report_publish` for a given project id, if one exists.
   *
   * @param {IProjectReportPublish} data
   * @return {*}  {(Promise<ProjectReportPublish | null>)}
   * @memberof HistoryPublishRepository
   */
  async getProjectReportPublishRecord(projectReportAttachmentId: number): Promise<ProjectReportPublish | null> {
    return this.historyRepository.getProjectReportPublishRecord(projectReportAttachmentId);
  }

  /**
   * Gets a record from `survey_attachment_publish` for a given project id, if one exists.
   *
   * @param {ISurveyAttachmentPublish} data
   * @return {*}  {(Promise<SurveyAttachmentPublish | null>)}
   * @memberof HistoryPublishRepository
   */
  async getSurveyAttachmentPublishRecord(surveyAttachmentId: number): Promise<SurveyAttachmentPublish | null> {
    return this.historyRepository.getSurveyAttachmentPublishRecord(surveyAttachmentId);
  }

  /**
   * Gets a record from `survey_report_publish` for a given survey id, if one exists.
   *
   * @param {ISurveyReportPublish} data
   * @return {*}  {(Promise<SurveyReportPublish | null>)}
   * @memberof HistoryPublishRepository
   */
  async getSurveyReportPublishRecord(surveyReportAttachmentId: number): Promise<SurveyReportPublish | null> {
    return this.historyRepository.getSurveyReportPublishRecord(surveyReportAttachmentId);
  }

  /**
   * Gets a record from `survey_summary_submission_publish` for a given survey id, if one exists.
   *
   * @param {number} surveySummarySubmissionId
   * @return {*}  {(Promise<SurveySummarySubmissionPublish | null>)}
   * @memberof HistoryPublishService
   */
  async getSurveySummarySubmissionPublishRecord(
    surveySummarySubmissionId: number
  ): Promise<SurveySummarySubmissionPublish | null> {
    return this.historyRepository.getSurveySummarySubmissionPublishRecord(surveySummarySubmissionId);
  }

  /**
   * Deletes a record from `survey_attachment_publish` for a given attachment id.
   *
   * @param {number} surveyAttachmentId
   * @return {*}  {Promise<void>}
   * @memberof HistoryPublishService
   */
  async deleteSurveyAttachmentPublishRecord(surveyAttachmentId: number): Promise<void> {
    return this.historyRepository.deleteSurveyAttachmentPublishRecord(surveyAttachmentId);
  }

  /**
   * Deletes a record from `survey_report_publish` for a given attachment id.
   *
   * @param {number} surveyReportAttachmentId
   * @return {*}  {Promise<void>}
   * @memberof HistoryPublishService
   */
  async deleteSurveyReportAttachmentPublishRecord(surveyReportAttachmentId: number): Promise<void> {
    return this.historyRepository.deleteSurveyReportAttachmentPublishRecord(surveyReportAttachmentId);
  }

  /**
   *  Deletes a record from `project_attachment_publish` for a given attachment id.
   *
   * @param {number} surveyAttachmentId
   * @return {*}  {Promise<void>}
   * @memberof HistoryPublishService
   */
  async deleteProjectAttachmentPublishRecord(surveyAttachmentId: number): Promise<void> {
    return this.historyRepository.deleteProjectAttachmentPublishRecord(surveyAttachmentId);
  }

  /**
   * Deletes a record from `project_report_publish` for a given attachment id.
   *
   * @param {number} surveyReportAttachmentId
   * @return {*}  {Promise<void>}
   * @memberof HistoryPublishService
   */
  async deleteProjectReportAttachmentPublishRecord(surveyReportAttachmentId: number): Promise<void> {
    return this.historyRepository.deleteProjectReportAttachmentPublishRecord(surveyReportAttachmentId);
  }

  /**
   * Returns the publish status of a given survey's attachments metadata
   *
   * @param {number} surveyId
   * @return {*}  {Promise<PublishStatus>}
   * @memberof HistoryPublishService
   */
  async surveyAttachmentsPublishStatus(surveyId: number): Promise<PublishStatus> {
    const attachmentsPublishData = await this.historyRepository.getSurveyAttachmentsWithPublishData(surveyId);

    if (attachmentsPublishData.length === 0) {
      return PublishStatus.NO_DATA;
    }

    if (attachmentsPublishData.some((attachment) => attachment.survey_attachment_publish_id !== null)) {
      return PublishStatus.SUBMITTED;
    }

    return PublishStatus.UNSUBMITTED;
  }

  /**
   * Returns the publish status of a given survey's reports metadata
   *
   * @param {number} surveyId
   * @return {*}  {Promise<PublishStatus>}
   * @memberof HistoryPublishService
   */
  async surveyReportsPublishStatus(surveyId: number): Promise<PublishStatus> {
    const reportsPublishData = await this.historyRepository.getSurveyReportsWithPublishData(surveyId);

    if (reportsPublishData.length === 0) {
      return PublishStatus.NO_DATA;
    }

    if (reportsPublishData.some((attachment) => attachment.survey_report_publish_id !== null)) {
      return PublishStatus.SUBMITTED;
    }

    return PublishStatus.UNSUBMITTED;
  }

  /**
   * Returns the publish status of a given survey's observations
   *
   * @param {number} surveyId
   * @return {*}  {Promise<PublishStatus>}
   * @memberof HistoryPublishService
   */
  async observationPublishStatus(surveyId: number): Promise<PublishStatus> {
    const latestUndeletedObservationRecordId = (
      await this.historyRepository.getLatestUndeletedObservationRecordId(surveyId)
    ).rows[0]?.occurrence_submission_id;

    if (!latestUndeletedObservationRecordId) {
      return PublishStatus.NO_DATA;
    }

    const publish_record = await this.historyRepository.getOccurrenceSubmissionPublishRecord(
      latestUndeletedObservationRecordId
    );
    if (publish_record?.occurrence_submission_publish_id) {
      return PublishStatus.SUBMITTED;
    }

    return PublishStatus.UNSUBMITTED;
  }

  /**
   * Return PublishStatus of a given survey's summary results
   *
   * @param {number} surveyId
   * @return {*}  {Promise<PublishStatus>}
   * @memberof HistoryPublishService
   */
  async summaryPublishStatus(surveyId: number): Promise<PublishStatus> {
    const service = new SummaryService(this.connection);
    const latest_summary = await service.getLatestSurveySummarySubmission(surveyId);

    if (!latest_summary) {
      return PublishStatus.NO_DATA;
    }
    const publish_record = await this.historyRepository.getSurveySummarySubmissionPublishRecord(
      latest_summary.survey_summary_submission_id
    );
    if (publish_record?.survey_summary_submission_publish_id) {
      return PublishStatus.SUBMITTED;
    }

    return PublishStatus.UNSUBMITTED;
  }

  /**
   * Returns the publish status of a given project's attachments metadata
   *
   * @param {number} projectId
   * @return {*}  {Promise<PublishStatus>}
   * @memberof HistoryPublishService
   */
  async projectAttachmentsPublishStatus(projectId: number): Promise<PublishStatus> {
    const attachmentsPublishData = await this.historyRepository.getProjectAttachmentsWithPublishData(projectId);

    if (attachmentsPublishData.length === 0) {
      return PublishStatus.NO_DATA;
    }

    if (attachmentsPublishData.some((attachment) => attachment.project_attachment_publish_id !== null)) {
      return PublishStatus.SUBMITTED;
    }

    return PublishStatus.UNSUBMITTED;
  }

  /**
   * Returns the publish status of a given project's reports metadata
   *
   * @param {number} projectId
   * @return {*}  {Promise<PublishStatus>}
   * @memberof HistoryPublishService
   */
  async projectReportsPublishStatus(projectId: number): Promise<PublishStatus> {
    const attachmentsPublishData = await this.historyRepository.getProjectReportsWithPublishData(projectId);

    if (attachmentsPublishData.length === 0) {
      return PublishStatus.NO_DATA;
    }

    if (attachmentsPublishData.some((attachment) => attachment.project_report_publish_id !== null)) {
      return PublishStatus.SUBMITTED;
    }

    return PublishStatus.UNSUBMITTED;
  }
}
