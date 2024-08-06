import { z } from 'zod';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from '../services/critterbase-service';

const QualitativeMeasurementSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  options: z.array(
    z.object({
      name: z.string(),
      description: z.string().nullable()
    })
  )
});

const QuantitativeMeasurementSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  unit: z.string().nullable()
});

const MethodAttributesSchema = z.object({
  qualitative: z.array(QualitativeMeasurementSchema),
  quantitative: z.array(QuantitativeMeasurementSchema)
});

export const EnvironmentStandardsSchema = z.object({
  qualitative: z.array(QualitativeMeasurementSchema),
  quantitative: z.array(QuantitativeMeasurementSchema)
});

export type EnvironmentStandards = z.infer<typeof EnvironmentStandardsSchema>;

export const MethodStandardSchema = z.object({
  method_lookup_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  attributes: MethodAttributesSchema
});

export type MethodStandard = z.infer<typeof MethodStandardSchema>;

export interface ISpeciesStandards {
  tsn: number;
  scientificName: string;
  measurements: {
    quantitative: CBQuantitativeMeasurementTypeDefinition[];
    qualitative: CBQualitativeMeasurementTypeDefinition[];
  };
  markingBodyLocations: { id: string; key: string; value: string }[];
}
