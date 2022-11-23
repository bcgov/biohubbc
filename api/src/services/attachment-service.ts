import { IDBConnection } from '../database/db';
import {
  AttachmentRepository,
  IGetAttachmentAuthor,
  IGetAttachmentSecurityReason,
  IGetProjectAttachment,
  IGetProjectReportAttachment,
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

  async getProjectReportAttachments(projectId: number): Promise<IGetProjectReportAttachment[]> {
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

  async getProjectReportAttachment(projectId: number, attachmentId: number): Promise<IGetProjectReportAttachment> {
    return this.attachmentRepository.getProjectReportAttachmentById(projectId, attachmentId);
  }

  async getProjectAttachmentAuthors(attachmentId: number): Promise<IGetAttachmentAuthor[]> {
    return this.attachmentRepository.getProjectAttachmentAuthors(attachmentId);
  }

  async getProjectAttachmentSecurityRules(attachmentId: number): Promise<IGetAttachmentSecurityReason[]> {
    return this.attachmentRepository.getProjectAttachmentSecurityReasons(attachmentId);
  }

  async addSecurityToAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityToAttachments(securityIds, attachmentId);
  }

  /**
   * Function to run array of SQL queries to delete Project Attachments
   *
   * @param {number[]} securityIds
   * @param {number} attachmentId
   * @return {*}  {Promise<{ project_attachment_persecution_id: number }[]>}
   * @memberof AttachmentService
   */
  async removeSecurityFromProjectAttachment(
    securityIds: number[],
    attachmentId: number
  ): Promise<{ project_attachment_persecution_id: number }[]> {
    const result = [];
    for (const securityId of securityIds) {
      const response = await this.attachmentRepository.removeSecurityFromProjectAttachment(securityId, attachmentId);
      result.push(response);
    }
    return result;
  }

  /**
   * Function to run array of SQL queries to delete Survey Attachments
   *
   * @param {number[]} securityIds
   * @param {number} attachmentId
   * @return {*}  {Promise<{ survey_attachment_persecution_id: number }[]>}
   * @memberof AttachmentService
   */
  async removeSecurityFromSurveyAttachment(
    securityIds: number[],
    attachmentId: number
  ): Promise<{ survey_attachment_persecution_id: number }[]> {
    const result = [];
    for (const securityId of securityIds) {
      const response = await this.attachmentRepository.removeSecurityFromSurveyAttachment(securityId, attachmentId);
      result.push(response);
    }
    return result;
  }

  async addSecurityToReportAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityToReportAttachments(securityIds, attachmentId);
  }

  /**
   * Function to run array of SQL queries to delete Project Report Attachments
   *
   * @param {number[]} securityIds
   * @param {number} attachmentId
   * @return {*}  {Promise<{ project_report_persecution_id: number }[]>}
   * @memberof AttachmentService
   */
  async removeSecurityFromProjectReportAttachment(
    securityIds: number[],
    attachmentId: number
  ): Promise<{ project_report_persecution_id: number }[]> {
    const result = [];
    for (const securityId of securityIds) {
      const response = await this.attachmentRepository.removeSecurityFromProjectReportAttachment(
        securityId,
        attachmentId
      );
      result.push(response);
    }
    return result;
  }

  /**
   * Function to run array of SQL queries to delete Survey Report Attachments
   *
   * @param {number[]} securityIds
   * @param {number} attachmentId
   * @return {*}  {Promise<{ survey_report_persecution_id: number }[]>}
   * @memberof AttachmentService
   */
  async removeSecurityFromSurveyReportAttachment(
    securityIds: number[],
    attachmentId: number
  ): Promise<{ survey_report_persecution_id: number }[]> {
    const result = [];
    for (const securityId of securityIds) {
      const response = await this.attachmentRepository.removeSecurityFromSurveyReportAttachment(
        securityId,
        attachmentId
      );
      result.push(response);
    }
    return result;
  }

  async addSecurityToAttachments(securityIds: number[], attachmentIds: number[]): Promise<void[]> {
    const promises = attachmentIds.map((item) => this.addSecurityToAttachment(securityIds, item));

    const results = await Promise.all(promises);

    return results;
  }

  async addSecurityToReportAttachments(securityIds: number[], attachmentIds: number[]): Promise<void[]> {
    const promises = attachmentIds.map((item) => this.addSecurityToReportAttachment(securityIds, item));

    const results = await Promise.all(promises);

    return results;
  }

  async addSecurityToAllAttachments(securityIds: number[], attachments: IAttachmentType[]): Promise<void[]> {
    const actions: Promise<void>[] = [];
    attachments.forEach((item) => {
      if (item.type === 'Report') {
        actions.push(this.addSecurityToReportAttachment(securityIds, item.id));
        actions.push(this.addSecurityReviewToReportAttachment(item.id));
      } else {
        actions.push(this.addSecurityToAttachment(securityIds, item.id));
        actions.push(this.addSecurityReviewToAttachment(item.id));
      }
    });

    const results = await Promise.all(actions);

    return results;
  }

  async addSecurityReviewToReportAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToReportAttachment(attachmentId);
  }

  async addSecurityReviewToAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToAttachment(attachmentId);
  }
}
