import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { EnvironmentStandards, EnvironmentStandardsSchema } from '../models/standards-view';
import { BaseRepository } from './base-repository';

/**
 * Standards repository
 *
 * @export
 * @class standardsRepository
 * @extends {BaseRepository}
 */
export class StandardsRepository extends BaseRepository {
  /**
   * Gets environment standards
   *
   * @return {*}
   * @memberof standardsRepository
   */
  async getEnvironmentStandards(): Promise<EnvironmentStandards> {
    const sql = SQL`
      WITH 
        quan AS (
          SELECT 
            name AS quant_name,
            description AS quant_description
          FROM 
            environment_quantitative
        ),
        qual AS (
          SELECT
            eq.name AS qual_name,
            eq.description AS qual_description,
            json_agg(json_build_object('name', eqo.name, 'description', eqo.description)) as options
          FROM  
            environment_qualitative_option eqo
          LEFT JOIN
            environment_qualitative eq ON eqo.environment_qualitative_id = eq.environment_qualitative_id
          GROUP BY
            eq.name, 
            eq.description
        )
      SELECT 
        (SELECT json_agg(json_build_object('name', quant_name, 'description', quant_description)) FROM quan) as quantitative,
        (SELECT json_agg(json_build_object('name', qual_name, 'description', qual_description, 'options', options)) FROM qual) as qualitative;
    `;

    const response = await this.connection.sql(sql, EnvironmentStandardsSchema);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get environment standards', [
        'standardsRepository->getEnvironmentStandards',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }
}
