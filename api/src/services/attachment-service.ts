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

  async addSecurityRulesToProjectAttachments(securityIds: number[], attachmentIds: number[]): Promise<void> {
    await Promise.all(attachmentIds.map((attachmentId) => (
      this.addSecurityRulesToProjectAttachment(securityIds, attachmentId)
    )));
  }

  async removeSecurityRuleFromProjectAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    await Promise.all(securityIds.map((securityId) => (
      this.attachmentRepository.removeSecurityRuleFromProjectAttachment(securityId, attachmentId)
    )))
  }

  async removeAllSecurityFromProjectAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.removeAllSecurityFromProjectAttachment(attachmentId);
  }

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
    return this.attachmentRepository.getSurveyAttachmentAuthors(attachmentId);
  }
  async getSurveyReportAttachmentSecurityReasons(reportAttachmentId: number): Promise<ISurveyReportSecurityReason[]> {
    return this.attachmentRepository.getSurveyReportAttachmentSecurityReasons(reportAttachmentId);
  }

  async getSurveyAttachmentSecurityReasons(attachmentId: number): Promise<ISurveyAttachmentSecurityReason[]> {
    return this.attachmentRepository.getSurveyAttachmentSecurityReasons(attachmentId);
  }
}
