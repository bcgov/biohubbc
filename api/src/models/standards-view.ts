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

// Define Zod schema
export const EnvironmentStandardsSchema = z.object({
  qualitative: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      options: z.array(
        z.object({
          name: z.string(),
          description: z.string()
        })
      )
    })
  ),
  quantitative: z.array(
    z.object({
      name: z.string(),
      description: z.string()
    })
  )
});

// Infer the TypeScript type from the Zod schema
export type EnvironmentStandards = z.infer<typeof EnvironmentStandardsSchema>;

// THIS AINT WORKING OR BEING IMPORTED CORRECTLY IN STANDARSD SERVICE

// export interface MethodStandards {
//   name: string;
//   description: string;

// }

export const MethodStandardSchema = z.object({
  method_lookup_id: z.number(),
  name: z.string(),
  description: z.string(),
  attributes: z.object({
    qualitative: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        options: z.array(
          z.object({
            name: z.string(),
            description: z.string()
          })
        )
      })
    ),
    quantitative: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        units: z.string()
      })
    )
  })
});

export type MethodStandard = z.infer<typeof MethodStandardSchema>;
