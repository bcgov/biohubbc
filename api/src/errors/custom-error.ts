export interface IApiError {
  name: string;
  message: string;
  errors?: (string | object)[];
}

export class ApiError implements IApiError, Error {
  name: string;
  message: string;
  errors?: (string | object)[];

  constructor(name: string, message: string, errors?: (string | object)[]) {
    this.name = name;
    this.message = message;
    this.errors = errors || [];
  }
}

export interface IHTTPError {
  name: string;
  status: number;
  message: string;
  errors?: (string | object)[];
}

export class HTTPError implements IApiError, IHTTPError, Error {
  name: string;
  status: number;
  message: string;
  errors?: (string | object)[];

  constructor(name: string, status: number, message: string, errors?: (string | object)[]) {
    this.name = name;
    this.status = status;
    this.message = message;
    this.errors = errors || [];
  }
}

export class HTTP400 extends HTTPError {
  constructor(message: string, errors?: (string | object)[]) {
    super('Bad Request', 400, message, errors);
  }
}

export class HTTP401 extends HTTPError {
  constructor(message: string, errors?: (string | object)[]) {
    super('Unauthorized', 401, message, errors);
  }
}

export class HTTP403 extends HTTPError {
  constructor(message: string, errors?: (string | object)[]) {
    super('Forbidden', 403, message, errors);
  }
}

export class HTTP409 extends HTTPError {
  constructor(message: string, errors?: (string | object)[]) {
    super('Conflict', 409, message, errors);
  }
}

export class HTTP500 extends HTTPError {
  constructor(message: string, errors?: (string | object)[]) {
    super('Internal Server Error', 500, message, errors);
  }
}

/**
 * Ensures that the incoming error is converted into an `HTTPError` if it is not one already.
 * If `error` is a `HTTPError`, then change nothing and return it.
 * If `error` is a `ApiError`, wrap it into an `HTTP500` error and return it.
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
    return new HTTP500(error.message, error.errors);
  }

  if (error instanceof Error) {
    return new HTTP500(error.message || error.name, [error.stack || '']);
  }

  return new HTTP500('Unexpected Error');
};
