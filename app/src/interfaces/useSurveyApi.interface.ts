import { Feature } from 'geojson';

/**
 * Create project survey post object.
 *
 * @export
 * @interface ICreateSurveyRequest
 */
export interface ICreateSurveyRequest {
  biologist_first_name: string;
  biologist_last_name: string;
  category_rationale: string;
  data_sharing_agreement_required: string;
  end_date: string;
  foippa_requirements_accepted: boolean;
  management_unit: string[];
  park: string[];
  proprietary_data_category: string;
  proprietor_name: string;
  sedis_procedures_accepted: boolean;
  focal_species: number[];
  ancillary_species: number[];
  start_date: string;
  survey_area_name: string;
  survey_data_proprietary: string;
  survey_name: string;
  survey_purpose: string;
  geometry: Feature[];
}

/**
 * Create project survey response object.
 *
 * @export
 * @interface ICreateSurveyResponse
 */
export interface ICreateSurveyResponse {
  id: number;
}

export interface IGetSurvey {
  survey_name: string;
  survey_purpose: string;
  focal_species: string[];
  ancillary_species: string[];
  start_date: string;
  end_date: string;
  biologist_first_name: string;
  biologist_last_name: string;
  survey_area_name: string;
  geometry: Feature[];
}

export interface ISurveyUpdateRequest {
  survey_name: string;
  survey_purpose: string;
  focal_species: number[];
  ancillary_species: number[];
  start_date: string;
  end_date: string;
  biologist_first_name: string;
  biologist_last_name: string;
  survey_area_name: string;
  geometry: Feature[];
  revision_count: number;
}

export interface IGetSurveyForUpdateResponse extends ISurveyUpdateRequest {}

/**
 * An interface for a single instance of project survey metadata, for view-only use cases.
 *
 * @export
 * @interface IGetSurveyForViewResponse
 */
export interface IGetSurveyForViewResponse {
  id: number;
  survey: IGetSurvey;
  surveyProprietor: {
    proprietor_type_name: string;
    first_nations_name: string;
    category_rationale: string;
    proprietor_name: string;
    data_sharing_agreement_required: string;
  };
}

/**
 * Get surveys list response object.
 *
 * @export
 * @interface IGetSurveysListResponse
 */
export interface IGetSurveysListResponse {
  id: number;
  name: string;
  species: string[];
  start_date: string;
  end_date: string;
  status_name: string;
}
