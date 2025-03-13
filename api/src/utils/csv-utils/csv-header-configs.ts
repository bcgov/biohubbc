import { z } from 'zod';
import { ICritterDetailed } from '../../services/critterbase-service';
import { updateCSVRowState } from '../../services/import-services/utils/row-state';
import { TaxonMap } from '../../services/import-services/utils/taxon';
import { CaseInsensitiveMap } from '../case-insensitive-map';
import { formatTimeString, isDateString } from '../date-time-utils';
import {
  CSVArrayCellValidatorOptions,
  CSVCell,
  CSVCellSetter,
  CSVCellValidator,
  CSVCellValidatorOptions,
  CSVError,
  CSVParams
} from './csv-config-validation.interface';

/**
 * Utility function to validate a CSV cell using a Zod schema.
 *
 * @param {unkown} cell - The cell value
 * @param {z.ZodSchema} schema - The Zod schema
 * @param {string} [solution] - The solution message
 * @returns {*} {CSVError[]} - The cell validation errors
 */
export const validateZodCell = (cell: unknown, schema: z.ZodSchema, solution?: string): CSVError[] => {
  const errors: CSVError[] = [];

  const parsed = schema.safeParse(cell, {
    // Custom error message mapping
    errorMap: (_issue, ctx) => {
      if (ctx.defaultError === 'Required') {
        return { message: 'Cell is required' };
      }

      return { message: ctx.defaultError };
    }
  });

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
 * Get the positive number header cell validator.
 *
 * Rules:
 *  1. The cell must be a positive number
 *  2. The cell is optional if the optional flag is set
 *
 * @param {CSVCellValidatorOptions} [options] Optional cell config override
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getPositiveNumberCellValidator = (options?: CSVCellValidatorOptions): CSVCellValidator => {
  return (params: CSVParams) => {
    if (options?.optional && params.cell === undefined) {
      return [];
    }

    return validateZodCell(params.cell, z.number().positive());
  };
};

/**
 * Get the non-empty string header cell validator.
 *
 * Rules:
 *  1. The cell must be a non-empty string
 *  2. The cell is optional if the optional flag is set
 *
 * @param {CSVCellValidatorOptions} [options] Optional cell config override
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getNonEmptyStringCellValidator = (options?: CSVCellValidatorOptions) => {
  return (params: CSVParams) => {
    if (options?.optional && params.cell === undefined) {
      return [];
    }

    return validateZodCell(params.cell, z.string().trim().min(1));
  };
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
 * TODO: Add optional flag to allow undefined values conditionally
 *
 * Rules:
 *  1. The cell must be a string with a maximum length of 250
 *  2. The cell is optional if the optional flag is set
 *
 * @param {CSVCellValidatorOptions} [options] Optional cell config override
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getDescriptionCellValidator = (options?: CSVCellValidatorOptions): CSVCellValidator => {
  return (params: CSVParams) => {
    if (options?.optional && params.cell === undefined) {
      return [];
    }

    if (typeof params.cell === 'number') {
      // Allow numbers to be converted to strings for descriptions
      params.mutateCell = String(params.cell);
    }

    return validateZodCell(params.mutateCell, z.string().trim().min(1).max(250));
  };
};

/**
 * Get the time header cell validator.
 *
 * TODO: Add optional flag to allow undefined values conditionally
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
 * @param {CSVCellValidatorOptions} [options] - The CSV options
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getLatitudeCellValidator = (options?: CSVCellValidatorOptions): CSVCellValidator => {
  return (params) => {
    if (options?.optional && params.cell === undefined) {
      return [];
    }

    return validateZodCell(params.cell, z.number().min(-90).max(90));
  };
};

/**
 * Get the longitude header cell validator.
 *
 * Rules:
 *  1. The cell must be a number between -180 and 180 or undefined if optional
 *
 * @param {CSVCellValidatorOptions} [options] - The CSV options
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getLongitudeCellValidator = (options?: CSVCellValidatorOptions): CSVCellValidator => {
  return (params) => {
    if (options?.optional && params.cell === undefined) {
      return [];
    }

    return validateZodCell(params.cell, z.number().min(-180).max(180));
  };
};

/**
 * Get the date header cell validator.
 *
 * Rules:
 *  1. The cell must be a valid date string (YYYY-MM-DD) or undefined if optional
 *
 * @param {CSVCellValidatorOptions} [options] - The CSV options
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getDateCellValidator = (options?: CSVCellValidatorOptions): CSVCellValidator => {
  return (params) => {
    if (options?.optional && params.cell === undefined) {
      return [];
    }

    return validateZodCell(params.cell, z.string().date());
  };
};

/**
 * Get the survey critter alias cell validator.
 *
 * Note: This validator will update the row state with critter ID - `critterId`.
 *
 * Rules:
 *  1. The cell must be a valid critter alias that exists in the Survey alias map
 *
 * @param {Map<string, ICritterDetailed>} surveyAliasMap The survey alias map
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getSurveyCritterAliasCellValidator = (surveyAliasMap: Map<string, ICritterDetailed>): CSVCellValidator => {
  return (params) => {
    const critter = surveyAliasMap.get(String(params.cell).toLowerCase());

    if (!critter) {
      return [
        {
          error: `Unable to find a matching survey critter`,
          solution: `Use a valid critter alias that exists in the Survey`
        }
      ];
    }

    // Update the row state with the critter ID
    updateCSVRowState(params.row, { critterId: critter.critter_id });

    return [];
  };
};

/**
 * Get the date range header cell validator.
 *
 * Rules:
 *  1. The cell must be a valid date range format:
 *    A. 'YYYY-MM-DD - YYYY-MM-DD'
 *    B. 'YYYY-MM-DD HH:mm:ss - YYYY-MM-DD HH:mm:ss'
 *  2. The cell is optional if the optional flag is set
 *
 * @param {CSVCellValidatorOptions} [options] Optional cell config override
 * @returns {*} {CSVCellValidator} The validate cell callback
 *
 */
export const getDateRangeCellValidator = (options?: CSVCellValidatorOptions): CSVCellValidator => {
  return (params) => {
    if (options?.optional && params.cell === undefined) {
      return [];
    }

    const dateParts = String(params.cell).split(' - ');

    if (dateParts.length !== 2 || !dateParts.every(isDateString)) {
      return [
        {
          error: 'Invalid date range',
          solution:
            "Use a valid date range format: 'YYYY-MM-DD - YYYY-MM-DD' OR 'YYYY-MM-DD HH:mm:ss - YYYY-MM-DD HH:mm:ss'"
        }
      ];
    }

    return [];
  };
};

/**
 * Get the lookup ID cell validator - case-insensitive.
 * This validator is used to validate a cell value against a list of lookup values.
 *
 * Note: This validator will update the mutate cell value to the lookup value ID.
 *
 * Rules:
 *  1. The cell must match a value by name in the lookup values list
 *  2. The lookup values are case-insensitive
 *
 * @param {Array<{ name: string; id: string | number }>} values List of lookup value objects
 * @param {CSVCellValidatorOptions & {
 *  getError: (params: CSVParams) => string;
 *  getSolution: (params: CSVParams) => string }
 *  } options The cell options
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getLookupIdCellValidator = (
  values: Array<{ name: string; id: string | number }>,
  options: CSVCellValidatorOptions & {
    getError: (params: CSVParams) => string;
    getSolution: (params: CSVParams) => string;
  }
): CSVCellValidator => {
  const lookupValueMap = new CaseInsensitiveMap(values.map((value) => [value.name, value.id]));
  const lookupValues = values.map((value) => value.name);

  return (params) => {
    // Allow optional cells to be empty if configured
    if (options.optional && params.cell === undefined) {
      return [];
    }

    // Check if the cell value matches a lookup value by name (case-insensitive)
    const lookupValueId = lookupValueMap.get(String(params.cell));

    // Update the row state with the lookup ID
    if (lookupValueId) {
      params.mutateCell = lookupValueId;

      return [];
    }

    // Return an error if the cell value is not a valid reference value
    return [
      {
        error: options.getError(params),
        solution: options.getSolution(params),
        header: params.header,
        cell: params.cell,
        values: lookupValues
      }
    ];
  };
};

/**
 * Get the taxon header cell validator.
 *
 * Rules:
 *  1. The cell must be a valid ITIS TSN or scientific name
 *  2. The cell must be a valid species from the provided taxons
 *  3. The row state will be updated with the taxon (TSN and scientific name), appending the values to any existing
 *     taxon state
 *
 * @param {TaxonMap} taxonMap The list of taxons
 * @param {CSVCellValidatorOptions} [options] cell validator options
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getTaxonCellValidator = (taxonMap: TaxonMap, options?: CSVCellValidatorOptions): CSVCellValidator => {
  return (params) => {
    const taxonIdentifierCell = params.cell as CSVCell;
    const taxonHeader = params.header;

    if (taxonIdentifierCell === undefined) {
      if (options?.optional) {
        return [];
      }

      return [
        {
          error: 'Cell is required',
          solution: 'Use a valid ITIS TSN or scientific name',
          header: taxonHeader,
          cell: taxonIdentifierCell
        }
      ];
    }

    const taxon = taxonMap.get(taxonIdentifierCell);

    // If a valid taxon
    if (taxon) {
      // Update the row state with the TSN and scientific name
      updateCSVRowState(
        params.row,
        { taxon: { itis_tsn: taxon.tsn, itis_scientific_name: taxon.scientificName } },
        { append: true }
      );

      return [];
    }

    // If an invalid TSN
    if (typeof taxonIdentifierCell === 'number') {
      return [
        {
          error: 'Invalid ITIS TSN',
          solution: 'Use a valid ITIS TSN',
          header: taxonHeader,
          cell: taxonIdentifierCell
        }
      ];
    }

    // If an invalid scientific name
    if (typeof taxonIdentifierCell === 'string') {
      return [
        {
          error: 'Invalid scientific name',
          solution: 'Use a valid scientific name',
          header: taxonHeader,
          cell: taxonIdentifierCell
        }
      ];
    }

    return [
      {
        error: 'Invalid species',
        solution: 'Expecting a valid ITIS TSN or scientific name',
        header: taxonHeader,
        cell: taxonIdentifierCell
      }
    ];
  };
};
/**
 * Get an array-cell validator, which applies a cell validator to each array-value parsed from the cells original value.
 *
 * Rules:
 *  1. The array-cell values (after splitting by delimiter) must satisfy the cell validator function.
 *
 * @param {CSVCellValidator} csvCellValidator The cell validator to apply to each element in the array
 * @param {CSVArrayCellValidatorOptions} options The array-cell validator options
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getArrayCellValidator = (
  csvCellValidator: CSVCellValidator,
  options: CSVArrayCellValidatorOptions
): CSVCellValidator => {
  return (params: CSVParams) => {
    const cellValue = params.cell;

    if (typeof cellValue === 'string') {
      const cellValues = cellValue
        .split(options.delimiter)
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

      // Execute the cell validator on each element in the array
      return cellValues.flatMap((value) => {
        return csvCellValidator({ ...params, cell: value });
      });
    }

    // Execute the cell validator on the original cell value
    return csvCellValidator({ ...params, cell: cellValue });
  };
};
