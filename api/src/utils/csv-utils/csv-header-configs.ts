import { z } from 'zod';
import { CSVError, CSVHeaderConfig, CSVParams } from './csv-config-validation.interface';
/**
 * Utility function to validate a cell using a Zod schema.
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
        solution: 'Update the cell value to match the expected type',
        cell: params.cell,
        header: params.header,
        rowIndex: params.rowIndex
      });
    });
  }

  return errors;
};

/**
 * Get the TSN header configuration.
 *
 * Rules:
 *  1. The cell must be a number greater than or equal to 0
 *  2. The cell must be a real ITIS TSN
 *
 * @param {Set<number>} tsns The ITIS TSNs
 * @returns {CSVHeaderConfig} The header configuration
 */
export const getTsnHeaderConfig = (tsns: Set<number>): CSVHeaderConfig => {
  return {
    validateCell: (params: CSVParams) => {
      const cellErrors = validateZodCell(params, z.number().min(0));

      if (cellErrors.length) {
        return cellErrors;
      }

      if (!tsns.has(Number(params.cell))) {
        cellErrors.push({
          error: `ITIS has no reference of this TSN`,
          solution: `Use valid ITIS TSN`,
          cell: params.cell,
          header: params.header,
          rowIndex: params.rowIndex
        });
      }

      return cellErrors;
    }
  };
};

/**
 * Get the description header configuration.
 *
 * Rules:
 *  1. The cell must be a string with a maximum length of 250
 *
 * @returns {CSVHeaderConfig} The header configuration
 */
export const getDescriptionHeaderConfig = (): CSVHeaderConfig => {
  return {
    validateCell: (params: CSVParams) => {
      return validateZodCell(params, z.string().max(250));
    }
  };
};

/**
 * Get the Wildlife Health ID header configuration.
 *
 * Rules:
 *  1. The cell must be a string or undefined
 *  2. The Wildlife Health ID must be in the format 'XX-XXXX'
 *
 * @returns {CSVHeaderConfig} The header configuration
 */
export const getWlhIDHeaderConfig = (): CSVHeaderConfig => {
  return {
    validateCell: (params: CSVParams) => {
      const cellErrors = validateZodCell(params, z.string().optional());

      if (cellErrors.length || !params.cell) {
        return cellErrors;
      }

      if (!/^\d{2}-.+/.exec(String(params.cell))) {
        cellErrors.push({
          error: `Invalid Wildlife Health ID format`,
          solution: `Wildlife Health ID must be in the format 'XX-XXXX'`,
          cell: params.cell,
          header: params.header,
          rowIndex: params.rowIndex
        });
      }

      return cellErrors;
    }
  };
};
