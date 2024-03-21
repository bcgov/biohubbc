import { IDBConnection } from '../database/db';
import {
  HistoryPublishRepository,
  ISurveyAttachmentPublish,
  ISurveyMetadataPublish,
  ISurveyReportPublish,
  SurveyAttachmentPublish,
  SurveyMetadataPublish,
  SurveyReportPublish
} from '../repositories/history-publish-repository';
import { DBService } from './db-service';

export class HistoryPublishService extends DBService {
  historyRepository: HistoryPublishRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.historyRepository = new HistoryPublishRepository(connection);
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
}
