import { z } from 'zod';
import { CSVError, CSVParams } from './csv-utils.interface';

/**
 * Validate a cell using a Zod schema.
 *
 * @param {CSVParams} params - The cell parameters
 * @param {z.ZodSchema} schema - The Zod schema
 * @returns {CSVError[]} - The cell validation errors
 */
export const validateZodCell = (params: CSVParams, schema: z.ZodSchema): CSVError[] => {
  const errors: CSVError[] = [];

  const parsed = schema.safeParse(params.cell);

  if (!parsed.success) {
    parsed.error.errors.forEach((error) => {
      errors.push({
        error: error.message,
        solution: 'Please enter a valid value',
        rowIndex: params.rowIndex,
        header: params.header
      });
    });
  }

  return errors;
};
