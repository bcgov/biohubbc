import { z } from 'zod';
import { ApiGeneralError } from '../../../errors/api-error';
import { CSVRow, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';

/**
 * Create a row state getter
 *
 * @param {string} key - The key to get from the row state
 * @param {z.ZodSchema} schema - The Zod schema to validate the value
 * @returns {*} {function} - The row state getter
 */
export const createRowStateGetter = <SchemaType extends z.ZodSchema>(key: string, schema: SchemaType) => {
  return (row: CSVRow, state?: Record<string, unknown>): z.infer<SchemaType> => {
    const value = state ? state[key] : row[CSVRowState]?.[key];

    const parsedValue = schema.safeParse(value);

    // Throw an error if unable to correctly parse the row state
    if (!parsedValue.success) {
      throw new ApiGeneralError('Invalid CSV row state', [
        {
          key: key,
          value: value,
          errors: parsedValue.error,
          rowState: row[CSVRowState]
        }
      ]);
    }

    return parsedValue;
  };
};

// Taxon
export const getTaxonTsnFromState = createRowStateGetter('itis_tsn', z.number());
export const getTaxonScientificNameFromState = createRowStateGetter('itis_scientific_name', z.string());

// Critter and Capture
export const getCritterIdFromState = createRowStateGetter('critter_id', z.string().uuid());
export const getCaptureIdFromState = createRowStateGetter('capture_id', z.string().uuid());

// Measurement
export const getTaxonMeasurementIdFromState = createRowStateGetter('taxon_measurement_id', z.string().uuid());
export const getQualitativeOptionIdFromState = createRowStateGetter('qualitative_option_id', z.string().uuid());
export const getQuantitativeValueFromState = createRowStateGetter('value', z.number());

// Environment
export const getEnvironmentQualitativeIdFromState = createRowStateGetter(
  'environment_qualitative_id',
  z.string().uuid()
);
export const getEnvironmentQualitativeOptionIdFromState = createRowStateGetter(
  'environment_qualitative_option_id',
  z.string().uuid()
);
