import SQL from 'sql-template-strings';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { getKnex } from '../database/db';
import { HTTP400 } from '../errors/http-error';
import { TransformSchema } from '../utils/media/xlsx/transformation/xlsx-transform-schema-parser';
import { MessageError, SubmissionError } from '../utils/submission-error';
import { BaseRepository } from './base-repository';

export interface ITemplateMethodologyData {
  template_methodology_species_id: number;
  wldtaxonomic_units_id: string;
  validation: string;
  transform: TransformSchema;
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

    const failedToFindValidationRulesError = new SubmissionError({
      status: SUBMISSION_STATUS_TYPE.FAILED_VALIDATION,
      messages: [
        new MessageError(
          SUBMISSION_MESSAGE_TYPE.FAILED_GET_VALIDATION_RULES,
          `Could not find any validation schema associated with Template Name "${templateName}" and Template Version "${templateVersion}".`
        )
      ]
    });

    // No template validation record is found for the given template name and version
    if (!templateRow) {
      throw failedToFindValidationRulesError;
    }

    const queryBuilder = getKnex()
      .select('template_methodology_species_id', 'wldtaxonomic_units_id', 'validation', 'transform')
      .from('template_methodology_species')
      .where('template_id', templateRow.template_id)
      .and.where(function (qb) {
        qb.or.where('field_method_id', surveyFieldMethodId);
        qb.or.where('field_method_id', null);
      });

    const response = await this.connection.knex<ITemplateMethodologyData>(queryBuilder);

    // Querying the template methodology species table fails
    if (!response || !response.rows) {
      throw new HTTP400('Failed to query template methodology species table');
    }

    // Failure to find a template methodology species record for this template name and verion; Should yield a validation error.
    if (response.rows.length === 0) {
      throw failedToFindValidationRulesError;
    }

    // Some template methodology species records are found for this template name and version, but none are associated with this
    // particular surveySpecies, indicating that the wrong focal species was likely selected.
    if (!response.rows.some((row) => surveySpecies.includes(Number(row.wldtaxonomic_units_id)))) {
      throw new SubmissionError({
        status: SUBMISSION_STATUS_TYPE.FAILED_VALIDATION,
        messages: [
          new MessageError(
            SUBMISSION_MESSAGE_TYPE.MISMATCHED_TEMPLATE_SURVEY_SPECIES,
            'The focal species imported from this template does not match the focal species selected for this survey.'
          )
        ]
      });
    }

    // Return the first result among all records that match on the given surveySpecies.
    return response.rows.filter((row) => {
      return surveySpecies.includes(Number(row.wldtaxonomic_units_id));
    })[0];
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

    const response = await this.connection.sql<{ template_id: number }>(sqlStatement);

    if (!response) {
      throw new HTTP400('Failed to query template table');
    }

    return response && response.rows && response.rows[0];
  }
}
