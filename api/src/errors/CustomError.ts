export class CustomError implements Error {
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

export class HTTP400 extends CustomError {
  constructor(message: string, errors?: (string | object)[]) {
    super('Bad Request', 400, message, errors);
  }
}

export class HTTP401 extends CustomError {
  constructor(message: string, errors?: (string | object)[]) {
    super('Unauthorized', 401, message, errors);
  }
}

export class HTTP403 extends CustomError {
  constructor(message: string, errors?: (string | object)[]) {
    super('Forbidden', 403, message, errors);
  }
}

export class HTTP409 extends CustomError {
  constructor(message: string, errors?: (string | object)[]) {
    super('Conflict', 409, message, errors);
  }
}

export class HTTP500 extends CustomError {
  constructor(message: string, errors?: (string | object)[]) {
    super('Internal Server Error', 500, message, errors);
  }
}

/**
 * Ensures that the error is a `CustomError`.
 * If `error` is a `CustomError`, then change nothing and return it.
 * If `error` is not a `CustomError`, wrap it into an `HTTP500` error.
 *
 * @param {Error} error
 * @param {strign} [message]
 * @return {*}
 */
export const ensureCustomError = (error: Error) => {
  if (error instanceof CustomError) {
    return error;
  }

  return new HTTP500(error.name, [error.stack || '']);
};
