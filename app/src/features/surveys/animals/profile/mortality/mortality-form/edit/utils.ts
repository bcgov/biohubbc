import {
  isQualitativeMeasurementCreate,
  isQualitativeMeasurementUpdate,
  isQuantitativeMeasurementCreate,
  isQuantitativeMeasurementUpdate
} from 'features/surveys/animals/profile/measurements/utils';
import { Feature } from 'geojson';
import {
  ICritterDetailedResponse,
  IMarkingPostData,
  IQualitativeMeasurementCreate,
  IQualitativeMeasurementUpdate,
  IQuantitativeMeasurementCreate,
  IQuantitativeMeasurementUpdate
} from 'interfaces/useCritterApi.interface';

/**
 * Formats a location object into the required structure.
 *
 * @param {(Feature | null)} [location] The location object to be formatted.
 * @return {*}  The formatted location object.
 */
export const formatLocation = (location: Feature | null) => {
  if (location?.geometry.type === 'Point') {
    return {
      longitude: location.geometry.coordinates[0],
      latitude: location.geometry.coordinates[1],
      coordinate_uncertainty: 0,
      coordinate_uncertainty_units: 'm'
    };
  }

  return undefined;
};

/**
 * Formats critter details for bulk update, including markings and measurements.
 *
 * @param {ICritterDetailedResponse} critter The critter object containing existing details.
 * @param {IMarkingPostData[]} markings Array of markings for the critter.
 * @param {((IQuantitativeMeasurementUpdate | IQualitativeMeasurementUpdate)[])} measurements Array of measurements for the critter.
 * @param {string} mortalityId The mortality id
 * @return {*}  Formatted critter details for bulk update.
 */
export const formatCritterDetailsForBulkUpdate = (
  critter: ICritterDetailedResponse,
  markings: IMarkingPostData[],
  measurements: (
    | IQuantitativeMeasurementCreate
    | IQualitativeMeasurementCreate
    | IQuantitativeMeasurementUpdate
    | IQualitativeMeasurementUpdate
  )[],
  mortalityId: string
) => {
  // Find qualitative measurements to delete
  const qualitativeMeasurementsForDelete =
    critter.measurements.qualitative
      // Filter out measurements that are not on the current mortality
      .filter(
        (existingQualitativeMeasurementsOnCritter) =>
          existingQualitativeMeasurementsOnCritter.mortality_id === mortalityId
      )
      // Filter out measurements that are not in the incoming measurements
      .filter(
        (existingQualitativeMeasurementsOnMortality) =>
          !measurements.some(
            (incomingMeasurements) =>
              isQualitativeMeasurementUpdate(incomingMeasurements) &&
              incomingMeasurements.measurement_qualitative_id ===
                existingQualitativeMeasurementsOnMortality.measurement_qualitative_id
          )
      )
      // The remaining measurements are the ones to delete from the critter for the current mortality
      .map((item) => ({ ...item, _delete: true })) ?? [];

  // Find quantitative measurements to delete
  const quantitativeMeasurementsForDelete =
    critter.measurements.quantitative
      // Filter out measurements that are not on the current mortality
      .filter(
        (existingQUantitativeMeasurementsOnCritter) =>
          existingQUantitativeMeasurementsOnCritter.mortality_id === mortalityId
      )
      // Filter out measurements that are not in the incoming measurements
      .filter(
        (existingQuantitativeMeasurementsOnMortality) =>
          !measurements.some(
            (incomingMeasurements) =>
              isQuantitativeMeasurementUpdate(incomingMeasurements) &&
              incomingMeasurements.measurement_quantitative_id ===
                existingQuantitativeMeasurementsOnMortality.measurement_quantitative_id
          )
      )
      // The remaining measurements are the ones to delete from the critter for the current mortality
      .map((item) => ({ ...item, _delete: true })) ?? [];

  // Find markings to delete
  const markingsForDelete = critter.markings
    // Filter out markings that are not on the current mortality
    .filter((existingMarkingsOnCritter) => existingMarkingsOnCritter.mortality_id === mortalityId)
    // Filter out markings that are not in the incoming markings
    .filter(
      (existingmarkingsOnMortality) =>
        !markings.some((incomingMarking) => incomingMarking.marking_id === existingmarkingsOnMortality.marking_id)
    )
    // The remaining markings are the ones to delete from the critter for the current mortality
    .map((item) => ({ ...item, critter_id: critter.critterbase_critter_id, _delete: true }));

  // Find markings for create
  const markingsForCreate = markings
    // Filter out markings that have a marking_id (i.e. they are existing markings that need to be updated, not created)
    .filter((marking) => !marking.marking_id)
    .map((marking) => ({
      ...marking,
      marking_id: marking.marking_id,
      critter_id: critter.critterbase_critter_id,
      mortality_id: mortalityId
    }));

  // Find markings for update
  const markingsForUpdate = markings
    // Filter out markings that do not have a marking_id (i.e. they are new markings that need to be created, not updated)
    .filter((marking) => marking.marking_id)
    .map((marking) => ({
      ...marking,
      marking_id: marking.marking_id,
      critter_id: critter.critterbase_critter_id,
      mortality_id: mortalityId
    }));

  // Find qualitative measurements for create
  const qualitativeMeasurementsForCreate = measurements.filter(isQualitativeMeasurementCreate).map((measurement) => ({
    critter_id: critter.critterbase_critter_id,
    mortality_id: mortalityId,
    taxon_measurement_id: measurement.taxon_measurement_id,
    qualitative_option_id: measurement.qualitative_option_id,
    measured_timestamp: measurement.measured_timestamp,
    measurement_comment: measurement.measurement_comment
  }));

  // Find quantitative measurements for create
  const quantitativeMeasurementsForCreate = measurements.filter(isQuantitativeMeasurementCreate).map((measurement) => ({
    critter_id: critter.critterbase_critter_id,
    mortality_id: mortalityId,
    taxon_measurement_id: measurement.taxon_measurement_id,
    value: measurement.value,
    measured_timestamp: measurement.measured_timestamp,
    measurement_comment: measurement.measurement_comment
  }));

  // Find qualitative measurements for update
  const qualitativeMeasurementsForUpdate = measurements.filter(isQualitativeMeasurementUpdate).map((measurement) => ({
    critter_id: critter.critterbase_critter_id,
    mortality_id: mortalityId,
    measurement_qualitative_id: measurement.measurement_qualitative_id,
    taxon_measurement_id: measurement.taxon_measurement_id,
    qualitative_option_id: measurement.qualitative_option_id,
    measured_timestamp: measurement.measured_timestamp,
    measurement_comment: measurement.measurement_comment
  }));

  // Find quantitative measurements for update
  const quantitativeMeasurementsForUpdate = measurements.filter(isQuantitativeMeasurementUpdate).map((measurement) => ({
    critter_id: critter.critterbase_critter_id,
    mortality_id: mortalityId,
    measurement_quantitative_id: measurement.measurement_quantitative_id,
    taxon_measurement_id: measurement.taxon_measurement_id,
    value: measurement.value,
    measured_timestamp: measurement.measured_timestamp,
    measurement_comment: measurement.measurement_comment
  }));

  return {
    qualitativeMeasurementsForDelete,
    quantitativeMeasurementsForDelete,
    markingsForDelete,
    markingsForCreate,
    markingsForUpdate,
    qualitativeMeasurementsForCreate,
    quantitativeMeasurementsForCreate,
    qualitativeMeasurementsForUpdate,
    quantitativeMeasurementsForUpdate
  };
};
