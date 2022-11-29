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

// @TODO use memberof
export class AttachmentService extends DBService {
  attachmentRepository: AttachmentRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.attachmentRepository = new AttachmentRepository(connection);
  }

  /**
   * Finds all of the project attachments for the given project ID.
   * @param {number} projectId the ID of the project
   * @returns {Promise<IProjectAttachment[]>} Promise resolving all project attachments.
   */
  async getProjectAttachments(projectId: number): Promise<IProjectAttachment[]> {
    return this.attachmentRepository.getProjectAttachments(projectId);
  }

  /**
   * Finds a project attachment by having the given project ID and attachment ID
   * @param {number} projectId the ID of the project
   * @param {number} attachmentId the ID of the attachment
   * @returns {Promise<IProjectAttachment>} Promise resolving the given project attachment
   */
  async getProjectAttachmentById(projectId: number, attachmentId: number): Promise<IProjectAttachment> {
    return this.attachmentRepository.getProjectAttachmentById(projectId, attachmentId);
  }

  /**
   * Finds all project attachments for the given project ID, including security rule counts.
   * @param {number} projectId 
   * @returns {Promise<IProjectAttachment[]>} Promise resolving all project attachments with security
   * counts.
   */
  async getProjectAttachmentsWithSecurityCounts(
    projectId: number
  ): Promise<WithSecurityRuleCount<IProjectAttachment>[]> {
    return this.attachmentRepository.getProjectAttachmentsWithSecurityCounts(projectId);
  }

  /**
   * Finds all authors belonging to the given project attachment
   * @param {number} attachmentId the ID of the attachment
   * @returns {Promise<IReportAttachmentAuthor[]>} Promise resolving all of the report authors
   */
  async getProjectReportAttachmentAuthors(attachmentId: number): Promise<IReportAttachmentAuthor[]> {
    return this.attachmentRepository.getProjectReportAttachmentAuthors(attachmentId);
  }

  /**
   * Finds all security reasons belonging to the given project attachment
   * @param {number} attachmentId the ID of the project attachment
   * @returns {Promise<IProjectAttachmentSecurityReason[]>} Promise resolving all project attachment security
   * reasons for the given attachment
   */
  async getProjectAttachmentSecurityReasons(attachmentId: number): Promise<IProjectAttachmentSecurityReason[]> {
    return this.attachmentRepository.getProjectAttachmentSecurityReasons(attachmentId);
  }

  /**
   * Attaches the given list of security rules to the specified attachment
   * @param {number[]} securityIds the array of security rule IDs to attach
   * @param {number} attachmentId the ID of the project attachment
   * @returns {Promise<void>}
   */
  async addSecurityRulesToProjectAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityRulesToProjectAttachment(securityIds, attachmentId);
  }

  /**
   * Attaches the given list of security rules to the specified list of attachments
   * @param {number[]} securityIds the array of security rule IDs to attach
   * @param {number[]} attachmentIds the array of project attachment IDs
   * @returns {Promise<void>}
   */
  async addSecurityRulesToProjectAttachments(securityIds: number[], attachmentIds: number[]): Promise<void> {
    await Promise.all(attachmentIds.map((attachmentId) => (
      this.addSecurityRulesToProjectAttachment(securityIds, attachmentId)
    )));
  }

  /**
   * Detaches the specified list of security rules from a given project attachment
   * @param {number[]} securityIds the array of security IDs to detach
   * @param {number} attachmentId the ID of the project attachment
   * @returns {Promise<void>}
   */
  async removeSecurityRuleFromProjectAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    await Promise.all(securityIds.map((securityId) => (
      this.attachmentRepository.removeSecurityRuleFromProjectAttachment(securityId, attachmentId)
    )))
  }

  /**
   * Detaches all security rules from a given project attachment
   * @param {number} attachmentId the ID of the project attachment
   * @returns {Promise<void>}
   */
  async removeAllSecurityFromProjectAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.removeAllSecurityFromProjectAttachment(attachmentId);
  }

  /**
   * Finds all of the project report attachments for the given project ID.
   * @param {number} projectId the ID of the project
   * @returns {Promise<IProjectReportAttachment[]>} Promise resolving all project report attachments.
   */
  async getProjectReportAttachments(projectId: number): Promise<IProjectReportAttachment[]> {
    return this.attachmentRepository.getProjectReportAttachments(projectId);
  }

  /**
   * Finds all project report attachments for the given project ID, including security rule counts.
   * @param {number} projectId 
   * @returns {Promise<IProjectReportAttachment[]>} Promise resolving all project report attachments with
   * security counts.
   */
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

  async addSecurityRulesToProjectReportAttachments(securityIds: number[], attachmentIds: number[]): Promise<void> {
    await Promise.all(attachmentIds.map((attachmentId) => (
      this.addSecurityRulesToProjectReportAttachment(securityIds, attachmentId)
    )));
  }

  async removeSecurityRuleFromProjectReportAttachment(securityIds: number[], reportAttachmentId: number): Promise<void> {
    await Promise.all(securityIds.map((securityId) => (
      this.attachmentRepository.removeSecurityRuleFromProjectReportAttachment(securityId, reportAttachmentId)
    )));
  }

  async removeAllSecurityFromProjectReportAttachment(reportAttachmentId: number): Promise<void> {
    return this.attachmentRepository.removeAllSecurityFromProjectReportAttachment(reportAttachmentId);
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
    await Promise.all(securityIds.map((securityId) => (
      this.attachmentRepository.removeSecurityRuleFromSurveyAttachment(securityId, attachmentId)
    )));
  }

  async removeAllSecurityFromSurveyAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.removeAllSecurityFromSurveyAttachment(attachmentId);
  }

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

  async removeAllSecurityFromSurveyReportAttachment(reportAttachmentId: number): Promise<void> {
    await this.attachmentRepository.removeAllSecurityFromSurveyReportAttachment(reportAttachmentId);
  }

  async removeSecurityRuleFromSurveyReportAttachment(securityIds: number[], reportAttachmentId: number): Promise<void> {
    await Promise.all(securityIds.map((securityId) => (
      this.attachmentRepository.removeSecurityRuleFromSurveyReportAttachment(securityId, reportAttachmentId)
    )));
  }

  async addSecurityRulesToProjectAttachmentsOrProjectReports(securityIds: number[], attachments: IAttachmentType[]): Promise<void> {
    await Promise.all(attachments.map((attachment: IAttachmentType) => {
      if (attachment.type === 'Report') {
        return Promise.all([
          this.addSecurityRulesToProjectReportAttachment(securityIds, attachment.id),
          this.addSecurityReviewTimeToProjectReportAttachment(attachment.id)
        ]);
      } else {
        return Promise.all([
          this.addSecurityRulesToProjectAttachment(securityIds, attachment.id),
          this.addSecurityReviewTimeToProjectAttachment(attachment.id)
        ]);
      }
    }));
  }

  async addSecurityRulesToSurveyAttachmentsOrSurveyReports(securityIds: number[], attachments: IAttachmentType[]): Promise<void> {
    await Promise.all(attachments.map((attachment: IAttachmentType) => {
      if (attachment.type === 'Report') {
        return Promise.all([
          this.addSecurityRulesToSurveyReportAttachment(securityIds, attachment.id),
          this.addSecurityReviewTimeToSurveyReportAttachment(attachment.id)
        ]);
      } else {
        return Promise.all([
          this.addSecurityRulesToSurveyAttachment(securityIds, attachment.id),
          this.addSecurityReviewTimeToSurveyAttachment(attachment.id)
        ]);
      }
    }));
  }

  async addSecurityReviewTimeToProjectReportAttachment(reportAttachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToProjectReportAttachment(reportAttachmentId);
  }

  async addSecurityReviewTimeToProjectAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToProjectAttachment(attachmentId);
  }

  async addSecurityReviewTimeToSurveyReportAttachment(reportAttachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToSurveyReportAttachment(reportAttachmentId);
  }

  async addSecurityReviewTimeToSurveyAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToSurveyAttachment(attachmentId);
  }

  async getSurveyReportAttachmentById(projectId: number, reportAttachmentId: number): Promise<IProjectReportAttachment> {
    return this.attachmentRepository.getSurveyReportAttachmentById(projectId, reportAttachmentId);
  }

  async getSurveyAttachmentAuthors(attachmentId: number): Promise<IReportAttachmentAuthor[]> {
    return this.attachmentRepository.getSurveyReportAttachmentAuthors(attachmentId);
  }
  async getSurveyReportAttachmentSecurityReasons(reportAttachmentId: number): Promise<ISurveyReportSecurityReason[]> {
    return this.attachmentRepository.getSurveyReportAttachmentSecurityReasons(reportAttachmentId);
  }

  async getSurveyAttachmentSecurityReasons(attachmentId: number): Promise<ISurveyAttachmentSecurityReason[]> {
    return this.attachmentRepository.getSurveyAttachmentSecurityReasons(attachmentId);
  }
}
