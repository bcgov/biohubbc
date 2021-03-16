export class CustomError extends Error {
  status: number;
  message: string;
  errors?: Array<string | object>[];

  constructor(status: number, message: string, errors?: Array<string | object>[]) {
    super(message);
    this.status = status;
    this.message = message;
    this.errors = errors || [];
    this.name = 'CustomError';
  }
}
