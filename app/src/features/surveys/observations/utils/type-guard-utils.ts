import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';
import {
  SubcountQualitativeMeasurement,
  SubcountQuantitativeMeasurement
} from 'interfaces/useObservationApi.interface';
import {
  EnvironmentQualitativeTypeDefinition,
  EnvironmentQuantitativeTypeDefinition
} from 'interfaces/useReferenceApi.interface';

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

/**
 * Type guard to check if a given item is a `CBQuantitativeMeasurementTypeDefinition`.
 *
 * @export
 * @param {(CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition)} item
 * @return {*}  {item is CBQuantitativeMeasurementTypeDefinition}
 */
export function isCBQuantitativeMeasurementTypeDefinition(
  item: CBQualitativeMeasurementTypeDefinition | CBQuantitativeMeasurementTypeDefinition
): item is CBQuantitativeMeasurementTypeDefinition {
  return 'unit' in item && 'taxon_measurement_id' in item;
}

/**
 * Type guard to check if a given item is a `EnvironmentQualitativeTypeDefinition`.
 *
 * @export
 * @param {(CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition)} item
 * @return {*}  {item is EnvironmentQualitativeTypeDefinition}
 */
export function isEnvironmentQualitativeTypeDefinition(
  item: EnvironmentQualitativeTypeDefinition | EnvironmentQuantitativeTypeDefinition
): item is EnvironmentQualitativeTypeDefinition {
  return 'options' in item && 'environment_qualitative_id' in item;
}

/**
 * Type guard to check if a given item is a `EnvironmentQuantitativeTypeDefinition`.
 *
 * @export
 * @param {(CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition)} item
 * @return {*}  {item is EnvironmentQuantitativeTypeDefinition}
 */
export function isEnvironmentQuantitativeTypeDefinition(
  item: EnvironmentQualitativeTypeDefinition | EnvironmentQuantitativeTypeDefinition
): item is EnvironmentQuantitativeTypeDefinition {
  return 'unit' in item && 'environment_quantitative_id' in item;
}
