import { z } from 'zod';

export const ApiPaginationSorting = z.object({
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional()
});

export type ApiPaginationSorting = z.infer<typeof ApiPaginationSorting>;

/**
 * Object used to make paginated requests
 */
export const ApiPaginationOptions = ApiPaginationSorting.extend({
  limit: z.number(),
  page: z.number().min(1)
});

export type ApiPaginationOptions = z.infer<typeof ApiPaginationOptions>;

/**
 * Object used to represent results from paginated queries
 */
export const ApiPaginationResults = ApiPaginationSorting.extend({
  total: z.number(),
  per_page: z.number(),
  current_page: z.number(),
  last_page: z.number()
});

export type ApiPaginationResults = z.infer<typeof ApiPaginationResults>;
