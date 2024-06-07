import { Knex } from 'knex';
import { ApiPaginationOptions } from '../../zod-schema/pagination';

/**
 * Apply pagination to the query.
 *
 * @param {Knex.QueryBuilder} query The query builder.
 * @param {ApiPaginationOptions} [pagination] The pagination options.
 * @return {Knex.QueryBuilder} The query builder with applied pagination.
 */
export function applyPagination(query: Knex.QueryBuilder, pagination?: ApiPaginationOptions): Knex.QueryBuilder {
  if (pagination) {
    query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

    if (pagination.sort && pagination.order) {
      query.orderBy(pagination.sort, pagination.order);
    }
  }

  return query;
}
