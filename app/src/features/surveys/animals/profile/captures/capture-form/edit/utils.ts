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
 * @param {Feature} location The location object to be formatted.
 * @return {*}  The formatted location object.
 */
export const formatLocation = (location: Feature) => {
  if (location.geometry.type === 'Point')
    return {
      longitude: location.geometry.coordinates[0],
      latitude: location.geometry.coordinates[1],
      coordinate_uncertainty: 0,
      coordinate_uncertainty_units: 'm'
    };
};

/**
 * Formats critter details for bulk update, including markings and measurements.
 *
 * @param {ICritterDetailedResponse} critter The critter object containing existing details.
 * @param {IMarkingPostData[]} markings Array of markings for the critter.
 * @param {((IQuantitativeMeasurementUpdate | IQualitativeMeasurementUpdate)[])} measurements Array of measurements for the critter.
 * @param {string} captureId The capture object containing capture details.
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
  captureId: string
) => {
  // Find qualitative measurements to delete
  const qualitativeMeasurementsForDelete =
    critter.measurements.qualitative
      // Filter out measurements that are not on the current capture
      .filter(
        (existingQualitativeMeasurementsOnCritter) => existingQualitativeMeasurementsOnCritter.capture_id === captureId
      )
      // Filter out measurements that are not in the incoming measurements
      .filter(
        (existingQualitativeMeasurementsOnCapture) =>
          !measurements.some(
            (incomingMeasurements) =>
              isQualitativeMeasurementUpdate(incomingMeasurements) &&
              incomingMeasurements.measurement_qualitative_id ===
                existingQualitativeMeasurementsOnCapture.measurement_qualitative_id
          )
      )
      // The remaining measurements are the ones to delete from the critter for the current capture
      .map((item) => ({ ...item, _delete: true })) ?? [];

  // Find quantitative measurements to delete
  const quantitativeMeasurementsForDelete =
    critter.measurements.quantitative
      // Filter out measurements that are not on the current capture
      .filter(
        (existingQUantitativeMeasurementsOnCritter) =>
          existingQUantitativeMeasurementsOnCritter.capture_id === captureId
      )
      // Filter out measurements that are not in the incoming measurements
      .filter(
        (existingQuantitativeMeasurementsOnCapture) =>
          !measurements.some(
            (incomingMeasurements) =>
              isQuantitativeMeasurementUpdate(incomingMeasurements) &&
              incomingMeasurements.measurement_quantitative_id ===
                existingQuantitativeMeasurementsOnCapture.measurement_quantitative_id
          )
      )
      // The remaining measurements are the ones to delete from the critter for the current capture
      .map((item) => ({ ...item, _delete: true })) ?? [];

  // Find markings to delete
  const markingsForDelete = critter.markings
    // Filter out markings that are not on the current capture
    .filter((existingMarkingsOnCritter) => existingMarkingsOnCritter.capture_id === captureId)
    // Filter out markings that are not in the incoming markings
    .filter(
      (existingmarkingsOnCapture) =>
        !markings.some((incomingMarking) => incomingMarking.marking_id === existingmarkingsOnCapture.marking_id)
    )
    // The remaining markings are the ones to delete from the critter for the current capture
    .map((item) => ({ ...item, critter_id: critter.critterbase_critter_id, _delete: true }));

  // Find markings for create
  const markingsForCreate = markings
    // Filter out markings that have a marking_id (i.e. they are existing markings that need to be updated, not created)
    .filter((marking) => !marking.marking_id)
    .map((marking) => ({
      ...marking,
      marking_id: marking.marking_id,
      critter_id: critter.critterbase_critter_id,
      capture_id: captureId
    }));

  // Find markings for update
  const markingsForUpdate = markings
    // Filter out markings that do not have a marking_id (i.e. they are new markings that need to be created, not updated)
    .filter((marking) => marking.marking_id)
    .map((marking) => ({
      ...marking,
      marking_id: marking.marking_id,
      critter_id: critter.critterbase_critter_id,
      capture_id: captureId
    }));

  // Find qualitative measurements for create
  const qualitativeMeasurementsForCreate = measurements
    .filter(isQualitativeMeasurementCreate)
    .map((measurement: IQualitativeMeasurementCreate) => ({
      critter_id: critter.critterbase_critter_id,
      capture_id: captureId,
      taxon_measurement_id: measurement.taxon_measurement_id,
      qualitative_option_id: measurement.qualitative_option_id,
      measured_timestamp: measurement.measured_timestamp,
      measurement_comment: measurement.measurement_comment
    }));

  // Find quantitative measurements for create
  const quantitativeMeasurementsForCreate = measurements
    .filter(isQuantitativeMeasurementCreate)
    .map((measurement: IQuantitativeMeasurementCreate) => ({
      critter_id: critter.critterbase_critter_id,
      capture_id: captureId,
      taxon_measurement_id: measurement.taxon_measurement_id,
      value: measurement.value,
      measured_timestamp: measurement.measured_timestamp,
      measurement_comment: measurement.measurement_comment
    }));

  // Find qualitative measurements for update
  const qualitativeMeasurementsForUpdate = measurements
    .filter(isQualitativeMeasurementUpdate)
    .map((measurement: IQualitativeMeasurementUpdate) => ({
      //   critter_id: critter.critterbase_critter_id,
      capture_id: captureId,
      measurement_qualitative_id: measurement.measurement_qualitative_id,
      taxon_measurement_id: measurement.taxon_measurement_id,
      qualitative_option_id: measurement.qualitative_option_id,
      measured_timestamp: measurement.measured_timestamp,
      measurement_comment: measurement.measurement_comment
    }));

  // Find quantitative measurements for update
  const quantitativeMeasurementsForUpdate = measurements
    .filter(isQuantitativeMeasurementUpdate)
    .map((measurement: IQuantitativeMeasurementUpdate) => ({
      critter_id: critter.critterbase_critter_id,
      measurement_quantitative_id: measurement.measurement_quantitative_id,
      capture_id: captureId,
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
