/**
 * A type used to capture boolean values in form controls (which don't support real boolean values).
 */
export type StringBoolean = 'true' | 'false';

/**
 * Defines the supported server-side pagination options.
 */
export type ApiPaginationRequestOptions = {
  /**
   * The page number to retrieve. Starts at 1.
   *
   * @type {number}
   */
  page: number;
  /**
   * The number of items to retrieve per page.
   *
   * @type {number}
   */
  limit: number;
  /**
   * The field to sort by.
   *
   * @type {string}
   */
  sort?: string;
  /**
   * The direction to sort by.
   *
   * @type {('asc' | 'desc')}
   */
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
