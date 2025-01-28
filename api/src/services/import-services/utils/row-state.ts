import { z } from 'zod';
import { ApiGeneralError } from '../../../errors/api-error';
import { CSVRow, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';

/**
 * Create a row state getter
 *
 * @param {z.ZodSchema} schema - The Zod schema to validate the value
 * @returns {*} {function} - The row state getter
 */
export const createRowStateGetter = <SchemaType extends z.ZodSchema>(schema: SchemaType) => {
  return (rowOrState: CSVRow | CSVRow[typeof CSVRowState]): z.infer<SchemaType> => {
    const isCSVRow = Object.getOwnPropertySymbols(rowOrState).includes(CSVRowState);

    const parsedState = schema.safeParse(isCSVRow ? rowOrState?.[CSVRowState] : rowOrState);

    // Throw an error if unable to correctly parse the row state
    if (!parsedState.success) {
      throw new ApiGeneralError('Invalid CSV row state', [
        {
          state: rowOrState,
          errors: parsedState.error
        }
      ]);
    }

    return parsedState.data;
  };
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
    itis_tsn: z.number(),
    itis_scientific_name: z.string()
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
export const getSamplingPeriodFromRowState = createRowStateGetter(
  z.object({
    sampling_period_id: z.number()
  })
);
