import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ATTACHMENT_TYPE } from '../constants/attachments';
import {
  CritterCaptureAttachmentModel,
  CritterCaptureAttachmentRecord
} from '../database-models/critter_capture_attachment';
import { getKnex } from '../database/db';
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
   * Get Critter Capture Attachment S3 key.
   *
   * Note: Joining on survey_id for security purposes.
   *
   * @param {number} surveyId - Survey ID
   * @param {number} attachmentId - Critter Capture Attachment ID
   * @return {*}  {Promise<string>}
   */
  async getCritterCaptureAttachmentS3Key(surveyId: number, attachmentId: number): Promise<string> {
    const sqlStatement = SQL`
      SELECT
        key
      FROM critter_capture_attachment cc
      JOIN critter c
      ON c.critter_id = cc.critter_id
      JOIN survey s
      ON s.survey_id = c.survey_id
      WHERE cc.critter_capture_attachment_id = ${attachmentId}
      AND s.survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, z.object({ key: z.string() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get critter capture attachment signed URL', [
        'AttachmentRepository->getCritterCaptureAttachmentS3Key',
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

    if (!response.rowCount) {
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

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to upsert critter mortality attachment data', [
        'AttachmentRepository->insertCritterMortalityAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Find all Attachments for a Critterbase Capture ID.
   *
   * @param {number} surveyId - Survey ID
   * @param {string} critterbaseCaptureId - Critterbase Capture ID
   * @return {*} {Promise<CritterCaptureAttachmentModel[]>}
   */
  async findAllCritterCaptureAttachments(
    surveyId: number,
    critterbaseCaptureId: string
  ): Promise<CritterCaptureAttachmentModel[]> {
    const sqlStatement = SQL`
      SELECT cc.*
      FROM critter_capture_attachment cc
      INNER JOIN critter c
        ON c.critter_id = cc.critter_id
      INNER JOIN survey s
        ON s.survey_id = c.survey_id
      WHERE cc.critterbase_capture_id = ${critterbaseCaptureId}
      AND s.survey_id = ${surveyId};
      `;

    const response = await this.connection.sql(sqlStatement, CritterCaptureAttachmentModel);

    return response.rows;
  }

  /**
   * Find Critter Capture Attachments by Critter ID.
   *
   * @param {number} critterId - SIMS Critter ID
   * @return {*}  {Promise<CritterCaptureAttachment[]>}
   * @memberof CritterAttachmentRepository
   */
  async findCaptureAttachmentsByCritterId(critterId: number): Promise<CritterCaptureAttachmentRecord[]> {
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
   * Note: Joining on survey_id for security purposes.
   *
   * @param {number} surveyId - Survey ID
   * @param {number[]} deleteIds - Critter Capture Attachment ID's
   * @return {*}  {Promise<string[]>} List of S3 keys that were deleted
   */
  async deleteCritterCaptureAttachments(surveyId: number, deleteIds: number[]): Promise<string[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .del()
      .from('critter_capture_attachment as cc')
      .join('critter as c', 'c.critter_id', 'cc.critter_id')
      .join('survey as s', 's.survey_id', 'c.survey_id')
      .whereIn('cc.critter_capture_attachment_id', deleteIds)
      .andWhere('s.survey_id', surveyId)
      .returning('cc.key');

    const response = await this.connection.knex(queryBuilder, z.object({ key: z.string() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete critter capture attachments', [
        'AttachmentRepository->deleteCritterCaptureAttachments',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response.rows.map((row) => row.key);
  }
}
