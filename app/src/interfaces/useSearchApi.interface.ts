/**
 * Get search results list response object.
 *
 * @export
 * @interface IGetSearchResultsListResponse
 */
export interface IGetSearchResultsListResponse {
  id: number;
  name: string;
  project_name: string;
  regions_list: string;
  species_list: string;
  funding_agency_name: string;
  funding_agency_project_id: string;
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
  species: number[];
}
