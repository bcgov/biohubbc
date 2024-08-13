import { z } from 'zod';
import { IAsSelectLookup } from '../../critterbase-service';

/**
 * Get CSV Marking schema.
 *
 * Note: This getter allows custom values to be injected for validation.
 *
 * Note: This could be updated to transform the string values into the primary keys
 * to prevent Critterbase from having to translate / patch in incomming bulk values.
 *
 * @param {IAsSelectLookup[]} colours - Array of supported Critterbase colours
 * @returns {*} Custom Zod schema for CSV Markings
 */
export const getCsvMarkingSchema = (
  colours: IAsSelectLookup[],
  markingTypes: IAsSelectLookup[],
  critterBodyLocationsMap: Map<string, IAsSelectLookup[]>
) => {
  const colourNames = colours.map((colour) => colour.value.toLowerCase());
  const markingTypeNames = markingTypes.map((markingType) => markingType.value.toLowerCase());

  const coloursSet = new Set(colourNames);
  const markingTypesSet = new Set(markingTypeNames);

  return z
    .object({
      critter_id: z.string({ required_error: 'Unable to find matching survey critter with alias' }).uuid(),
      capture_id: z.string({ required_error: 'Unable to find matching capture with date and time' }).uuid(),
      body_location: z.string(),
      marking_type: z
        .string()
        .refine(
          (val) => markingTypesSet.has(val.toLowerCase()),
          `Marking type not supported. Allowed values: ${markingTypeNames.join(', ')}`
        )
        .optional(),
      identifier: z.string().optional(),
      primary_colour: z
        .string()
        .refine(
          (val) => coloursSet.has(val.toLowerCase()),
          `Colour not supported. Allowed values: ${colourNames.join(', ')}`
        )
        .optional(),
      secondary_colour: z
        .string()
        .refine(
          (val) => coloursSet.has(val.toLowerCase()),
          `Colour not supported. Allowed values: ${colourNames.join(', ')}`
        )
        .optional(),
      comment: z.string().optional()
    })
    .superRefine((schema, ctx) => {
      const bodyLocations = critterBodyLocationsMap.get(schema.critter_id);
      if (!bodyLocations) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'No taxon body locations found for Critter'
        });
      } else if (
        !bodyLocations.filter((location) => location.value.toLowerCase() === schema.body_location.toLowerCase()).length
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid body location for Critter. Allowed values: ${bodyLocations
            .map((bodyLocation) => bodyLocation.value)
            .join(', ')}`
        });
      }
    });
};

/**
 * A validated CSV Marking object
 *
 */
export type CsvMarking = z.infer<ReturnType<typeof getCsvMarkingSchema>>;
