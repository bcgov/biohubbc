import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';
import {
  SubcountQualitativeMeasurement,
  SubcountQuantitativeMeasurement
} from 'interfaces/useObservationApi.interface';

/**
 * Type guard to check if a given item is a `SubcountQuantitativeMeasurement`.
 *
 * @export
 * @param {*} item
 * @return {*}  {item is SubcountQuantitativeMeasurement}
 */
export function isSubcountQuantitativeMeasurement(item: any): item is SubcountQuantitativeMeasurement {
  if (!item) {
    return false;
  }

  return 'measurement_value' in item && 'measurement_id' in item;
}

/**
 * Type guard to check if a given item is a `SubcountQualitativeMeasurement`.
 *
 * @export
 * @param {*} item
 * @return {*}  {item is SubcountQualitativeMeasurement}
 */
export function isSubcountQualitativeMeasurement(item: any): item is SubcountQualitativeMeasurement {
  if (!item) {
    return false;
  }

  return 'measurement_option_id' in item && 'measurement_id' in item;
}

/**
 * Type guard to check if a given item is a `CBQualitativeMeasurementTypeDefinition`.
 *
 * @export
 * @param {(CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition)} item
 * @return {*}  {item is CBQualitativeMeasurementTypeDefinition}
 */
export function isCBQualitativeMeasurementTypeDefinition(
  item: CBQualitativeMeasurementTypeDefinition | CBQuantitativeMeasurementTypeDefinition
): item is CBQualitativeMeasurementTypeDefinition {
  return 'options' in item && 'taxon_measurement_id' in item;
}
