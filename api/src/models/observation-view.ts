export interface IObservationAdvancedFilters {
  minimum_date?: string;
  maximum_date?: string;
  keyword?: string;
  minimum_count?: number;
  minimum_time?: string;
  maximum_time?: string;
  system_user_id?: number;
  itis_tsns?: number[];
}
