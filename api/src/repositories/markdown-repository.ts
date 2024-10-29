import SQL from 'sql-template-strings';
import { MarkdownObject, markdownQueryObject } from '../models/markdown-view';
import { BaseRepository } from './base-repository';

/**
 * A repository class for accessing markdown data for help dialogs.
 *
 * @export
 * @class MarkdownRepository
 * @extends {BaseRepository}
 */
export class MarkdownRepository extends BaseRepository {
  /**
   * Gets the active markdown record for a given markdown type
   *
   * @param {markdownQueryObject} markdownQueryObject
   * @return {*}  {Promise<MarkdownObject>}
   * @memberof MarkdownRepositor
   */
  async getMarkdownByTypeName(markdownQueryObject: markdownQueryObject): Promise<MarkdownObject> {
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
        LEFT JOIN markdown_user mu ON mu.markdown_id = m.markdown_id AND mu.system_user_id = ${markdownQueryObject.system_user_id}
        WHERE
          mt.name = ${markdownQueryObject.markdown_type_name}
        AND m.record_end_date IS NULL
      ;
      `;

    const response = await this.connection.sql(sqlStatement, MarkdownObject);

    return response.rows[0];
  }
}
