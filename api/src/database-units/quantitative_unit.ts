import { z } from 'zod';

/**
 * Quantitative Unit Data Type.
 *
 * @description Enum for `quantitative_unit` database type.
 */
export enum QuantitativeUnit {
  MILLIMETER = 'millimeter',
  CENTIMETER = 'centimeter',
  METER = 'meter',
  MILLIGRAM = 'milligram',
  GRAM = 'gram',
  KILOGRAM = 'kilogram',
  PERCENT = 'percent',
  CELSIUS = 'celsius',
  PPT = 'ppt',
  SCF = 'SCF',
  DEGREES = 'degrees',
  PH = 'pH',
  SECONDS = 'seconds',
  METERS_SQUARED = 'meters squared',
  COUNT = 'count',
  GHZ = 'GHz',
  HZ = 'Hz',
  AMPS = 'amps',
  VOLTS = 'volts',
  MEGAPIXELS = 'megapixels'
}

/**
 * Quantitative Unit Data Type.
 *
 * @description Type for `quantitative_unit` database type.
 */
export const QuantitativeUnitType = z.nativeEnum(QuantitativeUnit);

export type QuantitativeUnitType = z.infer<typeof QuantitativeUnitType>;
