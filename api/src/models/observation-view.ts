export interface IObservationAdvancedFilters {
  minimum_date?: string;
  maximum_date?: string;
  keyword?: string;
  minimum_count?: number;
  minimum_time?: string;
  maximum_time?: string;
  system_user_id?: string;
  itis_tsns?: number[];
}
