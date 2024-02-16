export type StringBoolean = 'true' | 'false';

/**
 * Represents server-side pagination options passed as request parameters
 */
export type ApiPaginationOptions = { // TODO rename (on app side) to ApiPaginationRequestOptions
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
};

/**
 * Represents server-side pagination state given by the server
 */
export type ApiPaginationResponseParams = {
  total: number;
  current_page: number;
  last_page: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
};
