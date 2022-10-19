import SQL from 'sql-template-strings';
import { HTTP400 } from '../errors/http-error';
import { BaseRepository } from './base-repository';

export interface ISummaryTemplateSpeciesData {
  summary_template_species_id: number;
  validation: string;
}

export class SummaryValidationRepository extends BaseRepository {
  
  /**
   * Retreives the ID of a summary template based on its name and version number.
   * @param templateName 
   * @param templateVersion 
   * @returns
   */
  async getSummaryTemplateIdFromNameVersion(templateName: string, templateVersion: string): Promise<{ summary_template_id: number }> {
    const sqlStatement = SQL`
      SELECT
        st.summary_template_id
      FROM
        summary_template st
      WHERE
        st.name = ${templateName}
      AND
        st.version = ${templateVersion}
      ;
    `;

    const response = await this.connection.query<{ summary_template_id: number }>(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to query summary templates table');
    }

    return response && response.rows && response.rows[0];
  }

  /**
   * 
   * @param templateName 
   * @param templateVersion 
   * @returns 
   */
  async getSummaryTemplateSpeciesRecord(
    templateName: string,
    templateVersion: string,
    species: number
  ): Promise<ISummaryTemplateSpeciesData> {
    const templateRow = await this.getSummaryTemplateIdFromNameVersion(templateName, templateVersion);

    const sqlStatement = SQL`
      SELECT
        *
      FROM
        summary_template_species sts
      WHERE
        sts.summary_template_id = ${templateRow.summary_template_id}
      AND
        sts.wldtaxonomic_units_id = ${species}
      ;
    `;
    const response = await this.connection.query<ISummaryTemplateSpeciesData>(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to query summary template species table');
    }

    return response && response.rows && response.rows[0];
  }
}
