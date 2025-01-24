import { z } from 'zod';
import { ApiGeneralError } from '../../../errors/api-error';
import { CSVRow, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';

export const newRowStateGetter = <SchemaType extends z.ZodSchema>(key: string, schema: SchemaType) => {
  return (row: CSVRow, state?: Record<string, unknown>): z.infer<SchemaType> => {
    const value = state ? state[key] : row[CSVRowState]?.[key];

    const parsedValue = schema.safeParse(value);

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
export const getTaxonTsnFromState = newRowStateGetter('itis_tsn', z.number());
export const getTaxonScientificNameFromState = newRowStateGetter('itis_scientific_name', z.string());

// Critter and Capture
export const getCritterIdFromState = newRowStateGetter('critter_id', z.string().uuid());
export const getCaptureIdFromState = newRowStateGetter('capture_id', z.string().uuid());

// Measurement
export const getTaxonMeasurementIdFromState = newRowStateGetter('taxon_measurement_id', z.string().uuid());
export const getQualitativeOptionIdFromState = newRowStateGetter('qualitative_option_id', z.string().uuid());
export const getMeasurementValueFromState = newRowStateGetter('value', z.number());
