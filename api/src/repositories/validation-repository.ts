import SQL from 'sql-template-strings';
import { getKnex } from '../database/db';
import { HTTP400 } from '../errors/http-error';
import { BaseRepository } from './base-repository';

export interface ITemplateMethodologyData {
  template_methodology_species_id: number;
  validation: string;
  transform: string;
}

export class ValidationRepository extends BaseRepository {
  /**
   * Get a template_methodology_species record from the template_methodologies_species table
   *
   * @param {string} templateName
   * @param {string} templateVersion
   * @param {number} surveyFieldMethodId
   * @param {number[]} surveySpecies
   * @return {*}  {Promise<ITemplateMethodologyData>}
   * @memberof ValidationRepository
   */
  async getTemplateMethodologySpeciesRecord(
    templateName: string,
    templateVersion: string,
    surveyFieldMethodId: number,
    surveySpecies: number[]
  ): Promise<ITemplateMethodologyData> {
    const templateRow = await this.getTemplateNameVersionId(templateName, templateVersion);

    // console.log('templateRow:', templateRow);
    // console.log('surveyFieldMethodId:', surveyFieldMethodId);
    // console.log('surveySpecies:', surveySpecies);

    const queryBuilder = getKnex()
      .select(
        'template_methodology_species.template_methodology_species_id',
        'template_methodology_species.validation',
        'template_methodology_species.transform'
      )
      .from('template_methodology_species')
      .where('template_methodology_species.template_id', templateRow.template_id)
      .and.whereIn(
        'template_methodology_species.wldtaxonomic_units_id',
        (Array.isArray(surveySpecies) && surveySpecies) || [surveySpecies]
      )
      .and.where('template_methodology_species.field_method_id', surveyFieldMethodId)
      .or.where('template_methodology_species.field_method_id', null);

    // console.log('queryBuilder:', queryBuilder.toSQL().toNative());

    const response = await this.connection.knex<ITemplateMethodologyData>(queryBuilder);

    // console.log('response:', response);

    if (!response) {
      throw new HTTP400('Failed to query template methodology species table');
    }

    return response && response.rows && response.rows[0];
  }

  /**
   * Get the Template Id from a Template name and Version number
   *
   * @param {string} templateName
   * @param {string} templateVersion
   * @return {*}  {Promise<{ template_id: number }>}
   * @memberof ValidationRepository
   */
  async getTemplateNameVersionId(templateName: string, templateVersion: string): Promise<{ template_id: number }> {
    const sqlStatement = SQL`
      SELECT
        t.template_id
      FROM
        template t
      WHERE
        t.name = ${templateName}
      AND
        t.version = ${templateVersion}
      ;
    `;

    const response = await this.connection.query<{ template_id: number }>(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to query template table');
    }

    return response && response.rows && response.rows[0];
  }
}
