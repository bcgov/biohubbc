import { IDBConnection } from '../database/db';
import {
  AttachmentRepository,
  IReportAttachmentAuthor,
  IProjectAttachment,
  IProjectAttachmentSecurityReason,
  IProjectReportAttachment,
  IProjectReportSecurityReason,
  ISurveyAttachment,
  ISurveyAttachmentSecurityReason,
  ISurveyReportAttachment,
  ISurveyReportSecurityReason,
  WithSecurityRuleCount
} from '../repositories/attachment-repository';
import { DBService } from './db-service';

export interface IAttachmentType {
  id: number;
  type: 'Report' | 'Other';
}

/**
 * @TODO make sure all repo names match their service names
 * @TODO replace all function-level `await`s with a return.
 */
export class AttachmentService extends DBService {
  attachmentRepository: AttachmentRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.attachmentRepository = new AttachmentRepository(connection);
  }

  async getProjectAttachments(projectId: number): Promise<IProjectAttachment[]> {
    return this.attachmentRepository.getProjectAttachments(projectId);
  }

  async getProjectAttachmentById(projectId: number, attachmentId: number): Promise<IProjectAttachment> {
    return this.attachmentRepository.getProjectAttachmentById(projectId, attachmentId);
  }

  async getProjectAttachmentsWithSecurityCounts(
    projectId: number
  ): Promise<WithSecurityRuleCount<IProjectAttachment>[]> {
    return this.attachmentRepository.getProjectAttachmentsWithSecurityCounts(projectId);
  }

  async getProjectAttachmentAuthors(attachmentId: number): Promise<IReportAttachmentAuthor[]> {
    return this.attachmentRepository.getProjectAttachmentAuthors(attachmentId);
  }

  async getProjectAttachmentSecurityReasons(attachmentId: number): Promise<IProjectAttachmentSecurityReason[]> {
    return this.attachmentRepository.getProjectAttachmentSecurityReasons(attachmentId);
  }

  async addSecurityRulesToProjectAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityRulesToProjectAttachment(securityIds, attachmentId);
  }

  async addSecurityRulesToProjectAttachments(securityIds: number[], attachmentIds: number[]): Promise<void[]> {
    const promises = attachmentIds.map((item) => this.addSecurityRulesToProjectAttachment(securityIds, item));

    const results = await Promise.all(promises);

    return results;
  }


  /**
   * @TODO return Promise.all
   */
  async removeSecurityRuleFromProjectAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    for (const securityId of securityIds) {
      await this.attachmentRepository.removeSecurityRuleFromProjectAttachment(securityId, attachmentId);
    }
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
   * PROJECT REPORT ATTACHMENTS
   *
   * @memberof AttachmentService
   * @type Project Report Attachments
   *
   */

  async getProjectReportAttachments(projectId: number): Promise<IProjectReportAttachment[]> {
    return this.attachmentRepository.getProjectReportAttachments(projectId);
  }

  async getProjectReportAttachmentsWithSecurityCounts(
    projectId: number
  ): Promise<WithSecurityRuleCount<IProjectReportAttachment>[]> {
    return this.attachmentRepository.getProjectReportAttachmentsWithSecurityCounts(projectId);
  }

  async getProjectReportAttachmentById(projectId: number, reportAttachmentId: number): Promise<IProjectReportAttachment> {
    return this.attachmentRepository.getProjectReportAttachmentById(projectId, reportAttachmentId);
  }

  async getProjectReportAttachmentSecurityReasons(reportAttachmentId: number): Promise<IProjectReportSecurityReason[]> {
    return this.attachmentRepository.getProjectReportAttachmentSecurityReasons(reportAttachmentId);
  }

  async addSecurityRulesToProjectReportAttachments(securityIds: number[], attachmentIds: number[]): Promise<void[]> {
    const promises = attachmentIds.map((item) => this.addSecurityRulesToProjectReportAttachment(securityIds, item));

    const results = await Promise.all(promises);

    return results;
  }

  /**
   * Function to run array of SQL queries to delete Project Report Attachments
   *
   * @param {number[]} securityIds
   * @param {number} attachmentId
   * @return {*}  {Promise<{ project_report_persecution_id: number }[]>}
   * @memberof AttachmentService
   */
  async removeSecurityRuleFromProjectReportAttachment(securityIds: number[], reportAttachmentId: number): Promise<void> {
    for (const securityId of securityIds) {
      await this.attachmentRepository.removeSecurityRuleFromProjectReportAttachment(securityId, reportAttachmentId);
    }
  }

  async removeAllSecurityFromProjectReportAttachment(reportAttachmentId: number): Promise<void> {
    await this.attachmentRepository.removeAllSecurityFromProjectReportAttachment(reportAttachmentId);
  }

  async getSurveyAttachments(surveyId: number): Promise<ISurveyAttachment[]> {
    return this.attachmentRepository.getSurveyAttachments(surveyId);
  }

  async getSurveyAttachmentsWithSecurityCounts(surveyId: number): Promise<WithSecurityRuleCount<ISurveyAttachment>[]> {
    return this.attachmentRepository.getSurveyAttachmentsWithSecurityCounts(surveyId);
  }

  async addSecurityRulesToSurveyAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityRulesToSurveyAttachment(securityIds, attachmentId);
  }

  async removeSecurityRuleFromSurveyAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    for (const securityId of securityIds) {
      await this.attachmentRepository.removeSecurityRuleFromSurveyAttachment(securityId, attachmentId);
    }
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
   * SURVEY REPORT ATTACHMENTS
   *
   * @memberof AttachmentService
   * @type Survey Report Attachments
   *
   */

  async getSurveyReportAttachments(surveyId: number): Promise<ISurveyReportAttachment[]> {
    return this.attachmentRepository.getSurveyReportAttachments(surveyId);
  }

  async getSurveyReportAttachmentsWithSecurityCounts(
    surveyId: number
  ): Promise<WithSecurityRuleCount<ISurveyReportAttachment>[]> {
    return this.attachmentRepository.getSurveyReportAttachmentsWithSecurityCounts(surveyId);
  }

  async addSecurityRulesToProjectReportAttachment(securityIds: number[], reportAttachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityRulesToProjectReportAttachment(securityIds, reportAttachmentId);
  }

  async addSecurityRulesToSurveyReportAttachment(securityIds: number[], reportAttachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityRulesToSurveyReportAttachment(securityIds, reportAttachmentId);
  }

  /**
   * Delete all security for Survey Report Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentService
   */
  async removeAllSecurityFromSurveyReportAttachment(reportAttachmentId: number): Promise<void> {
    await this.attachmentRepository.removeAllSecurityFromSurveyReportAttachment(reportAttachmentId);
  }

  /**
   * Function to run array of SQL queries to delete Survey Report Attachments
   *
   * @param {number[]} securityIds
   * @param {number} attachmentId
   * @return {*}  {Promise<{ survey_report_persecution_id: number }[]>}
   * @memberof AttachmentService
   */
  async removeSecurityRuleFromSurveyReportAttachment(securityIds: number[], reportAttachmentId: number): Promise<void> {
    for (const securityId of securityIds) {
      await this.attachmentRepository.removeSecurityRuleFromSurveyReportAttachment(securityId, reportAttachmentId);
    }
  }

  async addSecurityToProjectAttachments(securityIds: number[], attachments: IAttachmentType[]): Promise<void[]> {
    const actions: Promise<void>[] = [];
    attachments.forEach((item) => {
      if (item.type === 'Report') {
        actions.push(this.addSecurityRulesToProjectReportAttachment(securityIds, item.id));
        actions.push(this.addSecurityReviewTimeToProjectReportAttachment(item.id));
      } else {
        actions.push(this.addSecurityRulesToProjectAttachment(securityIds, item.id));
        actions.push(this.addSecurityReviewTimeToProjectAttachment(item.id));
      }
    });

    const results = await Promise.all(actions);

    return results;
  }

  async addSecurityToSurveyAttachments(securityIds: number[], attachments: IAttachmentType[]): Promise<void[]> {
    const actions: Promise<void>[] = [];
    attachments.forEach((item) => {
      if (item.type === 'Report') {
        actions.push(this.addSecurityRulesToSurveyReportAttachment(securityIds, item.id));
        actions.push(this.addSecurityReviewToSurveyReportAttachment(item.id));
      } else {
        actions.push(this.addSecurityRulesToSurveyAttachment(securityIds, item.id));
        actions.push(this.addSecurityReviewToSurveyAttachment(item.id));
      }
    });

    const results = await Promise.all(actions);

    return results;
  }

  async addSecurityReviewTimeToProjectReportAttachment(reportAttachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToProjectReportAttachment(reportAttachmentId);
  }

  async addSecurityReviewTimeToProjectAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToProjectAttachment(attachmentId);
  }

  async addSecurityReviewToSurveyReportAttachment(reportAttachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToSurveyReportAttachment(reportAttachmentId);
  }

  async addSecurityReviewToSurveyAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToSurveyAttachment(attachmentId);
  }

  async getSurveyReportAttachment(projectId: number, reportAttachmentId: number): Promise<IProjectReportAttachment> {
    return this.attachmentRepository.getSurveyReportAttachmentById(projectId, reportAttachmentId);
  }

  async getSurveyAttachmentAuthors(attachmentId: number): Promise<IReportAttachmentAuthor[]> {
    return this.attachmentRepository.getSurveyAttachmentAuthors(attachmentId);
  }
  async getSurveyReportAttachmentSecurityReasons(reportAttachmentId: number): Promise<ISurveyReportSecurityReason[]> {
    return this.attachmentRepository.getSurveyReportAttachmentSecurityReasons(reportAttachmentId);
  }

  async getSurveyAttachmentSecurityReasons(attachmentId: number): Promise<ISurveyAttachmentSecurityReason[]> {
    return this.attachmentRepository.getSurveyAttachmentSecurityReasons(attachmentId);
  }
}
