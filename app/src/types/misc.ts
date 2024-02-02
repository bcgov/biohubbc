export type StringBoolean = 'true' | 'false';

export type ApiPaginationOptions = {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
};
