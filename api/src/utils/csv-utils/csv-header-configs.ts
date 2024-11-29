import { z } from 'zod';
import { CSVError, CSVParams } from './csv-config-validation.interface';
/**
 * Utility function to strip the CSV parameters down to the error properties.
 *
 * @param {CSVParams} params - The cell parameters
 * @returns {*} {Pick<CSVError, 'cell' | 'header' | 'rowIndex'>} - The error properties
 */
export const getCSVParamsError = (params: CSVParams): Pick<CSVError, 'cell' | 'header' | 'rowIndex'> => {
  return {
    cell: params.cell,
    header: params.header,
    rowIndex: params.rowIndex
  };
};

/**
 * Utility function to validate a CSV cell using a Zod schema.
 *
 * @param {CSVParams} params - The cell parameters
 * @param {z.ZodSchema} schema - The Zod schema
 * @param {string} [solution] - The solution message
 * @returns {*} {CSVError[]} - The cell validation errors
 */
export const validateZodCell = (params: CSVParams, schema: z.ZodSchema, solution?: string): CSVError[] => {
  const errors: CSVError[] = [];

  const parsed = schema.safeParse(params.cell);

  if (!parsed.success) {
    parsed.error.errors.forEach((error) => {
      errors.push({
        error: error.message,
        solution: solution ?? 'Update the cell value to match the expected type',
        ...getCSVParamsError(params)
      });
    });
  }

  return errors;
};

/**
 * Get the TSN header cell validator.
 *
 * Rules:
 *  1. The cell must be a number greater than or equal to 0
 *  2. The cell must be a real ITIS TSN (from the provided set)
 *
 * @param {Set<number>} tsns Set of allowed ITIS TSNs
 * @returns {*} {(params: CSVParams) => CSVError[]} The validate cell callback
 */
export const getTsnCellValidator = (tsns: Set<number>): ((params: CSVParams) => CSVError[]) => {
  return (params: CSVParams) => {
    const cellErrors = validateZodCell(params, z.number().min(0));

    if (cellErrors.length) {
      return cellErrors;
    }

    if (!tsns.has(Number(params.cell))) {
      cellErrors.push({
        error: `ITIS has no reference of this TSN`,
        solution: `Use valid ITIS TSN`,
        ...getCSVParamsError(params)
      });
    }

    return cellErrors;
  };
};

/**
 * Get the description header cell validator.
 *
 * Rules:
 *  1. The cell must be a string or undefined with a maximum length of 250
 *
 * @returns {*} {(params: CSVParams) => CSVError[]} The validate cell callback
 */
export const getDescriptionCellValidator = (): ((params: CSVParams) => CSVError[]) => {
  return (params: CSVParams) => {
    return validateZodCell(params, z.string().trim().max(250).optional());
  };
};

/**
 * Get the Wildlife Health ID header cell validator.
 *
 * Rules:
 *  1. The cell must be a string or undefined
 *  2. The Wildlife Health ID must be in the format 'XX-XXXX'
 *
 * @returns {*} {(params: CSVParams) => CSVError[]} The validate cell callback
 */
export const getWlhIDCellValidator = (): ((params: CSVParams) => CSVError[]) => {
  return (params: CSVParams) => {
    return validateZodCell(
      params,
      z
        .string()
        .regex(/^\d{2}-.+/, { message: 'Invalid Wildlife Health ID format' })
        .optional(),
      `Wildlife Health ID must be in the format 'XX-XXXX'`
    );
  };
};
