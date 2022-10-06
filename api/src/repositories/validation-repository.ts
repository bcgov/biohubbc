import { HTTP400 } from '../errors/custom-error';
import { queries } from '../queries/queries';
import { BaseRepository } from './base-repository';

export class ValidationRepository extends BaseRepository {
  /**
   * Get a template_methodology_species record from the template_methodologies_species table
   *
   * @param {number} fieldMethodId
   * @param {number} templateId
   * @return {*}  {Promise<void>}
   */
  async getTemplateMethodologySpeciesRecord(fieldMethodId: number, templateId: number): Promise<any> {
    const sqlStatement = queries.survey.getTemplateMethodologySpeciesRecordSQL(fieldMethodId, templateId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get template methodology species record sql statement');
    }
    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to query template methodology species table');
    }

    return (response && response.rows && response.rows[0]) || null;
  }
}
