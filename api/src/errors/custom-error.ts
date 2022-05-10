import { DatabaseError } from 'pg';

export enum ApiErrorType {
  BUILD_SQL = 'Error constructing SQL query',
  EXECUTE_SQL = 'Error executing SQL query',
  GENERAL = 'Error',
  UNKNOWN = 'Unknown Error'
}

export class ApiError extends Error {
  errors?: (string | object)[];

  constructor(name: ApiErrorType, message: string, errors?: (string | object)[], stack?: string) {
    super(message);

    this.name = name;
    this.errors = errors || [];
    this.stack = stack;

    if (stack) {
      this.stack = stack;
    }

    if (!this.stack) {
      Error.captureStackTrace(this);
    }
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

export enum HTTPErrorType {
  BAD_REQUEST = 'Bad Request',
  UNAUTHORIZE = 'Unauthorized',
  FORBIDDEN = 'Forbidden',
  CONFLICT = 'Conflict',
  INTERNAL_SERVER_ERROR = 'Internal Server Error'
}

export class HTTPError extends Error {
  status: number;
  errors?: (string | object)[];

  constructor(name: HTTPErrorType, status: number, message: string, errors?: (string | object)[], stack?: string) {
    super(message);

    this.name = name;
    this.status = status;
    this.errors = errors || [];

    if (stack) {
      this.stack = stack;
    }

    if (!this.stack) {
      Error.captureStackTrace(this);
    }
  }
}

/**
 * HTTP `400 Bad Request` error.
 *
 * @export
 * @class HTTP400
 * @extends {HTTPError}
 */
export class HTTP400 extends HTTPError {
  constructor(message: string, errors?: (string | object)[]) {
    super(HTTPErrorType.BAD_REQUEST, 400, message, errors);
  }
}

/**
 * HTTP `401 Unauthorized` error.
 *
 * @export
 * @class HTTP401
 * @extends {HTTPError}
 */
export class HTTP401 extends HTTPError {
  constructor(message: string, errors?: (string | object)[]) {
    super(HTTPErrorType.UNAUTHORIZE, 401, message, errors);
  }
}

/**
 * HTTP `403 Forbidden` error.
 *
 * @export
 * @class HTTP403
 * @extends {HTTPError}
 */
export class HTTP403 extends HTTPError {
  constructor(message: string, errors?: (string | object)[]) {
    super(HTTPErrorType.FORBIDDEN, 403, message, errors);
  }
}

/**
 * HTTP `409 Conflict` error.
 *
 * @export
 * @class HTTP409
 * @extends {HTTPError}
 */
export class HTTP409 extends HTTPError {
  constructor(message: string, errors?: (string | object)[]) {
    super(HTTPErrorType.CONFLICT, 409, message, errors);
  }
}

/**
 * HTTP `500 Internal Server Error` error.
 *
 * @export
 * @class HTTP500
 * @extends {HTTPError}
 */
export class HTTP500 extends HTTPError {
  constructor(message: string, errors?: (string | object)[]) {
    super(HTTPErrorType.INTERNAL_SERVER_ERROR, 500, message, errors);
  }
}

/**
 * Ensures that the incoming error is converted into an `HTTPError` if it is not one already.
 * If `error` is a `HTTPError`, then change nothing and return it.
 * If `error` is a `ApiError`, wrap it into an `HTTP500` error and return it.
 * If `error` is a `DatabaseError`, wrap it into an `HTTP500` error and return it.
 * If `error` is a `Error`, wrap it into an `HTTP500` error and return it.
 * If `error` is none of the above, create a new generic `HTTP500` error and return it.
 *
 * @param {(HTTPError | ApiError | Error | any)} error
 * @return {HTTPError} An instance of `HTTPError`
 */
export const ensureHTTPError = (error: HTTPError | ApiError | Error | any): HTTPError => {
  if (error instanceof HTTPError) {
    return error;
  }

  if (error instanceof ApiError) {
    return new HTTPError(HTTPErrorType.INTERNAL_SERVER_ERROR, 500, error.message, error.errors, error.stack);
  }

  if (error instanceof DatabaseError) {
    return new HTTPError(
      HTTPErrorType.INTERNAL_SERVER_ERROR,
      500,
      'Unexpected Database Error',
      [{ ...error, message: error.message }],
      error.stack
    );
  }

  if (error instanceof Error) {
    return new HTTP500('Unexpected Error', [error.name, error.message]);
  }

  return new HTTP500('Unexpected Error');
};
