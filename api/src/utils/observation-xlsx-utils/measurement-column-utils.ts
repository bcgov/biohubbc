import xlsx from 'xlsx';
import { ApiGeneralError } from '../../errors/api-error';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from '../../services/critterbase-service';
import { getLogger } from '../logger';
import { DEFAULT_XLSX_SHEET_NAME } from '../media/xlsx/xlsx-file';
import { getWorksheetRowObjects } from '../xlsx-utils/worksheet-utils';

const defaultLog = getLogger('src/utils/observation-xlsx-utils/measurement-column-utils');

export type TsnMeasurementMap = Record<
  string,
  { qualitative: CBQualitativeMeasurementTypeDefinition[]; quantitative: CBQuantitativeMeasurementTypeDefinition[] }
>;

export interface IMeasurementDataToValidate {
  tsn: string;
  measurement_key: string; // Column name, Grid table field or measurement_taxon_id to validate
  measurement_value: string | number;
}

/**
 * Fetch all measurements from critter base for TSN numbers found in provided worksheet
 *
 * @param {WorkSheet} xlsxWorksheets The worksheet to pull the columns from
 * @param {CritterbaseService} critterBaseService
 * @param {string} sheet The sheet to work on
 * @returns {*} Promise<TsnMeasurementMap>
 */
export async function getCBMeasurementTypeDefinitionsFromWorksheet(
  xlsxWorksheets: xlsx.WorkSheet,
  critterBaseService: CritterbaseService,
  sheet = DEFAULT_XLSX_SHEET_NAME
): Promise<TsnMeasurementMap> {
  const rows = getWorksheetRowObjects(xlsxWorksheets[sheet]);
  const tsns = rows.map((row) => String(row['ITIS_TSN'] ?? row['TSN'] ?? row['TAXON'] ?? row['SPECIES']));
  return getCBMeasurementsFromTSN(tsns, critterBaseService);
}

/**
 * Fetches measurement definitions from critterbase for a given list of TSNs and creates and returns a map with all data fetched
 * Throws if a TSN does not return measurements.
 *
 * @param {string[]} tsns List of TSNs
 * @param {CritterbaseService} critterBaseService Critterbase service
 * @returns {*} Promise<TsnMeasurementMap>
 */
export async function getCBMeasurementsFromTSN(
  tsns: string[],
  critterBaseService: CritterbaseService
): Promise<TsnMeasurementMap> {
  const tsnMeasurements: TsnMeasurementMap = {};
  try {
    for (const tsn of tsns) {
      if (!tsnMeasurements[tsn]) {
        const measurements = await critterBaseService.getTaxonMeasurements(tsn);
        if (!measurements) {
          throw new Error(`No measurements found for tsn: ${tsn}`);
        }

        tsnMeasurements[tsn] = measurements;
      }
    }
  } catch (error) {
    getLogger('utils/xlsx-utils').error({
      label: 'getCBMeasurementTypeDefinitionsFromWorksheet',
      message: 'error',
      error
    });
    throw new ApiGeneralError(`Error connecting to the Critterbase API: ${error}`);
  }
  return tsnMeasurements;
}

/**
 * Search for a measurement given xlsx column name and tsn id
 *
 * @param {string} tsn
 * @param {string} measurementColumnName
 * @param {TsnMeasurementMap} tsnMeasurements
 * @returns {*} CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition | null | undefined
 */
export function findMeasurementFromTsnMeasurements(
  tsn: string,
  measurementColumnName: string,
  tsnMeasurements: TsnMeasurementMap
): CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition | null | undefined {
  const measurements = tsnMeasurements[tsn];

  if (!measurements) {
    // No measurements for tsn
    return null;
  }

  if (measurements.qualitative.length > 0) {
    const qualitativeMeasurement = measurements.qualitative.find(
      (measurement) => measurement.measurement_name.toLowerCase() === measurementColumnName.toLowerCase()
    );

    if (qualitativeMeasurement) {
      // Found qualitative measurement by column/ measurement name
      return qualitativeMeasurement;
    }
  }

  if (measurements.quantitative.length > 0) {
    const quantitativeMeasurement = measurements.quantitative.find(
      (measurement) => measurement.measurement_name.toLowerCase() === measurementColumnName.toLowerCase()
    );

    if (quantitativeMeasurement) {
      // Found quantitative measurement by column/ measurement name
      return quantitativeMeasurement;
    }
  }

  // No measurements found for tsn
  return null;
}

/**
 * Type guard to check if a given item is a `CBQualitativeMeasurementTypeDefinition`.
 *
 * Qualitative measurements have an `options` property, while quantitative measurements do not.
 *
 * @export
 * @param {(CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition)} item
 * @return {*}  {item is CBQualitativeMeasurementTypeDefinition}
 */
export function isMeasurementCBQualitativeTypeDefinition(
  item: CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition
): item is CBQualitativeMeasurementTypeDefinition {
  return 'options' in item;
}

/**
 * Given an array of column headers, returns an array of column headers that have a corresponding measurement type
 * definition in the provided TsnMeasurementMap.
 *
 * @export
 * @param {string[]} columns
 * @param {TsnMeasurementMap} tsnMeasurements
 * @return {*}  {string[]}
 */
export function getMeasurementColumnNames(columns: string[], tsnMeasurements: TsnMeasurementMap): string[] {
  const allQualitativeMeasurementTypeDefinitions = Object.values(tsnMeasurements).flatMap((tsn) => tsn.qualitative);
  const allQuantitativeMeasurementTypeDefinitions = Object.values(tsnMeasurements).flatMap((tsn) => tsn.quantitative);

  // Filter out columns that have no corresponding measurement type definition
  return columns.filter((column) => {
    const columnLowerCase = column.toLowerCase();

    return (
      allQualitativeMeasurementTypeDefinitions.some(
        (measurement) => measurement.measurement_name.toLowerCase() === columnLowerCase
      ) ||
      allQuantitativeMeasurementTypeDefinitions.some(
        (measurement) => measurement.measurement_name.toLowerCase() === columnLowerCase
      )
    );
  });
}

/**
 * Checks if all passed in measurement data is valid or returns false at first invalid measurement.
 *
 * @param {IMeasurementDataToValidate[]} data The measurement data to validate
 * @param {TsnMeasurementMap} tsnMeasurementMap An object map of measurement definitions from Critterbase organized by TSN numbers
 * @returns {*} boolean Results of validation
 */
export function validateMeasurements(
  data: IMeasurementDataToValidate[],
  tsnMeasurementMap: TsnMeasurementMap
): boolean {
  return data.every((item) => {
    const measurements = tsnMeasurementMap[item.tsn];
    if (!measurements) {
      defaultLog.debug({ label: 'validateMeasurements', message: 'Invalid: No measurements' });
      return false;
    }

    // only validate if the column has data
    if (!item.measurement_value) {
      return true;
    }

    // find the correct measurement
    if (measurements.qualitative.length > 0) {
      const measurement = measurements.qualitative.find(
        (measurement) =>
          measurement.measurement_name.toLowerCase() === item.measurement_key.toLowerCase() ||
          measurement.taxon_measurement_id === item.measurement_key
      );
      if (measurement) {
        return isQualitativeValueValid(item.measurement_value, measurement);
      }
    }

    if (measurements.quantitative.length > 0) {
      const measurement = measurements.quantitative.find(
        (measurement) =>
          measurement.measurement_name.toLowerCase() === item.measurement_key.toLowerCase() ||
          measurement.taxon_measurement_id === item.measurement_key
      );
      if (measurement) {
        return isQuantitativeValueValid(Number(item.measurement_value), measurement);
      }
    }

    // Has measurements for tsn
    // Has data but no matches found, entry is invalid
    defaultLog.debug({ label: 'validateMeasurements', message: 'Invalid', item });
    return false;
  });
}

/**
 * Validates the
 *
 * @param {Record<string, any>[]} rows
 * @param {string[]} measurementColumns
 * @param {TsnMeasurementMap} tsnMeasurementMap
 * @returns {*} boolean
 */
export function validateCsvMeasurementColumns(
  rows: Record<string, any>[],
  measurementColumns: string[],
  tsnMeasurementMap: TsnMeasurementMap
): boolean {
  const mappedData: IMeasurementDataToValidate[] = rows.flatMap((row) => {
    return measurementColumns.map((mColumn) => ({
      tsn: String(row['ITIS_TSN'] ?? row['TSN'] ?? row['TAXON'] ?? row['SPECIES']),
      measurement_key: mColumn,
      measurement_value: row[mColumn]
    }));
  });
  return validateMeasurements(mappedData, tsnMeasurementMap);
}

/**
 * This function take a value and a measurement to validate against. `CBQuantitativeMeasurementTypeDefinition` can contain
 * a range of valid values, so the incoming value is compared against the min max values in the type definition.
 *
 * @param {number} value The measurement value to validate
 * @param {CBQuantitativeMeasurementTypeDefinition} measurement The type definition of the measurement from Critterbase
 * @returns {*} Boolean
 */
export function isQuantitativeValueValid(value: number, measurement: CBQuantitativeMeasurementTypeDefinition): boolean {
  const min_value = measurement.min_value;
  const max_value = measurement.max_value;

  if (min_value && max_value) {
    if (min_value <= value && value <= max_value) {
      return true;
    }
  } else {
    if (min_value !== null && min_value <= value) {
      return true;
    }

    if (max_value !== null && value <= max_value) {
      return true;
    }

    if (min_value === null && max_value === null) {
      return true;
    }
  }

  defaultLog.debug({ label: 'isQuantitativeValueValid', message: 'Invalid', value, measurement });
  return false;
}

/**
 *  This function validates the value provided against a Qualitative Measurement.
 * As a string, the function will compare the value against known option labels and will return true if any are found.
 * As a number, the function will compare the value against the option values (the position or index of the option) and will return true if any are found.
 *
 * @param {string | number} value the value to validate
 * @param {CBQualitativeMeasurementTypeDefinition} measurement The type definition of the measurement from Critterbase
 * @returns {*} Boolean
 */
export function isQualitativeValueValid(
  value: string | number,
  measurement: CBQualitativeMeasurementTypeDefinition
): boolean {
  // Check for option value, label OR option uuid
  const foundOption = measurement.options.find(
    (option) =>
      option.option_value === Number(value) ||
      option.option_label.toLowerCase() === String(value).toLowerCase() ||
      option.qualitative_option_id.toLowerCase() === String(value)
  );

  if (foundOption) {
    return true;
  }

  defaultLog.debug({ label: 'isQualitativeValueValid', message: 'Invalid', value, measurement });
  return false;
}
