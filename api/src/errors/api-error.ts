import { BaseError } from './base-error';

export enum ApiErrorType {
  BUILD_SQL = 'Error constructing SQL query',
  EXECUTE_SQL = 'Error executing SQL query',
  GENERAL = 'Error',
  UNKNOWN = 'Unknown Error'
}

export class ApiError extends BaseError {
  constructor(name: ApiErrorType, message: string, errors?: (string | object)[], stack?: string) {
    super(name, message, errors, stack);
  }
}

/**
 * Api encountered an error.
 *
 * @export
 * @class ApiGeneralError
 * @extends {ApiError}
 */
export class ApiGeneralError extends ApiError {
  constructor(message: string, errors?: (string | object)[]) {
    super(ApiErrorType.GENERAL, message, errors);
  }
}

/**
 * API encountered an unknown/unexpected error.
 *
 * @export
 * @class ApiUnknownError
 * @extends {ApiError}
 */
export class ApiUnknownError extends ApiError {
  constructor(message: string, errors?: (string | object)[]) {
    super(ApiErrorType.UNKNOWN, message, errors);
  }
}

/**
 * API executed a query against the database, but the response was missing data, or indicated the query failed.
 *
 * Examples:
 * - A query to select rows that are expected to exist returns with `rows=[]`.
 * - A query to insert a new record returns with `rowCount=0` indicating no new row was added.
 *
 * @export
 * @class ApiExecuteSQLError
 * @extends {ApiError}
 */
export class ApiExecuteSQLError extends ApiError {
  constructor(message: string, errors?: (string | object)[]) {
    super(ApiErrorType.EXECUTE_SQL, message, errors);
  }
}

/**
 * API failed to build SQL a query.
 *
 * @export
 * @class ApiBuildSQLError
 * @extends {ApiError}
 */
export class ApiBuildSQLError extends ApiError {
  constructor(message: string, errors?: (string | object)[]) {
    super(ApiErrorType.BUILD_SQL, message, errors);
  }
}
