import { z } from "zod";

/**
 * Object used to make paginated requests
 */
export const ApiPaginationOptions = z.object({
    limit: z.number(),
    page: z.number(),
});

export type ApiPaginationOptions = z.infer<typeof ApiPaginationOptions>;

/**
 * Object used to represent results from paginated queries
 */
export const ApiPaginationResults = z.object({
    total: z.number(),
    per_page: z.number(),
    current_page: z.number(),
    last_page: z.number()
});

export type ApiPaginationResults = z.infer<typeof ApiPaginationOptions>;