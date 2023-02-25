import { IDBConnection } from '../database/db';
import {
  HistoryPublishRepository,
  IOccurrenceSubmissionPublish,
  IProjectAttachmentPublish,
  IProjectMetadataPublish,
  IProjectReportPublish,
  ISurveyAttachmentPublish,
  ISurveyMetadataPublish,
  ISurveyReportPublish
} from '../repositories/history-publish-repository';
import { DBService } from './db-service';

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
}
