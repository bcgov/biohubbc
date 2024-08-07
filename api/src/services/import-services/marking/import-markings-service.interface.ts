import { z } from 'zod';
import { IAsSelectLookup } from '../../critterbase-service';

/**
 * Get CSV Marking schema.
 *
 * Note: This getter allows custom values to be injected for validation.
 *
 * @param {IAsSelectLookup[]} colours - Array of supported Critterbase colours
 * @returns {*} Custom Zod schema for CSV Markings
 */
export const getCsvMarkingSchema = (colours: IAsSelectLookup[], markingTypes: IAsSelectLookup[]) => {
  const colourNames = colours.map((colour) => colour.value.toLowerCase());
  const markingTypeNames = markingTypes.map((markingType) => markingType.value.toLowerCase());

  const coloursSet = new Set(colourNames);
  const markingTypesSet = new Set(markingTypeNames);

  return z.object({
    critter_id: z.string({ required_error: 'Unable to find matching survey critter with alias' }).uuid(),
    capture_id: z.string({ required_error: 'Unable to find matching capture with date and time' }).uuid(),
    body_location: z.string(),
    marking_type: z
      .string()
      .refine(
        (val) => markingTypesSet.has(val.toLowerCase()),
        `Marking type not supported. Allowed: ${markingTypeNames.join(', ')}`
      )
      .optional(),
    identifier: z.string().optional(),
    primary_colour: z
      .string()
      .refine((val) => coloursSet.has(val.toLowerCase()), `Colour not supported. Allowed: ${colourNames.join(', ')}`)
      .optional(),
    secondary_colour: z
      .string()
      .refine((val) => coloursSet.has(val.toLowerCase()), `Colour not supported. Allowed: ${colourNames.join(', ')}`)
      .optional(),
    comment: z.string().optional()
  });
};

/**
 * A validated CSV Marking object
 *
 */
export type CsvMarking = z.infer<ReturnType<typeof getCsvMarkingSchema>>;
