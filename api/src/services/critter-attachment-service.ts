import { CritterCaptureAttachmentRecord } from '../database-models/critter_capture_attachment';
import { IDBConnection } from '../database/db';
import { CritterAttachmentRepository } from '../repositories/critter-attachment-repository';
import {
  CritterCaptureAttachmentPayload,
  CritterMortalityAttachmentPayload
} from '../repositories/critter-attachment-repository.interface';
import { DBService } from './db-service';

/**
 * Attachment service for accessing Critter Attachments.
 *
 * @export
 * @class AttachmentService
 * @extends {DBService}
 */
export class CritterAttachmentService extends DBService {
  attachmentRepository: CritterAttachmentRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.attachmentRepository = new CritterAttachmentRepository(connection);
  }

  /**
   * Insert Critter Capture Attachment.
   *
   * @param {CritterCaptureAttachmentPayload} payload
   * @return {*} {Promise<{critter_capture_attachment_id: number; key: string}>}
   */
  async upsertCritterCaptureAttachment(
    payload: CritterCaptureAttachmentPayload
  ): Promise<{ critter_capture_attachment_id: number; key: string }> {
    return this.attachmentRepository.upsertCritterCaptureAttachment(payload);
  }

  /**
   * Upsert Critter Mortality Attachment.
   *
   * @param {CritterMortalityAttachmentPayload} payload
   * @return {*} {Promise<{critter_mortality_attachment_id: number; key: string}>}
   */
  async upsertCritterMortalityAttachment(
    payload: CritterMortalityAttachmentPayload
  ): Promise<{ critter_mortality_attachment_id: number; key: string }> {
    return this.attachmentRepository.upsertCritterMortalityAttachment(payload);
  }

  /**
   * Get all Attachments for a Critterbase Critter ID.
   *
   * TODO: Include mortality attachments.
   *
   * @param {number} critterId - SIMS Critter ID
   * @return {*} {Promise<{captureAttachments: CritterCaptureAttachmentRecord[]}>}
   */
  async getAllCritterAttachments(critterId: number): Promise<{ captureAttachments: CritterCaptureAttachmentRecord[] }> {
    const [captureAttachments] = await Promise.all([
      this.attachmentRepository.getCaptureAttachmentsByCritterId(critterId)
    ]);
    return { captureAttachments };
  }
}
