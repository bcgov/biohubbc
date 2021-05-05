import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-create');

/**
 * Processes all POST /project request data.
 *
 * @export
 * @class PostProjectObject
 */
export class PostSurveyData {
  survey_name: string;
  biologist_first_name: string;
  biologist_last_name: string;
  //category_rational: string;

  foippa_requirements_accepted: boolean;
  //management_unit: string;
  //park: string;
  //proprietary_data_category: string;
  //proprietor_name: string;
  //sedis_procedures_accepted: boolean;
  species: string;
  start_date: string;
  end_date: string;
  survey_area_name: string;
  survey_data_proprietary: boolean;
  survey_purpose: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostSurveyObject', message: 'params', obj });

    this.biologist_first_name = obj?.biologist_first_name || null;
    this.biologist_last_name = obj?.biologist_last_name || null;
    //this.category_rational = obj?.category_rational || null;
    this.end_date = obj?.end_date || null;
    this.foippa_requirements_accepted = (obj?.foippa_requirements_accepted === 'true' && true) || false;
    //this.management_unit = obj?.management_unit || null;
    //this.park = obj?.park || null;
    // this.proprietary_data_category = obj?.proprietary_data_category || null;
    // this.proprietor_name = obj?.proprietor_name || null;
    //this.sedis_procedures_accepted = (obj?.sedis_procedures_accepted === 'true' && true) || false;
    this.species = obj?.species || null;
    this.start_date = obj?.start_date || null;
    this.survey_area_name = obj?.survey_area_name || null;
    this.survey_data_proprietary = obj?.survey_data_proprietary || null;
    this.survey_name = obj?.survey_name || null;
    this.survey_purpose = obj?.survey_purpose || null;
  }
}
