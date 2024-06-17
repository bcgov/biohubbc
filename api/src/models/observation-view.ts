export interface IObservationAdvancedFilters {
  keyword?: string;
  itis_tsns?: number[];
  itis_tsn?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  min_count?: number;
  // Filter by other users (admin only)
  system_user_id?: number;
}
