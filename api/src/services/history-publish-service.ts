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

  async insertProjectMetadataPublishRecord(data: IProjectMetadataPublish): Promise<number> {
    return this.historyRepository.insertProjectMetadataPublishRecord(data);
  }
  async insertSurveyMetadataPublishRecord(data: ISurveyMetadataPublish): Promise<number> {
    return this.historyRepository.insertSurveyMetadataPublishRecord(data);
  }
  async insertOccurrenceSubmissionPublishRecord(data: IOccurrenceSubmissionPublish): Promise<number> {
    return this.historyRepository.insertOccurrenceSubmissionPublishRecord(data);
  }
  async insertProjectAttachmentPublishRecord(data: IProjectAttachmentPublish): Promise<number> {
    return this.historyRepository.insertProjectAttachmentPublishRecord(data);
  }
  async insertProjectReportPublishRecord(data: IProjectReportPublish): Promise<number> {
    return this.historyRepository.insertProjectReportPublishRecord(data);
  }
  async insertSurveyAttachmentPublishRecord(data: ISurveyAttachmentPublish): Promise<number> {
    return this.historyRepository.insertSurveyAttachmentPublishRecord(data);
  }
  async insertSurveyReportPublishRecord(data: ISurveyReportPublish): Promise<number> {
    return this.historyRepository.insertSurveyReportPublishRecord(data);
  }
}
