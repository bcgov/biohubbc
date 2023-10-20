import SQL, { SQLStatement } from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { jsonSchema } from '../zod-schema/json';
import { BaseRepository } from './base-repository';

export const WebformDraft = z.object({
  webform_draft_id: z.number(),
  name: z.string(),
  data: jsonSchema,
  create_date: z.string(),
  update_date: z.string().nullable()
});

export type WebformDraft = z.infer<typeof WebformDraft>;

/**
 * A repository class for accessing draft data.
 *
 * @export
 * @class DraftRepository
 * @extends {BaseRepository}
 */
export class DraftRepository extends BaseRepository {
  /**
   * Deletes a draft
   *
   * @param {number} draftId
   * @return {*}  {Promise<QueryResult>}
   * @memberof DraftRepository
   */
  async deleteDraft(draftId: number): Promise<{ webform_draft_id: number }> {
    const sqlStatement = SQL`
      DELETE from webform_draft
      WHERE webform_draft_id = ${draftId}
      RETURNING webform_draft_id;
    `;

    const response = await this.connection.sql<{ webform_draft_id: number }>(sqlStatement);

    if (!response?.rows[0]) {
      throw new ApiExecuteSQLError('Failed to delete draft', [
        'DraftRepository->deleteDraft',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response.rows[0];
  }
  /**
   * Gets a draft
   *
   * @param {number} draftId
   * @return {*}  {Promise<WebformDraft>}
   * @memberof DraftRepository
   */
  async getDraft(draftId: number): Promise<WebformDraft> {
    const sqlStatement: SQLStatement = SQL`
      SELECT
        *
      FROM
        webform_draft
      WHERE
        webform_draft_id = ${draftId};
    `;

    const response = await this.connection.sql(sqlStatement, WebformDraft);

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to get draft', [
        'DraftRepository->getDraft',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Gets a list of drafts
   *
   * @param {(number | null)} systemUserId
   * @return {*}  {Promise<WebformDraft[]>}
   * @memberof DraftRepository
   */
  async getDraftList(systemUserId: number | null): Promise<WebformDraft[]> {
    const sqlStatement = SQL`
    SELECT
      *
    FROM
      webform_draft
    WHERE
      system_user_id = ${systemUserId};
    `;

    const response = await this.connection.sql(sqlStatement, WebformDraft);

    return response.rows;
  }

  /**
   * Creates a draft
   *
   * @param {number} systemUserId
   * @param {string} name
   * @param {*} data
   * @return {*}  {Promise<WebformDraft>}
   * @memberof DraftRepository
   */
  async createDraft(systemUserId: number, name: string, data: any): Promise<WebformDraft> {
    const sqlStatement = SQL`
    INSERT INTO webform_draft (
      system_user_id,
      name,
      data
    ) VALUES (
      ${systemUserId},
      ${name},
      ${data}
    )
    RETURNING *
  `;

    const response = await this.connection.sql(sqlStatement, WebformDraft);

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to create draft', [
        'DraftRepository->createDraft',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Updates a draft
   *
   * @param {number} draftId
   * @param {string} name
   * @param {*} data
   * @return {*}  {Promise<WebformDraft>}
   * @memberof DraftRepository
   */
  async updateDraft(draftId: number, name: string, data: any): Promise<WebformDraft> {
    const sqlStatement = SQL`
    UPDATE
      webform_draft
    SET
      name = ${name},
      data = ${data}
    WHERE
      webform_draft_id = ${draftId}
    RETURNING *;
  `;

    const response = await this.connection.sql(sqlStatement, WebformDraft);

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to update draft', [
        'DraftRepository->createDraft',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response.rows[0];
  }
}
