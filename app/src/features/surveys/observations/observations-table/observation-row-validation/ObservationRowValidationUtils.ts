import { GridColDef } from '@mui/x-data-grid';
import { IObservationTableRow, ObservationRowValidationError, TSNMeasurement } from 'contexts/observationsTableContext';
import dayjs from 'dayjs';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQualitativeOption,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';

/**
 * Validates a given observation table row against the given measurement columns.
 *
 * @param {IObservationTableRow} row The observation table row to validate
 * @param {string[]} measurementColumns A list of the measurement columns to validate
 * @param {(tsn: number) => Promise<TSNMeasurement | null | undefined>} getTSNMeasurements A function that fetches measurement definitions from Critterbase based on the row itis_tsn value
 * @returns {*} Promise<ObservationRowValidationError[]>
 */
export const validateObservationTableRowMeasurements = async (
  row: IObservationTableRow,
  measurementColumns: string[],
  getTSNMeasurements: (tsn: number) => Promise<TSNMeasurement | null | undefined>
): Promise<ObservationRowValidationError[]> => {
  const measurementErrors: ObservationRowValidationError[] = [];
  // no taxon or measurements, nothing to validate
  if (!row.itis_tsn || !measurementColumns.length) {
    return [];
  }

  // Fetch measurement definitions for the provided itis_tsn
  const measurements = await getTSNMeasurements(Number(row.itis_tsn));
  if (!measurements) {
    return [
      {
        field: 'itis_tsn',
        message: 'No valid measurements were found for this taxon. Please contact an administrator.'
      }
    ];
  }

  // go through each measurement on the table and validate against the measurement definition from Critterbase
  measurementColumns.forEach((measurementColumn) => {
    const data = row[measurementColumn];
    if (data) {
      const foundQualitative = measurements.qualitative.find(
        (q: CBQualitativeMeasurementTypeDefinition) => q.taxon_measurement_id === measurementColumn
      );
      if (foundQualitative) {
        const error = _validateQualitativeMeasurement(measurementColumn, String(data), foundQualitative.options);
        if (error) {
          measurementErrors.push(error);
        }
      }

      const foundQuantitative = measurements.quantitative.find(
        (q: CBQuantitativeMeasurementTypeDefinition) => q.taxon_measurement_id === measurementColumn
      );
      if (foundQuantitative) {
        const error = _validateQuantitativeMeasurement(
          measurementColumn,
          Number(data),
          foundQuantitative.min_value,
          foundQuantitative.max_value
        );

        if (error) {
          measurementErrors.push(error);
        }
      }

      // A measurement column has data but no measurements were found for the itis_tsn
      if (!foundQualitative && !foundQuantitative) {
        measurementErrors.push({
          field: measurementColumn,
          message: `Invalid measurement set for taxon.`
        });
      }
    }
  });

  return measurementErrors;
};

/**
 * This validates if the provided option UUID exists within the given list of CBQualitativeOption.
 * Returns null if the option is valid or an ObservationRowValidationError if it is not found
 *
 * @param {string} field The column key for the data being validated
 * @param {string} value The options UUID to look for
 * @param {CBQualitativeOption[]} options
 * @returns {*} ObservationRowValidationError | null
 */
const _validateQualitativeMeasurement = (
  field: string,
  value: string,
  options: CBQualitativeOption[]
): ObservationRowValidationError | null => {
  const foundOption = options.find((op) => op.qualitative_option_id === value);

  if (!foundOption) {
    // found measurement, no option, no bueno
    return {
      field,
      message: 'Invalid option selected for taxon.'
    };
  }
  return null;
};

/**
 *  Validates if a given value is in between min and max values from a Quantitative Measurement definition in Critterbase.
 *  Returns null if the value is valid or a ObservationRowValidationError describing that the value is out of the valid range.
 *
 * @param {string} field The column key for the data being validated
 * @param {number} value The number to validate
 * @param {number | null} minValue The min value provided by the measurement definition from Critterbase
 * @param {number | null} maxValue The max value provided by the measurement definition from Critterbase
 * @returns {*} ObservationRowValidationError | null
 */
const _validateQuantitativeMeasurement = (
  field: string,
  value: number,
  minValue: number | null,
  maxValue: number | null
): ObservationRowValidationError | null => {
  if (minValue && maxValue) {
    if (minValue <= value && value <= maxValue) {
      return null;
    }
  } else {
    if (minValue !== null && minValue <= value) {
      return null;
    }

    if (maxValue !== null && value <= maxValue) {
      return null;
    }

    if (minValue === null && maxValue === null) {
      return null;
    }
  }

  // Measurement values are invalid, create an error and return
  return {
    field,
    message: `Value provided is outside of the valid range ${minValue} < ${value} < ${maxValue}`
  };
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
