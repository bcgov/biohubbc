import { IDBConnection } from '../database/db';
import {
  AttachmentRepository,
  IGetAttachmentAuthor,
  IGetProjectAttachment,
  IGetProjectAttachmentSecurityReason,
  IGetProjectReportSecurityReason,
  IGetReportAttachment,
  IGetSurveyAttachmentSecurityReason,
  IGetSurveyReportSecurityReason,
  WithSecurityRuleCount
} from '../repositories/attachment-repository';
import { DBService } from './db-service';

export interface IAttachmentType {
  id: number;
  type: 'Report' | 'Other';
}

export class AttachmentService extends DBService {
  attachmentRepository: AttachmentRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.attachmentRepository = new AttachmentRepository(connection);
  }

  async getProjectAttachments(projectId: number): Promise<IGetProjectAttachment[]> {
    return this.attachmentRepository.getProjectAttachments(projectId);
  }

  async getProjectReportAttachments(projectId: number): Promise<IGetReportAttachment[]> {
    return this.attachmentRepository.getProjectReportAttachments(projectId);
  }

  async getProjectAttachmentsWithSecurityCounts(
    projectId: number
  ): Promise<WithSecurityRuleCount<IGetProjectAttachment>[]> {
    return this.attachmentRepository.getProjectAttachmentsWithSecurityCounts(projectId);
  }

  async getProjectReportAttachmentsWithSecurityCounts(
    projectId: number
  ): Promise<WithSecurityRuleCount<IGetProjectAttachment>[]> {
    return this.attachmentRepository.getProjectReportAttachmentsWithSecurityCounts(projectId);
  }

  async getProjectReportAttachment(projectId: number, attachmentId: number): Promise<IGetReportAttachment> {
    return this.attachmentRepository.getProjectReportAttachmentById(projectId, attachmentId);
  }

  async getProjectAttachmentAuthors(attachmentId: number): Promise<IGetAttachmentAuthor[]> {
    return this.attachmentRepository.getProjectAttachmentAuthors(attachmentId);
  }

  async getProjectReportSecurityReasons(attachmentId: number): Promise<IGetProjectReportSecurityReason[]> {
    return this.attachmentRepository.getProjectReportSecurityReasons(attachmentId);
  }

  async getProjectAttachmentSecurityReasons(attachmentId: number): Promise<IGetProjectAttachmentSecurityReason[]> {
    return this.attachmentRepository.getProjectAttachmentSecurityReasons(attachmentId);
  }

  async addSecurityToProjectAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityToProjectAttachments(securityIds, attachmentId);
  }

  async addSecurityToSurveyAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityToSurveyAttachments(securityIds, attachmentId);
  }

  async removeAllSecurityFromAProjectAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.removeAllSecurityFromAProjectAttachment(attachmentId);
  }

  async removeAllSecurityFromAProjectReportAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.removeAllSecurityFromAProjectReportAttachment(attachmentId);
  }

  async removeAllSecurityFromASurveyAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.removeAllSecurityFromASurveyAttachment(attachmentId);
  }

  async removeAllSecurityFromASurveyReportAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.removeAllSecurityFromASurveyReportAttachment(attachmentId);
  }

  /**
   * Function to run array of SQL queries to delete Project Attachments
   *
   * @param {number[]} securityIds
   * @param {number} attachmentId
   * @return {*}  {Promise<{ project_attachment_persecution_id: number }[]>}
   * @memberof AttachmentService
   */
  async removeSecurityFromProjectAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    for (const securityId of securityIds) {
      await this.attachmentRepository.removeSecurityFromProjectAttachment(securityId, attachmentId);
    }
  }

  /**
   * Function to run array of SQL queries to delete Survey Attachments
   *
   * @param {number[]} securityIds
   * @param {number} attachmentId
   * @return {*}  {Promise<{ survey_attachment_persecution_id: number }[]>}
   * @memberof AttachmentService
   */
  async removeSecurityFromSurveyAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    for (const securityId of securityIds) {
      await this.attachmentRepository.removeSecurityFromSurveyAttachment(securityId, attachmentId);
    }
  }

  async addSecurityToProjectReportAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityToProjectReportAttachments(securityIds, attachmentId);
  }

  async addSecurityToSurveyReportAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityToSurveyReportAttachments(securityIds, attachmentId);
  }

  /**
   * Function to run array of SQL queries to delete Project Report Attachments
   *
   * @param {number[]} securityIds
   * @param {number} attachmentId
   * @return {*}  {Promise<{ project_report_persecution_id: number }[]>}
   * @memberof AttachmentService
   */
  async removeSecurityFromProjectReportAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    for (const securityId of securityIds) {
      await this.attachmentRepository.removeSecurityFromProjectReportAttachment(securityId, attachmentId);
    }
  }

  /**
   * Delete all security for Project Report Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentService
   */
  async removeAllSecurityFromProjectReportAttachment(attachmentId: number): Promise<void> {
    await this.attachmentRepository.removeAllSecurityFromProjectReportAttachment(attachmentId);
  }

  /**
   * Delete all security for Project Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentService
   */
  async removeAllSecurityFromProjectAttachment(attachmentId: number): Promise<void> {
    await this.attachmentRepository.removeAllSecurityFromProjectAttachment(attachmentId);
  }

  /**
   * Delete all security for Survey Report Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentService
   */
  async removeAllSecurityFromSurveyReportAttachment(attachmentId: number): Promise<void> {
    await this.attachmentRepository.removeAllSecurityFromSurveyReportAttachment(attachmentId);
  }

  /**
   * Delete all security for Survey Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentService
   */
  async removeAllSecurityFromSurveyAttachment(attachmentId: number): Promise<void> {
    await this.attachmentRepository.removeAllSecurityFromSurveyAttachment(attachmentId);
  }

  /**
   * Function to run array of SQL queries to delete Survey Report Attachments
   *
   * @param {number[]} securityIds
   * @param {number} attachmentId
   * @return {*}  {Promise<{ survey_report_persecution_id: number }[]>}
   * @memberof AttachmentService
   */
  async removeSecurityFromSurveyReportAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    for (const securityId of securityIds) {
      await this.attachmentRepository.removeSecurityFromSurveyReportAttachment(securityId, attachmentId);
    }
  }

  async addSecurityToAttachments(securityIds: number[], attachmentIds: number[]): Promise<void[]> {
    const promises = attachmentIds.map((item) => this.addSecurityToProjectAttachment(securityIds, item));

    const results = await Promise.all(promises);

    return results;
  }

  async addSecurityToReportAttachments(securityIds: number[], attachmentIds: number[]): Promise<void[]> {
    const promises = attachmentIds.map((item) => this.addSecurityToProjectReportAttachment(securityIds, item));

    const results = await Promise.all(promises);

    return results;
  }

  async addSecurityToSurveyReportAttachments(securityIds: number[], attachmentIds: number[]): Promise<void[]> {
    // const promises = attachmentIds.map((item) => this.addSecurityToProjectReportAttachment(securityIds, item));

    const results = await Promise.all([]);

    return results;
  }

  async addSecurityToProjectAttachments(securityIds: number[], attachments: IAttachmentType[]): Promise<void[]> {
    const actions: Promise<void>[] = [];
    attachments.forEach((item) => {
      console.log('________________');
      console.log(item);
      if (item.type === 'Report') {
        actions.push(this.addSecurityToProjectReportAttachment(securityIds, item.id));
        actions.push(this.addSecurityReviewToProjectReportAttachment(item.id));
      } else {
        actions.push(this.addSecurityToProjectAttachment(securityIds, item.id));
        actions.push(this.addSecurityReviewToProjectAttachment(item.id));
      }
    });

    const results = await Promise.all(actions);

    return results;
  }

  async addSecurityToSurveyAttachments(securityIds: number[], attachments: IAttachmentType[]): Promise<void[]> {
    const actions: Promise<void>[] = [];
    attachments.forEach((item) => {
      if (item.type === 'Report') {
        actions.push(this.addSecurityToSurveyReportAttachment(securityIds, item.id));
        actions.push(this.addSecurityReviewToSurveyReportAttachment(item.id));
      } else {
        actions.push(this.addSecurityToSurveyAttachment(securityIds, item.id));
        actions.push(this.addSecurityReviewToSurveyAttachment(item.id));
      }
    });

    const results = await Promise.all(actions);

    return results;
  }

  async addSecurityReviewToProjectReportAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToProjectReportAttachment(attachmentId);
  }

  async addSecurityReviewToProjectAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToProjectAttachment(attachmentId);
  }

  async addSecurityReviewToSurveyReportAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToSurveyReportAttachment(attachmentId);
  }

  async addSecurityReviewToSurveyAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToSurveyAttachment(attachmentId);
  }

  async getSurveyReportAttachment(projectId: number, attachmentId: number): Promise<IGetReportAttachment> {
    return this.attachmentRepository.getSurveyReportAttachmentById(projectId, attachmentId);
  }

  async getSurveyAttachmentAuthors(attachmentId: number): Promise<IGetAttachmentAuthor[]> {
    return this.attachmentRepository.getSurveyAttachmentAuthors(attachmentId);
  }
  async getSurveyReportSecurityReasons(attachmentId: number): Promise<IGetSurveyReportSecurityReason[]> {
    return this.attachmentRepository.getSurveyReportSecurityReasons(attachmentId);
  }

  async getSurveyAttachmentSecurityReasons(attachmentId: number): Promise<IGetSurveyAttachmentSecurityReason[]> {
    return this.attachmentRepository.getSurveyAttachmentSecurityReasons(attachmentId);
  }
}
