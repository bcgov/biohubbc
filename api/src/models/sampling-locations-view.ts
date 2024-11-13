export interface ISiteAdvancedFilters {
  survey_id?: number;
  keyword?: string;
  system_user_id?: number;
}

export interface IMethodAdvancedFilters {
  survey_id?: number;
  sample_site_id?: number;
  keyword?: string;
  system_user_id?: number;
}

export interface IPeriodAdvancedFilters {
  survey_id?: number;
  sample_site_id?: number;
  sample_method_id?: number;
  system_user_id?: number;
}
