import { z } from 'zod';
import { ApiGeneralError } from '../../../errors/api-error';
import { CSVRow, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';

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
 * updateCSVRowState(row, { critter_id: '123' });
 * // rowState = { critter_id: '123' };
 *
 * updateCSVRowState(row, { capture_id: '456' });
 * // rowState = { critter_id: '123', capture_id: '456' };
 *
 * updateCSVRowState(row, { critter_id: '789' });
 * // rowState = { critter_id: ['123', '789'], capture_id: '456' };
 *
 * updateCSVRowState(row, { critter_id: undefined });
 * // rowState = { capture_id: '456' };
 *
 * updateCSVRowState(row, { capture_id: undefined });
 * // rowState = {};
 *
 * @returns {*} {void}
 */
export const updateCSVRowState = (row: CSVRow, state: Record<string, any>) => {
  if (!row[CSVRowState]) {
    // Initialize the row state if it does not exist
    row[CSVRowState] = {};
  }

  for (const key in state) {
    const newValue = state[key];
    const existingValue = row[CSVRowState][key];

    if (existingValue === undefined) {
      row[CSVRowState][key] = newValue;
    } else {
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
export const createRowStateGetter = <SchemaType extends z.ZodSchema>(schema: SchemaType) => {
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
  })
);

// Taxon
export const getTaxonFromRowState = createRowStateGetter(
  z.object({
    taxon: z.object({
      itis_tsn: z.number(),
      itis_scientific_name: z.string()
    })
  })
);

// Taxon array
export const getTaxonArrayFromRowState = createRowStateGetter(
  z.object({
    taxon: z.union([
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
  })
);

// Measurement
export const getQualitativeMeasurementFromRowState = createRowStateGetter(
  z.object({
    taxon_measurement_id: z.string().uuid(),
    qualitative_option_id: z.string().uuid()
  })
);

export const getQuantitativeMeasurementFromRowState = createRowStateGetter(
  z.object({
    taxon_measurement_id: z.string().uuid(),
    value: z.number()
  })
);

// Environment
export const getQualitativeEnvironmentFromRowState = createRowStateGetter(
  z.object({
    environment_qualitative_id: z.string().uuid(),
    environment_qualitative_option_id: z.string().uuid()
  })
);

export const getQuantitativeEnvironmentFromRowState = createRowStateGetter(
  z.object({
    environment_quantitative_id: z.string().uuid(),
    value: z.number()
  })
);

// Observation
export const getSamplePeriodIdFromRowState = createRowStateGetter(
  z.object({
    sample_period_id: z.number().optional()
  })
);
