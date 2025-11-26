import { IDBConnection } from '../database/db';
import { SurveyRepository } from '../repositories/survey-repository';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('services/sample-technique-service');

export interface SampleTechniqueRecord {
  method_technique_id: number;
  method_name: string;
  description: string | null;
  method_lookup_name: string;
  attractants: string | null;
  distance_threshold: number | null;
  response_metric: string;
  attribute_data: Array<{ attribute_header: string; attribute_value: string }>;
  vantage_data: Array<{ vantage_header: string; vantage_value: string }>;
}

export class SampleTechniqueService {
  connection: IDBConnection;

  constructor(connection: IDBConnection) {
    this.connection = connection;
  }

  /**
   * Get sampling techniques for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SampleTechniqueRecord[]>}
   * @memberof SampleTechniqueService
   */
  async getSamplingTechniquesForSurvey(surveyId: number): Promise<SampleTechniqueRecord[]> {
    defaultLog.debug({
      label: 'getSamplingTechniquesForSurvey',
      message: 'Getting sampling techniques',
      surveyId
    });

    const sqlStatement = SurveyRepository.getSampleTechniquesBySurveyId(surveyId);

    const response = await this.connection.sql(sqlStatement);

    return response.rows.map((row: any) => ({
      method_technique_id: row.method_technique_id,
      method_name: row.method_name,
      description: row.description,
      method_lookup_name: row.method_lookup_name,
      attractants: row.attractants,
      distance_threshold: row.distance_threshold,
      response_metric: row.response_metric,
      attribute_data: row.attrib_data || [],
      vantage_data: row.vantage_data || []
    }));
  }
}
