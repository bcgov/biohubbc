import { z } from 'zod';
import { CSVCellValidator, CSVError, CSVParams } from './csv-config-validation.interface';

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
        solution: solution ?? 'Update the cell value to match the expected type'
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
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getTsnCellValidator = (tsns: Set<number>): CSVCellValidator => {
  return (params: CSVParams) => {
    if (tsns.has(Number(params.cell))) {
      return [];
    }

    return [
      {
        error: `ITIS has no reference of this TSN`,
        solution: `Use valid ITIS TSN`
      }
    ];
  };
};

/**
 * Get the description header cell validator.
 *
 * Rules:
 *  1. The cell must be a string or undefined with a maximum length of 250
 *
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getDescriptionCellValidator = (): CSVCellValidator => {
  return (params: CSVParams) => {
    return validateZodCell(params, z.string().trim().max(250).optional());
  };
};

/**
 * Get the Wildlife Health ID header cell validator.
 *
 * Rules:
 *  1. The Wildlife Health ID must be in the format 'XX-XXXX' or undefined
 *
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getWlhIDCellValidator = (): CSVCellValidator => {
  return (params: CSVParams) => {
    if (params.cell === undefined || String(params.cell).match(/^\d{2}-.+/)) {
      return [];
    }

    return [
      {
        error: `Wildlife Health ID must be in the format 'XX-XXXX'`,
        solution: `Update the Wildlife Health ID to match the expected format`
      }
    ];
  };
};
