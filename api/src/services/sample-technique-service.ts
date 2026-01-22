import { IDBConnection } from '../database/db';
import { SurveyRepository } from '../repositories/survey-repository';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('services/sample-technique-service');

export interface SampleTechniqueRecord {
  method_technique_id: number;
  method_name: string;
  description: string | null;
  method_lookup_id: number;
  method_lookup_name: string;
  method_response_metric_id: number;
  response_metric: string;
  attractants: string | null;
  attractant_ids: Array<{ attractant_lookup_id: number }>;
  distance_threshold: number | null;
  attribute_data: Array<{
    attribute_header: string;
    attribute_value: string;
    technique_attribute_qualitative_id: string | null;
    technique_attribute_qualitative_option_id: number | null;
    technique_attribute_quantitative_id: string | null;
  }>;
  vantage_data: Array<{
    vantage_header: string;
    vantage_value: string;
    vantage_category_id: number | null;
    vantage_id: number | null;
  }>;
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
      method_lookup_id: row.method_lookup_id,
      method_lookup_name: row.method_lookup_name,
      method_response_metric_id: row.method_response_metric_id,
      response_metric: row.response_metric,
      attractants: row.attractants,
      attractant_ids: row.attractant_ids || [],
      distance_threshold: row.distance_threshold,
      attribute_data: (row.attrib_data || []).map((attr: any) => ({
        attribute_header: attr.ah,
        attribute_value: attr.av,
        technique_attribute_qualitative_id: attr.technique_attribute_qualitative_id || null,
        technique_attribute_qualitative_option_id: attr.technique_attribute_qualitative_option_id || null,
        technique_attribute_quantitative_id: attr.technique_attribute_quantitative_id || null
      })),
      vantage_data: (row.vantage_data || []).map((vantage: any) => ({
        vantage_header: vantage.vh,
        vantage_value: vantage.vv,
        vantage_category_id: vantage.vantage_category_id || null,
        vantage_id: vantage.vantage_id || null
      }))
    }));
  }
}
