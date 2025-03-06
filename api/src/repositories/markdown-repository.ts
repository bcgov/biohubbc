import SQL from 'sql-template-strings';
import { MarkdownUserRecord } from '../database-models/markdown_user';
import { MarkdownObject, MarkdownQueryObject } from '../models/markdown-view';
import { BaseRepository } from './base-repository';

/**
 * A repository class for managing markdown data for help dialogs.
 *
 * @export
 * @class MarkdownRepository
 * @extends {BaseRepository}
 */
export class MarkdownRepository extends BaseRepository {
  /**
   * Gets the active markdown record for a given markdown type
   *
   * @param {MarkdownQueryObject} MarkdownQueryObject
   * @return {*}  {Promise<MarkdownObject>}
   * @memberof MarkdownRepository
   */
  async getMarkdownByTypeName(MarkdownQueryObject: MarkdownQueryObject): Promise<MarkdownObject> {
    const sqlStatement = SQL`
        SELECT
          m.markdown_id,
          m.markdown_type_id,
          m.data,
          CASE WHEN mu.markdown_user_id IS NULL THEN FALSE
               ELSE TRUE END AS participated
        FROM
          markdown m
        LEFT JOIN markdown_type mt ON mt.markdown_type_id = m.markdown_type_id
        LEFT JOIN markdown_user mu ON mu.markdown_id = m.markdown_id AND mu.system_user_id = ${MarkdownQueryObject.system_user_id}
        WHERE
          mt.name = ${MarkdownQueryObject.markdown_type_name}
        AND m.record_end_date IS NULL
      ;
      `;

    const response = await this.connection.sql(sqlStatement, MarkdownObject);

    return response.rows[0];
  }

  /**
   * Update the score of a markdown record.
   *
   * @param {number} markdownId
   * @param {number} delta
   * @return {*}  {Promise<number>}
   * @memberof MarkdownRepository
   */
  async updateScore(markdownId: number, delta: number): Promise<number> {
    const sqlStatement = SQL`
       UPDATE markdown
       SET score = score + ${delta}
       WHERE markdown_id = ${markdownId}
       RETURNING score;
     `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows[0];
  }

  /**
   * Gets a participation record for a given markdown record and system user id, to check whether a user has already scored a markdown record
   *
   * @param {number} markdownId
   * @param {number} systemUserId
   * @return {*}  {Promise<MarkdownUserRecord | null>}
   * @memberof MarkdownRepository
   */
  async getUserParticipation(markdownId: number, systemUserId: number): Promise<MarkdownUserRecord | null> {
    const sqlStatement = SQL`
        SELECT 
          markdown_user_id,
          system_user_id,
          markdown_id
        FROM 
          markdown_user 
        WHERE 
          markdown_id = ${markdownId} 
        AND 
          system_user_id = ${systemUserId};
      `;

    const response = await this.connection.sql(sqlStatement, MarkdownUserRecord);

    return response.rows?.[0] ?? null;
  }

  /**
   * Insert a record indicating that the user has scored the given markdown record
   *
   * @param {number} markdownId
   * @param {number} systemUserId
   * @return {*}  {Promise<number>}
   * @memberof MarkdownRepository
   */
  async insertUserParticipation(markdownId: number, systemUserId: number): Promise<number> {
    const sqlStatement = SQL`
        INSERT INTO 
          markdown_user (markdown_id, system_user_id) 
        VALUES 
          (${markdownId}, ${systemUserId})
        RETURNING markdown_user_id;
      `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows[0];
  }
}
