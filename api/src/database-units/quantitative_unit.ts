import { z } from 'zod';

/**
 * Quantitative Unit Data Type.
 *
 * @description Data type for `quantitative_unit`.
 */
export const QuantitativeUnit = z.enum([
  'millimeter',
  'centimeter',
  'meter',
  'milligram',
  'gram',
  'kilogram',
  'percent',
  'celsius',
  'ppt',
  'SCF',
  'degrees',
  'pH',
  'seconds',
  'meters squared',
  'count',
  'GHz',
  'Hz',
  'amps',
  'volts',
  'megapixels'
]);

export type QuantitativeUnit = z.infer<typeof QuantitativeUnit>;
