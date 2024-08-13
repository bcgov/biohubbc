import { z } from 'zod';

export const CsvQualitativeMeasurementSchema = z.object({
  critter_id: z.string().uuid(),
  capture_id: z.string().uuid(),
  taxon_measurement_id: z.string().uuid(),
  qualitative_measurement_id: z.string().uuid()
});

export const CsvQuantitativeMeasurementSchema = z.object({
  critter_id: z.string().uuid(),
  capture_id: z.string().uuid(),
  taxon_measurement_id: z.string().uuid(),
  value: z.number()
});

export const CsvMeasurementSchema = CsvQualitativeMeasurementSchema.or(CsvQuantitativeMeasurementSchema);

export type CsvMeasurement = z.infer<typeof CsvMeasurementSchema>;
