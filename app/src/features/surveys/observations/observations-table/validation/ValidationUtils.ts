import { GridColDef } from '@mui/x-data-grid';
import { IObservationTableRow, ObservationRowValidationError, TSNMeasurement } from 'contexts/observationsTableContext';
import dayjs from 'dayjs';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQualitativeOption,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';

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

  const measurements = await getTSNMeasurements(Number(row.itis_tsn));
  if (!measurements) {
    return [
      {
        field: 'itis_tsn',
        message: 'No valid measurements were found for this taxon. Please contact an administrator.'
      }
    ];
  }

  // go through each measurement on the table and validate against he taxon
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

      if (!foundQualitative && !foundQuantitative) {
        measurementErrors.push({
          field: measurementColumn,
          message: `Invalid measurement set for taxon.`
        });
      }
    }
  });

  if (measurementErrors.length > 0) {
    return measurementErrors;
  } else {
    return [];
  }
};

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

export const findMissingSamplingColumns = (row: IObservationTableRow, tableColumns: GridColDef[]) => {
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

export const findMissingColumns = (
  row: IObservationTableRow,
  requiredColumns: (keyof IObservationTableRow)[],
  tableColumns: GridColDef[]
) => {
  const errors: ObservationRowValidationError[] = [];
  requiredColumns.forEach((column) => {
    if (!row[column]) {
      // uh oh, missing required column
      const header = tableColumns.find((tc) => tc.field === column)?.headerName;
      errors.push({ field: column, message: `Missing column: ${header}` });
    }
  });

  return errors;
};

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
