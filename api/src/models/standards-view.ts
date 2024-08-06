import { z } from 'zod';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from '../services/critterbase-service';

export interface ISpeciesStandards {
  tsn: number;
  scientificName: string;
  measurements: {
    quantitative: CBQuantitativeMeasurementTypeDefinition[];
    qualitative: CBQualitativeMeasurementTypeDefinition[];
  };
  markingBodyLocations: { id: string; key: string; value: string }[];
}

export const EnvironmentStandardsSchema = z.object({
  qualitative: z.array(
    z.object({
      name: z.string(),
      description: z.string().nullable(),
      options: z.array(
        z.object({
          name: z.string(),
          description: z.string().nullable()
        })
      )
    })
  ),
  quantitative: z.array(
    z.object({
      name: z.string(),
      description: z.string().nullable(),
      unit: z.string().nullable()
    })
  )
});

export type EnvironmentStandards = z.infer<typeof EnvironmentStandardsSchema>;

export const MethodStandardSchema = z.object({
  method_lookup_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  attributes: z.object({
    qualitative: z.array(
      z.object({
        name: z.string(),
        description: z.string().nullable(),
        options: z.array(
          z.object({
            name: z.string(),
            description: z.string().nullable()
          })
        )
      })
    ),
    quantitative: z.array(
      z.object({
        name: z.string(),
        description: z.string().nullable(),
        unit: z.string().nullable()
      })
    )
  })
});

export type MethodStandard = z.infer<typeof MethodStandardSchema>;
