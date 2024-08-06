import SQL from 'sql-template-strings';
import {
  EnvironmentStandards,
  EnvironmentStandardsSchema,
  MethodStandard,
  MethodStandardSchema
} from '../models/standards-view';
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
   * @param {string} keyword
   * @return {*}
   * @memberof standardsRepository
   */
  async getEnvironmentStandards(keyword?: string): Promise<EnvironmentStandards> {
    const sql = SQL`
      WITH 
        quan AS (
          SELECT 
            eq.name AS quant_name,
            eq.description AS quant_description,
            eq.unit
          FROM 
            environment_quantitative eq
          WHERE 
            eq.name ILIKE '%' || ${keyword ?? ''} || '%'
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
          WHERE 
            eq.name ILIKE '%' || ${keyword ?? ''} || '%'
          GROUP BY
            eq.name, 
            eq.description
        )
      SELECT 
        (SELECT json_agg(json_build_object('name', quant_name, 'description', quant_description, 'unit', unit)) FROM quan) as quantitative,
        (SELECT json_agg(json_build_object('name', qual_name, 'description', qual_description, 'options', options)) FROM qual) as qualitative;
    `;

    const response = await this.connection.sql(sql, EnvironmentStandardsSchema);

    return response.rows[0];
  }

  async getMethodStandards(keyword?: string): Promise<MethodStandard[]> {
    const sql = SQL`
    WITH 
      quan AS (
        SELECT 
          mlaq.method_lookup_id,
          tq.name AS quant_name,
          tq.description AS quant_description,
          mlaq.unit
        FROM
          method_lookup_attribute_quantitative mlaq
        LEFT JOIN
          technique_attribute_quantitative tq ON mlaq.technique_attribute_quantitative_id = tq.technique_attribute_quantitative_id
      ),
      qual AS (
        SELECT
          mlaq.method_lookup_id,
          taq.name AS qual_name,
          taq.description AS qual_description,
          COALESCE(json_agg(
            json_build_object(
              'name', mlaqo.name,
              'description', mlaqo.description
            ) ORDER BY mlaqo.name
          ), '[]'::json) AS options
        FROM  
          method_lookup_attribute_qualitative_option mlaqo
        LEFT JOIN
          method_lookup_attribute_qualitative mlaq ON mlaqo.method_lookup_attribute_qualitative_id = mlaq.method_lookup_attribute_qualitative_id
        LEFT JOIN
          technique_attribute_qualitative taq ON mlaq.technique_attribute_qualitative_id = taq.technique_attribute_qualitative_id
        GROUP BY
          mlaq.method_lookup_id,
          taq.name, 
          taq.description
      ),
      method_lookup AS (
        SELECT 
          ml.method_lookup_id,
          ml.name,
          ml.description,
          json_build_object(
            'quantitative', (
              SELECT COALESCE(json_agg(
                json_build_object(
                  'name', quan.quant_name,
                  'description', quan.quant_description,
                  'unit', quan.unit
                ) ORDER BY quan.quant_name
              ), '[]'::json) FROM quan
              WHERE quan.method_lookup_id = ml.method_lookup_id
            ),
            'qualitative', (
              SELECT COALESCE(json_agg(
                json_build_object(
                  'name', qual.qual_name,
                  'description', qual.qual_description,
                  'options', qual.options
                ) ORDER BY qual.qual_name
              ), '[]'::json) FROM qual
              WHERE qual.method_lookup_id = ml.method_lookup_id
            )
          ) AS attributes
        FROM 
          method_lookup ml
        WHERE 
          ml.name ILIKE '%' || ${keyword ?? ''} || '%'
      )
    SELECT * FROM method_lookup;
  `;

    const response = await this.connection.sql(sql, MethodStandardSchema);

    return response.rows;
  }
}
