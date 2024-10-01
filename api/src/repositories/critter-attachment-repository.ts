import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ATTACHMENT_TYPE } from '../constants/attachments';
import { CritterCaptureAttachmentRecord } from '../database-models/critter_capture_attachment';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';
import {
  CritterCaptureAttachmentPayload,
  CritterMortalityAttachmentPayload
} from './critter-attachment-repository.interface';

/**
 * A repository class for accessing Critter attachment data.
 *
 * @export
 * @class CritterAttachmentRepository
 * @extends {BaseRepository}
 */
export class CritterAttachmentRepository extends BaseRepository {
  /**
   * Get Critter Capture Attachment signed URL.
   *
   * @param {number} surveyId - Survey ID
   * @param {number} attachmentId - Critter Capture Attachment ID
   * @return {*}  {Promise<string>}
   */
  async getCritterCaptureSignedURL(surveyId: number, attachmentId: number): Promise<string> {
    const sqlStatement = SQL`
      SELECT
        key
      FROM critter_capture_attachment
      WHERE critter_capture_attachment_id = ${attachmentId}
      AND survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, z.object({ key: z.string() }));

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to get critter capture attachment signed URL', [
        'AttachmentRepository->getCritterCaptureSignedURL',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].key;
  }
  /**
   * Upsert Critter Capture Attachment record.
   *
   * @return {*}  {Promise<{ critter_capture_attachment_id: number; key: string }>}
   * @memberof AttachmentRepository
   */
  async upsertCritterCaptureAttachment(
    payload: CritterCaptureAttachmentPayload
  ): Promise<{ critter_capture_attachment_id: number; key: string }> {
    const sqlStatement = SQL`
    INSERT INTO critter_capture_attachment (
      critter_id,
      critterbase_capture_id,
      file_name,
      file_size,
      file_type,
      key
    )
    VALUES (
      ${payload.critter_id},
      ${payload.critterbase_capture_id},
      ${payload.file_name},
      ${payload.file_size},
      ${ATTACHMENT_TYPE.OTHER},
      ${payload.key}
    )
    ON CONFLICT (critter_id, critterbase_capture_id, file_name)
    DO UPDATE SET
      file_name = ${payload.file_name},
      file_size = ${payload.file_size}
    RETURNING
      critter_capture_attachment_id,
      key;
    `;

    const response = await this.connection.sql(
      sqlStatement,
      z.object({ critter_capture_attachment_id: z.number(), key: z.string() })
    );

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to upsert critter capture attachment data', [
        'AttachmentRepository->upsertCritterCaptureAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Insert Critter Mortality Attachment record.
   *
   * @return {*}  {Promise<{ critter_mortality_attachment_id: number; key: string }>}
   * @memberof AttachmentRepository
   */
  async upsertCritterMortalityAttachment(
    payload: CritterMortalityAttachmentPayload
  ): Promise<{ critter_mortality_attachment_id: number; key: string }> {
    const sqlStatement = SQL`
    INSERT INTO critter_capture_attachment (
      critter_id,
      critterbase_capture_id,
      file_name,
      file_size,
      file_type,
      key
    )
    VALUES (
      ${payload.critter_id},
      ${payload.critterbase_mortality_id},
      ${payload.file_name},
      ${payload.file_size},
      ${ATTACHMENT_TYPE.OTHER},
      ${payload.key}
    )
    ON CONFLICT (critter_id, critterbase_mortality_id, file_name)
    DO UPDATE SET
      file_name = ${payload.file_name},
      file_size = ${payload.file_size}
    RETURNING
      critter_mortality_attachment_id,
      key;
    `;

    const response = await this.connection.sql(
      sqlStatement,
      z.object({ critter_mortality_attachment_id: z.number(), key: z.string() })
    );

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to upsert critter mortality attachment data', [
        'AttachmentRepository->insertCritterMortalityAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Get Critter Capture Attachments by Critter ID.
   *
   * @param {number} critterId - SIMS Critter ID
   * @return {*}  {Promise<CritterCaptureAttachment[]>}
   * @memberof CritterAttachmentRepository
   */
  async getCaptureAttachmentsByCritterId(critterId: number): Promise<CritterCaptureAttachmentRecord[]> {
    const sqlStatement = SQL`
      SELECT
        critter_capture_attachment_id,
        uuid,
        critter_id,
        critterbase_capture_id,
        file_type,
        file_name,
        file_size,
        title,
        description,
        key
      FROM critter_capture_attachment
      WHERE critter_id = ${critterId};
    `;

    const response = await this.connection.sql(sqlStatement, CritterCaptureAttachmentRecord);

    return response.rows;
  }

  /**
   * Delete Critter Capture Attachments by ID.
   *
   * @param {number[]} deleteIds - Critter Capture Attachment ID's
   * @return {*}  {Promise<void>}
   */
  async deleteCritterCaptureAttachments(deleteIds: number[]): Promise<void> {
    const sqlStatement = SQL`
      DELETE FROM critter_capture_attachment
      WHERE critter_capture_attachment_id IN (${deleteIds.join(',')});
    `;

    await this.connection.sql(sqlStatement);
  }
}
