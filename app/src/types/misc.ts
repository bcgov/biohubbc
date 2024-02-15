export type StringBoolean = 'true' | 'false';

export type ApiPaginationOptions = {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
};

export type ApiPaginationResponseParams = {
  total: number;
  current_page: number;
  last_page: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
};
