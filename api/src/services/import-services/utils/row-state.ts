import { z } from 'zod';
import { ApiGeneralError } from '../../../errors/api-error';
import { CSVRow, CSVRowState, CSVRowStateOptions } from '../../../utils/csv-utils/csv-config-validation.interface';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('import-services/utils/row-state');

/**
 * Helper to update the CSV row state.
 *
 * For each key in the incoming state:
 *  1. If the key does not existing in the row state, it will be added.
 *  2. If the key does already existing in the row state, the existing value will be converted to an array, and the new
 *     value will be appended.
 *
 * Note: To remove a state value set it to `undefined`.
 *
 * @example
 * // rowState = undefined;
 *
 * updateCSVRowState(row, { critter_id: '111' });
 * // rowState = { critter_id: '111' };
 *
 * updateCSVRowState(row, { capture_id: '222' });
 * // rowState = { critter_id: '111', capture_id: '222' };
 *
 * updateCSVRowState(row, { capture_id: '666' });
 * // rowState = { critter_id: '111', capture_id: '666' };
 *
 * updateCSVRowState(row, { critter_id: '333' }, { append: true });
 * // rowState = { critter_id: ['111', '333'], capture_id: '666' };
 *
 * updateCSVRowState(row, { critter_id: undefined });
 * // rowState = { capture_id: '666' };
 *
 * updateCSVRowState(row, { capture_id: undefined });
 * // rowState = {};
 *
 * @param {CSVRow} row - The CSV row
 * @param {Record<string, any>} state - The state to add or update
 * @param {CSVRowStateOptions} [options] - The options
 * @returns {*} {void}
 */
export const updateCSVRowState = (row: CSVRow, state: Record<string, any>, options?: CSVRowStateOptions) => {
  if (!row[CSVRowState]) {
    // Initialize the row state if it does not exist
    row[CSVRowState] = {};
  }

  if (!options?.append) {
    // Set the state, overwriting any existing values with matching keys
    row[CSVRowState] = { ...row[CSVRowState], ...state };
    return;
  }

  // Set the state, appending any existing values with matching keys
  for (const key in state) {
    const newValue = state[key];
    const existingValue = row[CSVRowState][key];

    if (newValue === undefined) {
      // If the new value is undefined, remove the key from the row state
      row[CSVRowState][key] = undefined;
      continue;
    }
    if (existingValue === undefined) {
      // If the existing value is undefined, add the new value to the row state
      row[CSVRowState][key] = newValue;
    } else {
      // If the existing value is defined, append the new value to the existing value
      row[CSVRowState][key] = [].concat(existingValue, newValue);
    }
  }
};

/**
 * Create a row state getter
 *
 * Note: This function allows both the row and the row state to be passed in.
 *
 * @example `
 *  const getFromRowState = createRowStateGetter(z.object({ ... }));
 *  getFromRowState(row)
 *  getFromRowState(row[CSVRowState])
 *  getFromRowState(row[CSVRowState].nestedState)
 *  `
 *
 * @param {z.ZodSchema} schema - The Zod schema to validate the row state
 * @returns {*} {function} - The row state getter
 */
export const createRowStateGetter = <SchemaType extends z.ZodSchema>(schema: SchemaType, label: string) => {
  return (rowOrState: CSVRow | CSVRow[typeof CSVRowState]): z.infer<SchemaType> => {
    let state = rowOrState;

    // Note: The row state is nested under the CSVRowState symbol
    if (_isCSVRow(rowOrState)) {
      // Get the state from the row
      state = rowOrState?.[CSVRowState];
    }

    // Parse the row state using the schema
    const parsedState = schema.safeParse(state);

    // Throw an error if unable to correctly parse the row state
    if (!parsedState.success) {
      defaultLog.debug({
        label: label,
        message: 'Invalid CSV row state',
        state: state,
        errors: parsedState.error
      });

      throw new ApiGeneralError('Invalid CSV row state', [
        {
          state: state,
          errors: parsedState.error
        }
      ]);
    }

    return parsedState.data;
  };
};

/**
 * Check if the object is a CSV row
 *
 * @param {CSVRow | CSVRow[typeof CSVRowState]} rowOrState - The row or row state
 * @returns {boolean} - Whether the row is a CSV row
 */
const _isCSVRow = (rowOrState: CSVRow | CSVRow[typeof CSVRowState]): rowOrState is CSVRow => {
  return Object.getOwnPropertySymbols(rowOrState).includes(CSVRowState);
};

// Critter / Capture
export const getCritterCaptureFromRowState = createRowStateGetter(
  z.object({
    critter_id: z.string().uuid(),
    capture_id: z.string().uuid()
  }),
  'getCritterCaptureFromRowState'
);

// Taxon
export const getTaxonFromRowState = createRowStateGetter(
  z.object({
    taxon: z.object({
      itis_tsn: z.number(),
      itis_scientific_name: z.string()
    })
  }),
  'getTaxonFromRowState'
);

// Taxon array
export const getTaxonArrayFromRowState = createRowStateGetter(
  z.object({
    taxon: z
      .union([
        z.object({
          itis_tsn: z.number(),
          itis_scientific_name: z.string()
        }),
        z.array(
          z.object({
            itis_tsn: z.number(),
            itis_scientific_name: z.string()
          })
        )
      ])
      .optional()
  }),
  'getTaxonArrayFromRowState'
);

// Measurement
export const getQualitativeMeasurementFromRowState = createRowStateGetter(
  z.object({
    taxon_measurement_id: z.string().uuid(),
    qualitative_option_id: z.string().uuid()
  }),
  'getQualitativeMeasurementFromRowState'
);

export const getQuantitativeMeasurementFromRowState = createRowStateGetter(
  z.object({
    taxon_measurement_id: z.string().uuid(),
    value: z.number()
  }),
  'getQuantitativeMeasurementFromRowState'
);

// Environment
export const getQualitativeEnvironmentFromRowState = createRowStateGetter(
  z.object({
    environment_qualitative_id: z.string().uuid(),
    environment_qualitative_option_id: z.string().uuid()
  }),
  'getQualitativeEnvironmentFromRowState'
);

export const getQuantitativeEnvironmentFromRowState = createRowStateGetter(
  z.object({
    environment_quantitative_id: z.string().uuid(),
    value: z.number()
  }),
  'getQuantitativeEnvironmentFromRowState'
);

// Observation
export const getSamplePeriodIdFromRowState = createRowStateGetter(
  z.object({
    sample_period_id: z.number().optional()
  }),
  'getSamplePeriodIdFromRowState'
);
