import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';

/**
 * An asynchronous wrapper function that will catch any exceptions thrown by the wrapped function
 *
 * @param fn the function to be wrapped
 * @returns Promise<WrapperReturn> A Promise with the wrapped functions return value
 */
export const asyncErrorWrapper = <WrapperArgs extends any[], WrapperReturn>(
  fn: (...args: WrapperArgs) => Promise<WrapperReturn>
) => async (...args: WrapperArgs): Promise<WrapperReturn> => {
  try {
    return await fn(...args);
  } catch (err) {
    throw parseError(err);
  }
};

/**
 * A synchronous wrapper function that will catch any exceptions thrown by the wrapped function
 *
 * @param fn the function to be wrapped
 * @returns WrapperReturn The wrapped functions return value
 */
export const syncErrorWrapper = <WrapperArgs extends any[], WrapperReturn>(
  fn: (...args: WrapperArgs) => WrapperReturn
) => (...args: WrapperArgs): WrapperReturn => {
  try {
    return fn(...args);
  } catch (err) {
    throw parseError(err);
  }
};

/**
 * This function parses the passed in error and translates them into a human readable error
 *
 * @param error error to be parsed
 * @returns an error to throw
 */
const parseError = (error: any) => {
  if (error instanceof z.ZodError) {
    throw new ApiExecuteSQLError('SQL response failed schema check', [error]);
  }

  if (error.message === 'CONCURRENCY_EXCEPTION') {
    // error thrown by DB trigger based on revision_count
    // will be thrown if two updates to the same record are made concurrently
    throw new ApiExecuteSQLError('Failed to update stale data', [error]);
  }

  // Generic error thrown if not captured above
  throw new ApiExecuteSQLError('Failed to execute SQL', [error]);
};

/**
 * A re-definition of the pg `QueryResult` type using Zod.
 *
 * @template T
 * @param {T} zodQueryResultRow A zod schema, used to define the `rows` field of the response. In pg, this would
 * be the `QueryResultRow` type.
 */
export const getZodQueryResult = <T extends z.Schema>(zodQueryResultRow: T) =>
  z.object({
    rows: z.array(zodQueryResultRow),
    command: z.string(),
    rowCount: z.number(),
    // Using `coerce` as a workaround for an issue with the QueryResult type definition: it specifies oid is always a
    // number, but in reality it can return `null`.
    oid: z.coerce.number(),
    fields: z.array(
      z.object({
        name: z.string(),
        tableID: z.number(),
        columnID: z.number(),
        dataTypeID: z.number(),
        dataTypeSize: z.number(),
        dataTypeModifier: z.number(),
        format: z.string()
      })
    )
  });
