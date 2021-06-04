import { Feature } from 'geojson';

interface IGetSearchResultsSurvey {
  id: number;
  name: string;
}

/**
 * Get search results list response object.
 *
 * @export
 * @interface IGetSearchResultsListResponse
 */
export interface IGetSearchResultsListResponse {
  project_name: string;
  regions: string[];
  funding_agency_name: string[];
  funding_agency_project_id: string[];
  coordinator_agency_name: string;
  surveys: IGetSearchResultsSurvey[];
  start_date: string;
  end_date: string;
}

/**
 * An interface for an instance of filter fields for search results
 */
export interface ISearchResultsAdvancedFilterRequest {
  keyword: string;
  project_name: string;
  start_date: string;
  end_date: string;
  regions: string[];
  agency_id: number;
  agency_project_id: string;
  coordinator_agency: string;
  species: number[];
}

export interface IGetSurveyOccurrenceForViewResponse {
  geometry: Feature[];
}
