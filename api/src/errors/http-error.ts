import { DatabaseError } from 'pg';
import { ApiError } from './api-error';

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
