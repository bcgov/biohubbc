import { z } from 'zod';
import { formatTimeString } from '../../services/import-services/utils/datetime';
import { CSVCellSetter, CSVCellValidator, CSVError, CSVParams } from './csv-config-validation.interface';

type CSVOptional = {
  optional: boolean;
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
        error: `Did not receive a Taxonomic Serial Number (TSN) for the species`,
        solution: `Use a valid Taxonomic Serial Number (TSN) instead of a name to reference species.`
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
    return validateZodCell(params, z.string().trim().min(1).max(250).optional());
  };
};

/**
 * Get the time header cell validator.
 *
 * Rules:
 *  1. The cell must be a valid 24-hour time format 'HH:mm:ss' or 'HH:mm' or undefined
 *
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getTimeCellValidator = (): CSVCellValidator => {
  return (params: CSVParams) => {
    if (params.cell === undefined || formatTimeString(String(params.cell))) {
      return [];
    }

    return [
      {
        error: `Use a valid 24-hour time format 'HH:mm:ss' or 'HH:mm'`,
        solution: `Update the cell value to match the expected format`
      }
    ];
  };
};

/**
 * Get the time header cell setter.
 *
 * @returns {*} {CSVCellSetter} The set cell callback
 */
export const getTimeCellSetter = (): CSVCellSetter => {
  return (params: CSVParams) => {
    if (params.cell === undefined) {
      return undefined;
    }

    return formatTimeString(String(params.cell));
  };
};

/**
 * Get the latitude header cell validator.
 *
 * Rules:
 *  1. The cell must be a number between -90 and 90 or undefined if optional
 *
 * @param {CSVOptional} options - The CSV options
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getLatitudeCellValidator = (options: CSVOptional): CSVCellValidator => {
  return (params) => {
    if (options.optional) {
      return validateZodCell(params, z.number().min(-90).max(90).optional());
    }

    return validateZodCell(params, z.number().min(-90).max(90));
  };
};

/**
 * Get the longitude header cell validator.
 *
 * Rules:
 *  1. The cell must be a number between -180 and 180 or undefined if optional
 *
 * @param {CSVOptional} options - The CSV options
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getLongitudeCellValidator = (options: CSVOptional): CSVCellValidator => {
  return (params) => {
    if (options.optional) {
      return validateZodCell(params, z.number().min(-180).max(180).optional());
    }

    return validateZodCell(params, z.number().min(-180).max(180));
  };
};

/**
 * Get the date header cell validator.
 *
 * Rules:
 *  1. The cell must be a valid date string (YYYY-MM-DD) or undefined if optional
 *
 * @param {CSVOptional} options - The CSV options
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getDateCellValidator = (options: CSVOptional): CSVCellValidator => {
  return (params) => {
    if (options.optional) {
      return validateZodCell(params, z.string().date().optional());
    }

    return validateZodCell(params, z.string().date());
  };
};
