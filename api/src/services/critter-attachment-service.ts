import {
  CritterCaptureAttachmentModel,
  CritterCaptureAttachmentRecord
} from '../database-models/critter_capture_attachment';
import { IDBConnection } from '../database/db';
import { CritterAttachmentRepository } from '../repositories/critter-attachment-repository';
import {
  CritterCaptureAttachmentPayload,
  CritterMortalityAttachmentPayload
} from '../repositories/critter-attachment-repository.interface';
import { getS3SignedURL } from '../utils/file-utils';
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
   * Get Critter Capture Attachment S3 key.
   *
   * @param {number} surveyId - Survey ID
   * @param {number} attachmentId - Critter Capture Attachment ID
   * @return {*}  {Promise<string>}
   */
  async getCritterCaptureAttachmentS3Key(surveyId: number, attachmentId: number): Promise<string> {
    return this.attachmentRepository.getCritterCaptureAttachmentS3Key(surveyId, attachmentId);
  }

  /**
   * Upsert Critter Capture Attachment.
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
   * Delete Critter Capture Attachments.
   *
   * @param {number} surveyId - Survey ID
   * @param {number[]} deleteIds - Critter Capture Attachment ID's
   * @return {*} {Promise<string[]>} List of keys that were deleted
   *
   */
  async deleteCritterCaptureAttachments(surveyId: number, deleteIds: number[]): Promise<string[]> {
    return this.attachmentRepository.deleteCritterCaptureAttachments(surveyId, deleteIds);
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
   * Find all Attachments for a Critterbase Capture ID.
   *
   * @param {number} surveyId - Survey ID
   * @param {string} critterbaseCaptureId - Critterbase Capture ID
   * @return {*} {Promise<CritterCaptureAttachmentModel>}
   */
  async findAllCritterCaptureAttachments(
    surveyId: number,
    critterbaseCaptureId: string
  ): Promise<CritterCaptureAttachmentModel[]> {
    return this.attachmentRepository.findAllCritterCaptureAttachments(surveyId, critterbaseCaptureId);
  }

  /**
   * Find all Attachments for a Critterbase Critter ID.
   *
   * TODO: Include mortality attachments.
   *
   * @param {number} critterId - SIMS Critter ID
   * @return {*} {Promise<{captureAttachments: CritterCaptureAttachmentRecord[]}>}
   */
  async findAllCritterAttachments(
    critterId: number
  ): Promise<{ captureAttachments: CritterCaptureAttachmentRecord[] }> {
    const [captureAttachments] = await Promise.all([
      this.attachmentRepository.findCaptureAttachmentsByCritterId(critterId)
    ]);
    return { captureAttachments };
  }

  /**
   * Video file extensions that map to 'video' attachment type.
   */
  private static readonly VIDEO_EXTENSIONS = ['.mp4', '.mov', '.wmv', '.ave'];

  /**
   * Determines the attachment type (photo or video) based on the file name extension.
   *
   * @param {string | null} fileName - The file name
   * @return {*}  {'photo' | 'video'}
   */
  private static getAttachmentType(fileName: string | null): 'photo' | 'video' {
    if (!fileName) {
      return 'photo'; // Default to photo if no file name
    }

    const lowerFileName = fileName.toLowerCase();
    const lastDotIndex = lowerFileName.lastIndexOf('.');

    // If no extension found, default to photo
    if (lastDotIndex === -1 || lastDotIndex === lowerFileName.length - 1) {
      return 'photo';
    }

    const extension = lowerFileName.substring(lastDotIndex);

    if (CritterAttachmentService.VIDEO_EXTENSIONS.includes(extension)) {
      return 'video';
    }

    // Default to photo for image extensions or unknown extensions
    return 'photo';
  }

  /**
   * Transforms capture attachment records to match the API schema.
   *
   * @param {CritterCaptureAttachmentRecord[]} attachments - The capture attachment records
   * @return {*}  {Promise<Array<{attachment_id: number; attachment_type: 'photo' | 'video'; attachment_url: string; critterbase_capture_id: string; critter_capture_attachment_id: number; file_name: string | null; file_size: number | null; file_type: string; key: string}>>}
   */
  async transformCaptureAttachmentsForResponse(
    attachments: CritterCaptureAttachmentRecord[]
  ): Promise<
    Array<{
      attachment_id: number;
      attachment_type: 'photo' | 'video';
      attachment_url: string;
      critterbase_capture_id: string;
      critter_capture_attachment_id: number;
      file_name: string | null;
      file_size: number | null;
      file_type: string;
      key: string;
    }>
  > {
    const transformedAttachments = await Promise.all(
      attachments.map(async (attachment) => {
        const attachmentUrl = await getS3SignedURL(attachment.key);
        const attachmentType = CritterAttachmentService.getAttachmentType(attachment.file_name);

        return {
          attachment_id: attachment.critter_capture_attachment_id,
          attachment_type: attachmentType,
          attachment_url: attachmentUrl || '',
          critterbase_capture_id: attachment.critterbase_capture_id,
          critter_capture_attachment_id: attachment.critter_capture_attachment_id,
          file_name: attachment.file_name,
          file_size: attachment.file_size,
          file_type: attachment.file_type,
          key: attachment.key
        };
      })
    );

    return transformedAttachments;
  }
}
