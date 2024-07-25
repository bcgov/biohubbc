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
