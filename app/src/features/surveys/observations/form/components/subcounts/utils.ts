import { SubcountFormData } from 'features/surveys/observations/form/components/subcounts/subcount/SubcountForm.interface';
import {
  ObservationSubcountObject,
  SubcountQualitativeMeasurement,
  SubcountQuantitativeMeasurement
} from 'interfaces/useObservationApi.interface';

/**
 * The the initial quantitative measurement form data for a single subcount quantitative measurement record.
 *
 * @param {ObservationSubcountObject} subcountRecord
 * @param {string[]} uniqueQuantitativeMeasurementIds
 * @return {*}  {SubcountQuantitativeMeasurement[]}
 */
const getSubcountQuantitativeMeasurementValueFormData = (
  subcountRecord: ObservationSubcountObject,
  uniqueQuantitativeMeasurementIds: string[]
): SubcountQuantitativeMeasurement[] => {
  const subcountQuantitativeMeasurementsFormData: SubcountQuantitativeMeasurement[] = [];

  for (const measurementId of uniqueQuantitativeMeasurementIds) {
    const subcountMeasurementValue =
      subcountRecord.quantitative_measurements.find((item) => item.critterbase_taxon_measurement_id === measurementId)
        ?.value ?? null;

    subcountQuantitativeMeasurementsFormData.push({
      measurement_id: measurementId,
      measurement_value: subcountMeasurementValue
    });
  }

  return subcountQuantitativeMeasurementsFormData;
};

/**
 * Get the initial qualitative measurement form data for a single subcount qualitative measurement record.
 *
 * @param {ObservationSubcountObject} subcountRecord
 * @param {string[]} uniqueQualitativeMeasurementIds
 * @return {*}  {SubcountQualitativeMeasurement[]}
 */
const getSubcountQualitativeMeasurementValueFormData = (
  subcountRecord: ObservationSubcountObject,
  uniqueQualitativeMeasurementIds: string[]
): SubcountQualitativeMeasurement[] => {
  const subcountQualitativeMeasurementsFormData: SubcountQualitativeMeasurement[] = [];

  for (const measurementId of uniqueQualitativeMeasurementIds) {
    const subcountMeasurementOptionId =
      subcountRecord.qualitative_measurements.find((item) => item.critterbase_taxon_measurement_id === measurementId)
        ?.critterbase_measurement_qualitative_option_id ?? null;

    subcountQualitativeMeasurementsFormData.push({
      measurement_id: measurementId,
      measurement_option_id: subcountMeasurementOptionId
    });
  }

  return subcountQualitativeMeasurementsFormData;
};

/**
 * Get the initial form data for a single subcount record.
 *
 * @param {ObservationSubcountObject} subcountRecord
 * @param {{
 *     uniqueQuantitativeMeasurementIds: string[];
 *     uniqueQualitativeMeasurementIds: string[];
 *   }} uniqueMeasurementIds
 * @return {*}  {SubcountFormData}
 */
const getSubcountFormData = (
  subcountRecord: ObservationSubcountObject,
  uniqueMeasurementIds: {
    uniqueQuantitativeMeasurementIds: string[];
    uniqueQualitativeMeasurementIds: string[];
  }
): SubcountFormData => {
  const subcountMeasurements: (SubcountQualitativeMeasurement | SubcountQuantitativeMeasurement)[] = [
    ...getSubcountQuantitativeMeasurementValueFormData(
      subcountRecord,
      uniqueMeasurementIds.uniqueQuantitativeMeasurementIds
    ),
    ...getSubcountQualitativeMeasurementValueFormData(
      subcountRecord,
      uniqueMeasurementIds.uniqueQualitativeMeasurementIds
    )
  ];

  return {
    _id: String(subcountRecord.observation_subcount_id),
    observation_subcount_id: subcountRecord.observation_subcount_id,
    subcount: subcountRecord.subcount,
    comment: subcountRecord.comment,
    measurements: subcountMeasurements,
    markings: []
  };
};

/**
 * Given an array of subcount records, which each contain an array of qualitative and quantitative measurements,
 * get the unique set of measurement ids across all subcount records.
 *
 * @param {ObservationSubcountObject[]} subcountRecords
 * @return {*}  {{
 *   uniqueQualitativeMeasurementIds: string[];
 *   uniqueQuantitativeMeasurementIds: string[];
 * }}
 */
const getUniqueMeasurementIds = (
  subcountRecords: ObservationSubcountObject[]
): {
  uniqueQualitativeMeasurementIds: string[];
  uniqueQuantitativeMeasurementIds: string[];
} => {
  const uniqueQualitativeMeasurementIds = new Set<string>();
  const uniqueQuantitativeMeasurementIds = new Set<string>();

  for (const subcountRecord of subcountRecords) {
    for (const qualitativeMeasurement of subcountRecord.qualitative_measurements) {
      uniqueQualitativeMeasurementIds.add(qualitativeMeasurement.critterbase_taxon_measurement_id);
    }

    for (const quantitativeMeasurement of subcountRecord.quantitative_measurements) {
      uniqueQuantitativeMeasurementIds.add(quantitativeMeasurement.critterbase_taxon_measurement_id);
    }
  }

  return {
    uniqueQualitativeMeasurementIds: Array.from(uniqueQualitativeMeasurementIds),
    uniqueQuantitativeMeasurementIds: Array.from(uniqueQuantitativeMeasurementIds)
  };
};

/**
 * Get the initial form data for an array of subcount records.
 *
 * @param {ObservationSubcountObject[]} subcountRecords
 * @return {*}  {SubcountFormData[]}
 */
export const getSubcountsFormData = (subcountRecords: ObservationSubcountObject[]): SubcountFormData[] => {
  const uniqueMeasurementIds = getUniqueMeasurementIds(subcountRecords);

  return subcountRecords.map((subcountRecord) => getSubcountFormData(subcountRecord, uniqueMeasurementIds));
};
