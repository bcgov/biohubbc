import { DatabaseError } from 'pg';
import { CSVError } from '../utils/csv-utils/csv-config-validation.interface';
import { ApiConflictError, ApiError } from './api-error';
import { BaseError } from './base-error';

export enum HTTPErrorType {
  BAD_REQUEST = 'Bad Request',
  UNAUTHORIZE = 'Unauthorized',
  FORBIDDEN = 'Forbidden',
  CONFLICT = 'Conflict',
  INTERNAL_SERVER_ERROR = 'Internal Server Error'
}

export enum HTTPCustomErrorType {
  CSV_VALIDATION_ERROR = 'CSV Validation Error'
}

export class HTTPError extends BaseError {
  status: number;

  constructor(
    name: HTTPErrorType | HTTPCustomErrorType,
    status: number,
    message: string,
    errors?: (string | object)[],
    stack?: string
  ) {
    super(name, message, errors, stack);

    this.status = status;
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
  constructor(message: string, errors?: (string | object)[], stack?: string) {
    super(HTTPErrorType.BAD_REQUEST, 400, message, errors, stack);
  }

  static fromApiError(apiError: ApiError) {
    return new HTTP400(apiError.message, apiError.errors, apiError.stack);
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
  constructor(message: string, errors?: (string | object)[], stack?: string) {
    super(HTTPErrorType.UNAUTHORIZE, 401, message, errors, stack);
  }

  static fromApiError(apiError: ApiError) {
    return new HTTP401(apiError.message, apiError.errors, apiError.stack);
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
  constructor(message: string, errors?: (string | object)[], stack?: string) {
    super(HTTPErrorType.FORBIDDEN, 403, message, errors, stack);
  }

  static fromApiError(apiError: ApiError) {
    return new HTTP403(apiError.message, apiError.errors, apiError.stack);
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
  constructor(message: string, errors?: (string | object)[], stack?: string) {
    super(HTTPErrorType.CONFLICT, 409, message, errors, stack);
  }

  static fromApiError(apiError: ApiError) {
    return new HTTP409(apiError.message, apiError.errors, apiError.stack);
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
  constructor(message: string, errors?: (string | object)[], stack?: string) {
    super(HTTPErrorType.INTERNAL_SERVER_ERROR, 500, message, errors, stack);
  }

  static fromApiError(apiError: ApiError) {
    return new HTTP500(apiError.message, apiError.errors, apiError.stack);
  }
}

/**
 * A HTTP `422 CSV Validation Error` error.
 *
 * @export
 * @class CSVValidationError
 * @extends {HTTPError}
 */
export class HTTP422CSVValidationError extends HTTPError {
  constructor(message: string, errors: CSVError[], stack?: string) {
    super(HTTPCustomErrorType.CSV_VALIDATION_ERROR, 422, message, errors, stack);
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

  if (error instanceof ApiConflictError) {
    return HTTP409.fromApiError(error);
  }

  if (error instanceof ApiError) {
    return HTTP500.fromApiError(error);
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

  if (isAjvError(error)) {
    return new HTTPError(HTTPErrorType.BAD_REQUEST, error.status, 'Request Validation Error', error.errors);
  }

  if (error instanceof Error) {
    return new HTTP500('Unexpected Error', [{ name: error.name, message: error.message }]);
  }

  return new HTTP500('Unexpected Error', [error]);
};

/**
 * Checks if an error object is a AJV validation error.
 *
 * @see https://github.com/kogosoftwarellc/open-api/blob/main/packages/openapi-request-validator/index.ts
 * @param {any} error - Error object
 * @returns {boolean}
 */
export const isAjvError = (error: any): error is { status: number; errors: any[] } => {
  return typeof error === 'object' && 'status' in error && 'errors' in error;
};
