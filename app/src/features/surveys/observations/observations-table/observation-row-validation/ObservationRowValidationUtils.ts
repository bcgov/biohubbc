import { GridColDef } from '@mui/x-data-grid';
import { IObservationTableRow, ObservationRowValidationError, TSNMeasurement } from 'contexts/observationsTableContext';
import dayjs from 'dayjs';
import {
  CBMeasurementType,
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';
import { EnvironmentType } from 'interfaces/useReferenceApi.interface';

/**
 * Validates a given observation table row against the given measurement columns.
 *
 * @param {IObservationTableRow} row The observation table row to validate
 * @param {CBMeasurementType[]} measurementColumns A list of the measurement column definitions to validate against
 * @param {(tsn: number) => Promise<TSNMeasurement | null | undefined>} getTSNMeasurements A function that fetches measurement definitions from Critterbase based on the row itis_tsn value
 * @returns {*} Promise<ObservationRowValidationError[]>
 */
export const validateObservationTableRowMeasurements = async (
  row: IObservationTableRow,
  measurementColumns: CBMeasurementType[],
  getTSNMeasurements: (tsn: number) => Promise<TSNMeasurement | null | undefined>
): Promise<ObservationRowValidationError[]> => {
  const measurementErrors: ObservationRowValidationError[] = [];

  if (!row.itis_tsn) {
    // The row has no taxon, therefore we cannot validate the measurements, which are dependent on the taxon
    return [];
  }

  if (!measurementColumns.length) {
    // The row has no measurements, nothing to validate
    return [];
  }

  const taxonMeasurements = await getTSNMeasurements(Number(row.itis_tsn));

  if (!taxonMeasurements) {
    // This taxon has no valid measurements, return an error
    return [
      {
        field: 'itis_tsn',
        message: 'No valid measurements were found for this taxon. Please contact an administrator.'
      }
    ];
  }

  // For each measurement column in the table, validate its value against the measurement definition from Critterbase
  measurementColumns.forEach((measurementColumn) => {
    const cellValue = row[measurementColumn.taxon_measurement_id];

    if (!cellValue) {
      // The cell is empty, no need to validate, continue to the next measurement
      return;
    }

    // Check if the measurement applies to this taxon, and if so, validate the value
    if (
      taxonMeasurements.qualitative.find(
        (qualitative) => qualitative.taxon_measurement_id === measurementColumn.taxon_measurement_id
      )
    ) {
      // This measurement applies to this taxon, validate that the value is one of the valid options for this measurement
      const error = _validateQualitativeCell(
        (measurementColumn as CBQualitativeMeasurementTypeDefinition).taxon_measurement_id,
        (measurementColumn as CBQualitativeMeasurementTypeDefinition).options.map(
          (option) => option.qualitative_option_id
        ),
        String(cellValue)
      );

      if (error) {
        // The value is not a valid option for this measurement, return an error
        measurementErrors.push(error);
      }

      // The value is valid, continue to the next measurement
      return;
    } else if (
      taxonMeasurements.quantitative.find(
        (quantitative) => quantitative.taxon_measurement_id === measurementColumn.taxon_measurement_id
      )
    ) {
      // This measurement applies to this taxon, validate that the value is within the valid range for this measurement
      const error = _validateQuantitativeCell(
        (measurementColumn as CBQuantitativeMeasurementTypeDefinition).taxon_measurement_id,
        (measurementColumn as CBQuantitativeMeasurementTypeDefinition).min_value,
        (measurementColumn as CBQuantitativeMeasurementTypeDefinition).max_value,
        Number(cellValue)
      );

      if (error) {
        // The value is outside of the valid range for this measurement, return an error
        measurementErrors.push(error);
      }

      // The value is valid, continue to the next measurement
      return;
    }

    // The cell value is not empty, but the measurement does not apply to this taxon, return an error
    measurementErrors.push({
      field: measurementColumn.taxon_measurement_id,
      message: `Invalid measurement set for taxon.`
    });
  });

  return measurementErrors;
};

/**
 * Validates a given observation table row against the given measurement columns.
 *
 * @param {IObservationTableRow} row The observation table row to validate
 * @param {EnvironmentType} environmentColumns A list of the environment column definitions to validate against
 * @return {*}  {Promise<ObservationRowValidationError[]>}
 */
export const validateObservationTableRowEnvironments = async (
  row: IObservationTableRow,
  environmentColumns: EnvironmentType
): Promise<ObservationRowValidationError[]> => {
  const environmentErrors: ObservationRowValidationError[] = [];

  if (!environmentColumns.qualitative_environments.length && !environmentColumns.quantitative_environments.length) {
    // The row has no environments, nothing to validate
    return [];
  }

  // For each environment column in the table, validate its value against the environment definition
  environmentColumns.qualitative_environments.forEach((environmentColumn) => {
    const cellValue = row[environmentColumn.environment_qualitative_id];

    if (!cellValue) {
      // The cell is empty, no need to validate, continue to the next environment
      return;
    }

    const error = _validateQualitativeCell(
      String(environmentColumn.environment_qualitative_id),
      environmentColumn.options.map((option) => String(option.environment_qualitative_option_id)),
      String(cellValue)
    );

    if (error) {
      // The value is not a valid option for this environment, return an error
      environmentErrors.push(error);
    }
  });

  // For each environment column in the table, validate its value against the environment definition
  environmentColumns.quantitative_environments.forEach((environmentColumn) => {
    const cellValue = row[environmentColumn.environment_quantitative_id];

    if (!cellValue) {
      // The cell is empty, no need to validate, continue to the next environment
      return;
    }

    const error = _validateQuantitativeCell(
      String(environmentColumn.environment_quantitative_id),
      environmentColumn.min,
      environmentColumn.max,
      Number(cellValue)
    );

    if (error) {
      // The value is outside of the valid range for this environment, return an error
      environmentErrors.push(error);
    }
  });

  return environmentErrors;
};

/**
 * Validates any qualitative cell value against the provided options.
 * If the value does not match any of the valid options, an error is returned.
 *
 * @param {string} field the id of the column
 * @param {string[]} optionIds the valid option ids for the column
 * @param {string} cellValue the value of the cell to validate (expected to match one of the option ids)
 * @return {*}  {(ObservationRowValidationError | null)}
 */
const _validateQualitativeCell = (
  field: string,
  optionIds: string[],
  cellValue: string
): ObservationRowValidationError | null => {
  const matchingOption = optionIds.includes(cellValue);

  if (!matchingOption) {
    // The cellValue does not match any of the valid options for this measurement
    return {
      field,
      message: 'Invalid option selected.'
    };
  }

  // The cellValue is valid
  return null;
};

/**
 * Validates any quantitative cell value against the provided min and max values.
 * If the value is outside of the valid range, an error is returned.
 *
 * @param {string} field the id of the column
 * @param {(number | null)} minValue the minimum value for the column
 * @param {(number | null)} maxValue the maximum value for the column
 * @param {number} cellValue the value of the cell to validate (expected to be within the min and max values, if set)
 * @return {*}  {(ObservationRowValidationError | null)}
 */
const _validateQuantitativeCell = (
  field: string,
  minValue: number | null,
  maxValue: number | null,
  cellValue: number
): ObservationRowValidationError | null => {
  if (minValue !== null && maxValue !== null && (cellValue < minValue || cellValue > maxValue)) {
    // Both min and max values are set and the cell value is outside of the valid range
    return {
      field,
      message: `Value provided is outside of the valid range [${minValue}, ${maxValue}]`
    };
  }

  if (minValue !== null && cellValue < minValue) {
    // Only the min value is set and the cell value is less than the min value
    return {
      field,
      message: `Value provided is less than the minimum value ${minValue}`
    };
  }

  if (maxValue !== null && cellValue > maxValue) {
    // Only the max value is set and the cell value is greater than the max value
    return {
      field,
      message: `Value provided is greater than the maximum value ${maxValue}`
    };
  }

  // The cell value is within the valid range or no range is set
  return null;
};

/**
 * This function will validate sample site data is input correctly.
 * If the Sampling Site is set, both method and period become required.
 * If no Sampling Site is set, then no sampling columns are required and the data is valid.
 *
 * @param {IObservationTableRow} row The observation table row to validate
 * @param {GridColDef[]} tableColumns Grid column definitions array. Used to find the column field
 * @returns {*} ObservationRowValidationError | null
 */
export const findMissingSamplingColumns = (
  row: IObservationTableRow,
  tableColumns: GridColDef[]
): ObservationRowValidationError[] => {
  const errors: ObservationRowValidationError[] = [];
  // if this row has survey_sample_site_id we need to validate that the other 2 sampling columns are also present
  if (row['survey_sample_site_id']) {
    if (!row['survey_sample_method_id']) {
      const header = tableColumns.find((tc) => tc.field === 'survey_sample_method_id')?.headerName;
      errors.push({ field: 'survey_sample_method_id', message: `Missing column: ${header}` });
    }

    if (!row['survey_sample_period_id']) {
      const header = tableColumns.find((tc) => tc.field === 'survey_sample_period_id')?.headerName;
      errors.push({ field: 'survey_sample_period_id', message: `Missing column: ${header}` });
    }
  }

  return errors;
};

/**
 * This function will scan through the provided row and check if any of the required columns are missing (no data set).
 * Any missing columns create a ObservationRowValidationError describing the missing column and returns that array.
 *
 * @param {IObservationTableRow} row The observation table row to validate
 * @param {(keyof IObservationTableRow)[]} requiredColumns An array of required columns to look for
 * @param {GridColDef[]} tableColumns Grid column definitions array. Used to find the column field
 * @returns {*} ObservationRowValidationError[]
 */
export const findMissingColumns = (
  row: IObservationTableRow,
  requiredColumns: (keyof IObservationTableRow)[],
  tableColumns: GridColDef[]
): ObservationRowValidationError[] => {
  const errors: ObservationRowValidationError[] = [];
  requiredColumns.forEach((column) => {
    if (!row[column]) {
      const header = tableColumns.find((tc) => tc.field === column)?.headerName;
      errors.push({ field: column, message: `Missing column: ${header}` });
    }
  });

  return errors;
};

/**
 * This function validates the given row for required columns, sampling columns and the date and time columns.
 * An array of errors is returned containing any validation errors.
 *
 * @param {IObservationTableRow} row The observation row to validate
 * @param {(keyof IObservationTableRow)[]} requiredColumns
 * @param {GridColDef[]} tableColumns Grid column definitions for the table
 * @returns {*} ObservationRowValidationError[]
 */
export const validateObservationTableRow = (
  row: IObservationTableRow,
  requiredColumns: (keyof IObservationTableRow)[],
  tableColumns: GridColDef[]
): ObservationRowValidationError[] => {
  let errors: ObservationRowValidationError[] = [];
  const requiredColumnErrors = findMissingColumns(row, requiredColumns, tableColumns);
  const samplingColumnErrors = findMissingSamplingColumns(row, tableColumns);
  // spread missing column information into single array
  errors = [...requiredColumnErrors, ...samplingColumnErrors];

  // Validate date value
  if (row.observation_date && !dayjs(row.observation_date).isValid()) {
    errors.push({ field: 'observation_date', message: 'Invalid date' });
  }

  // Validate time value
  if (row.observation_time === 'Invalid date') {
    errors.push({ field: 'observation_time', message: 'Invalid time' });
  }

  return errors;
};
