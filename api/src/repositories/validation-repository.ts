import SQL from 'sql-template-strings';
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
   * @return {*}  {Promise<any>}
   */
  async getTemplateMethodologySpeciesRecord(
    templateName: string,
    templateVersion: number,
    surveyIntendedOutcomeId: number,
    surveyFieldMethodId: number,
    surveySpecies: number[]
  ): Promise<ITemplateMethodologyData> {
    const templateRow = await this.getTemplateNameVersionId(templateName, templateVersion);

    console.log('templateRow:', templateRow);

    const sqlStatement = SQL`
    SELECT
      *
    FROM
      template_methodology_species tms
    WHERE
      tms.template_id = ${templateRow.template_id}
    AND
      tms.intended_outcome_id = ${surveyIntendedOutcomeId}
    AND
      tms.field_method_id = ${surveyFieldMethodId}
    AND
      tms.wldtaxonomic_units_id = ${surveySpecies[0]}
    ;
  `;
    const response = await this.connection.query<ITemplateMethodologyData>(sqlStatement.text, sqlStatement.values);

    console.log('response:', response);

    if (!response) {
      throw new HTTP400('Failed to query template methodology species table');
    }

    return response && response.rows && response.rows[0];
  }

  async getTemplateNameVersionId(templateName: string, templateVersion: number): Promise<{ template_id: number }> {
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
