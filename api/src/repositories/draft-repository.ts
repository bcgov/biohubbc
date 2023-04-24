import { QueryResult } from 'pg';
import SQL, { SQLStatement } from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export const WebformDraftList = z.object({
  webform_draft_id: z.number(),
  name: z.string(),
  data: z.object({}),
  create_date: z.date(),
  update_date: z.date().nullable()
});

export type WebformDraftList = z.infer<typeof WebformDraftList>;

/**
 * A repository class for accessing draft data.
 *
 * @export
 * @class DraftRepository
 * @extends {BaseRepository}
 */
export class DraftRepository extends BaseRepository {
  async deleteDraft(draftId: number): Promise<QueryResult> {
    const sqlStatement = SQL`
      DELETE from webform_draft
      WHERE webform_draft_id = ${draftId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response) {
      throw new ApiExecuteSQLError('Failed to delete draft', [
        'ProjectRepository->deleteDraft',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response;
  }

  async getSingleDraft(draftId: number): Promise<{ id: number; name: string; data: any }> {
    const sqlStatement: SQLStatement = SQL`
      SELECT
        webform_draft_id as id,
        name,
        data
      FROM
        webform_draft
      WHERE
        webform_draft_id = ${draftId};
    `;

    const response = await this.connection.sql<{ id: number; name: string; data: any }>(sqlStatement);

    if (!response || !response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to get draft', [
        'ProjectRepository->getSingleDraft',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response?.rows?.[0];
  }

  async getDraftList(systemUserId: number | null): Promise<any[]> {
    const sqlStatement = SQL`
    SELECT
      *
    FROM
      webform_draft
    WHERE
      system_user_id = ${systemUserId};
    `;

    const response = await this.connection.sql(sqlStatement, WebformDraftList);

    return response.rows || [];
  }

  async createDraft(systemUserId: number, name: string, data: any): Promise<WebformDraftList> {
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

    const response = await this.connection.sql(sqlStatement, WebformDraftList);

    return response.rows[0] || null;
  }

  async updateDraft(draftId: number, name: string, data: any): Promise<WebformDraftList> {
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

    const response = await this.connection.sql(sqlStatement, WebformDraftList);

    return response.rows[0] || null;
  }
}
