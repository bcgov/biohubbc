export interface IAnimalAdvancedFilters {
  keyword?: string;
  itis_tsns?: number[];
  itis_tsn?: number;
  system_user_id?: number;
}

export interface ISex {
  qualitative_option_id: string;
  label: string;
}
