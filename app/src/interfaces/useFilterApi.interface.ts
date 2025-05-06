import { ISurveyAdvancedFilters } from 'features/summary/list-data/survey/SurveysListFilterForm';
import { ApiPaginationResponseParams } from 'types/misc';

export interface IGetSurveyFiltersResponse {
  filters: ISurveyFilter[];
  pagination: ApiPaginationResponseParams;
}

export interface ISurveyFilter {
  survey_filter_id: number;
  name: string;
  description: string | null;
  conditions: ISurveyAdvancedFilters;
}

export interface IPostSurveyFilter {
  name: string;
  description: string | null;
  conditions: ISurveyAdvancedFilters;
}

export interface IPutSurveyFilter extends IPostSurveyFilter {
  survey_filter_id: number;
}
