import { z } from 'zod';

export const QualitativeMeasurementAnalyticsSchema = z.object({
  option: z.object({
    option_id: z.string(),
    option_label: z.string()
  }),
  taxon_measurement_id: z.string(),
  measurement_name: z.string()
});

export type QualitativeMeasurementAnalytics = z.infer<typeof QualitativeMeasurementAnalyticsSchema>;

export const QuantitativeMeasurementAnalyticsSchema = z.object({
  value: z.number(),
  taxon_measurement_id: z.string(),
  measurement_name: z.string()
});

export type QuantitativeMeasurementAnalytics = z.infer<typeof QuantitativeMeasurementAnalyticsSchema>;

export const ObservationCountByGroupSchema = z.object({
  row_count: z.number(),
  individual_count: z.number(),
  individual_percentage: z.number()
});

export type ObservationCountByGroup = z.infer<typeof ObservationCountByGroupSchema>;

export const ObservationCountByGroupWithNamedMeasurementsSchema = ObservationCountByGroupSchema.extend({
  qualitative_measurements: z.array(QualitativeMeasurementAnalyticsSchema),
  quantitative_measurements: z.array(QuantitativeMeasurementAnalyticsSchema)
});

export type ObservationCountByGroupWithNamedMeasurements = z.infer<
  typeof ObservationCountByGroupWithNamedMeasurementsSchema
>;

export const ObservationCountByGroupWithMeasurementsSchema = ObservationCountByGroupSchema.extend({
  quant_measurements: z.array(
    z.object({
      value: z.number().nullable(),
      critterbase_taxon_measurement_id: z.string()
    })
  ),
  qual_measurements: z.array(
    z.object({
      option_id: z.string().nullable(),
      critterbase_taxon_measurement_id: z.string()
    })
  )
});

export type ObservationCountByGroupWithMeasurements = z.infer<typeof ObservationCountByGroupWithMeasurementsSchema>;
