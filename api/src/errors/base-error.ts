export class BaseError extends Error {
  errors: (string | object)[] = [];

  constructor(name: string, message: string, errors?: (string | object)[], stack?: string) {
    super(message);

    this.name = name;

    for (const error of errors ?? []) {
      if (error instanceof Error) {
        // By default, properties of Error objects are not enumerable, so we need to manually extract them.
        this.errors.push({ name: error.name, message: error.message });
      } else {
        this.errors.push(error);
      }
    }

    // If a stack is provided, use it. Otherwise, generate a new stack trace.
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this);
    }
  }
}
