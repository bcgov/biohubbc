import { IDBConnection } from '../database/db';
import {
  AttachmentRepository,
  IGetAttachmentAuthor,
  IGetAttachmentSecurityReason,
  IGetProjectAttachment,
  IGetProjectReportAttachment,
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

  async getProjectAttachmentsWithStatus(projectId: number): Promise<any> {
    return Promise.resolve();
  }

  async getProjectReportAttachment(projectId: number, attachmentId: number): Promise<IGetProjectReportAttachment> {
    const response = this.attachmentRepository.getProjectReportAttachmentById(projectId, attachmentId);

    console.log('getProjectReportAttachment: ', response);
    return response;
  }

  async getProjectAttachmentAuthors(attachmentId: number): Promise<IGetAttachmentAuthor[]> {
    return this.attachmentRepository.getProjectAttachmentAuthors(attachmentId);
  }

  async getProjectAttachmentSecurityRules(attachmentId: number): Promise<IGetAttachmentSecurityReason[]> {
    return this.attachmentRepository.getProjectAttachmentSecurityReasons(attachmentId);
  }

  async addSecurityToProjectAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityToProjectAttachments(securityIds, attachmentId);
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

  async addSecurityToProjectReportAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityToProjectReportAttachments(securityIds, attachmentId);
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
    const actions: Promise<void>[] = []
    attachments.forEach(item => {
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
    const actions: Promise<void>[] = []
    attachments.forEach(item => {
      if (item.type === 'Report') {
        // actions.push(this.addSecurityToReportAttachment(securityIds, item.id));
        // actions.push(this.addSecurityReviewToReportAttachment(item.id));
      } else {
        // actions.push(this.addSecurityToAttachment(securityIds, item.id));
        // actions.push(this.addSecurityReviewToAttachment(item.id));
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
}
