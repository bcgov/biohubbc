import { Request } from 'express';
import { ApiPaginationOptions, ApiPaginationResults } from '../zod-schema/pagination';

/**
 * Generates the API pagination options object from the given request.
 *
 * Used in conjunction with a request leveraging the `paginationRequestQueryParamSchema` params.
 *
 * @example
 * GET.apiDoc = {
 *   //...
 *   parameters: [
 *     //...
 *     ...paginationRequestQueryParamSchema
 *   ],
 *   //...
 * }
 *
 * @param {Request} request
 * @return {*}  {Partial<ApiPaginationOptions>}
 */
export const makePaginationOptionsFromRequest = (request: Request): Partial<ApiPaginationOptions> => {
  const page: number | undefined = request.query.page ? Number(request.query.page) : undefined;
  const limit: number | undefined = request.query.limit ? Number(request.query.limit) : undefined;
  const order: 'asc' | 'desc' | undefined = request.query.order
    ? (String(request.query.order) as 'asc' | 'desc')
    : undefined;
  const sort: string | undefined = request.query.sort ? String(request.query.sort) : undefined;

  return {
    limit,
    page,
    sort,
    order
  };
};

/**
 * Generates the pagination response object from the given pagination request params.
 *
 * Used in conjunction with a the output of `makePaginationOptionsFromRequest`.
 *
 * @param {number} total
 * @param {Partial<ApiPaginationOptions>} [pagination]
 * @returns
 */
export const makePaginationResponse = (
  total: number,
  pagination?: Partial<ApiPaginationOptions>
): ApiPaginationResults => {
  return {
    total,
    per_page: pagination?.limit ?? total,
    current_page: pagination?.page ?? 1,
    last_page: pagination?.limit ? Math.max(1, Math.ceil(total / pagination.limit)) : 1,
    sort: pagination?.sort,
    order: pagination?.order
  };
};

/**
 * Returns `ApiPaginationOptions` if the given pagination object contains all of the necessary request params needed to
 * facilitate pagination, otherwise returns `undefined`.
 *
 * Used in conjunction with the output of `makePaginationOptionsFromRequest`.
 *
 * @param {Partial<ApiPaginationOptions>} pagination
 * @returns {boolean}
 */
export const ensureCompletePaginationOptions = (
  pagination: Partial<ApiPaginationOptions>
): ApiPaginationOptions | undefined => {
  if (pagination.limit !== undefined && pagination.page !== undefined) {
    return pagination as ApiPaginationOptions;
  }

  return undefined;
};
