/**
 * A quantitative unit.
 *
 * Note: should be kept in sync with the `quantitative_unit` enum in the database.
 */
export type QuantitativeUnit =
  | 'millimeter'
  | 'centimeter'
  | 'meter'
  | 'milligram'
  | 'gram'
  | 'kilogram'
  | 'percent'
  | 'celsius'
  | 'ppt'
  | 'SCF'
  | 'degrees'
  | 'pH'
  | 'seconds'
  | 'meters squared'
  | 'count'
  | 'GHz'
  | 'Hz'
  | 'amps'
  | 'volts'
  | 'megapixels';
