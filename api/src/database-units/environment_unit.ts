import { z } from 'zod';

/**
 * Environment Unit Data Type.
 *
 * @description Data type for `environment_unit`.
 */
export const EnvironmentUnit = z.enum([
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
  'pH'
]);

export type EnvironmentUnit = z.infer<typeof EnvironmentUnit>;
