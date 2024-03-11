import { GridCellParams } from '@mui/x-data-grid';
import { MeasurementColumn } from 'contexts/observationsTableContext';
import {
  ObservationQualitativeMeasurementColDef,
  ObservationQuantitativeMeasurementColDef
} from 'features/surveys/observations/observations-table/grid-column-definitions/GridColumnDefinitions';
import {
  CBMeasurementType,
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';

/**
 * Asserts the measurement is a quantitative measurement type definition.
 *
 * @param {CBMeasurementType} measurement
 * @return {*}  {measurement is CBQuantitativeMeasurementTypeDefinition}
 */
export const isQuantitativeMeasurementTypeDefinition = (
  measurement: CBMeasurementType
): measurement is CBQuantitativeMeasurementTypeDefinition => {
  return (
    (measurement as CBQuantitativeMeasurementTypeDefinition).max_value !== undefined ||
    (measurement as CBQuantitativeMeasurementTypeDefinition).min_value !== undefined
  );
};

/**
 * Asserts the measurement is a qualitative measurement type definition.
 *
 * @param {CBMeasurementType} measurement
 * @return {*}  {measurement is CBQualitativeMeasurementTypeDefinition}
 */
export const isQualitativeMeasurementTypeDefinition = (
  measurement: CBMeasurementType
): measurement is CBQualitativeMeasurementTypeDefinition => {
  return (measurement as CBQualitativeMeasurementTypeDefinition).options !== undefined;
};

/**
 * Given a quantitative measurement type definition, returns a measurement column.
 *
 * @param {CBQuantitativeMeasurementTypeDefinition} measurement
 * @param {(params: GridCellParams) => boolean} hasError
 * @return {*}
 */
export const getQuantitativeMeasurementColumn = (
  measurement: CBQuantitativeMeasurementTypeDefinition,
  hasError: (params: GridCellParams) => boolean
) => {
  return {
    measurement: measurement,
    colDef: ObservationQuantitativeMeasurementColDef({
      measurement: measurement,
      hasError: hasError
    })
  };
};

/**
 * Given a qualitative measurement type definition, returns a measurement column.
 *
 * @param {CBQualitativeMeasurementTypeDefinition} measurement
 * @param {(params: GridCellParams) => boolean} hasError
 * @return {*}
 */
export const getQualitativeMeasurementColumn = (
  measurement: CBQualitativeMeasurementTypeDefinition,
  hasError: (params: GridCellParams) => boolean
) => {
  return {
    measurement: measurement,
    colDef: ObservationQualitativeMeasurementColDef({
      measurement: measurement,
      measurementOptions: measurement.options,
      hasError: hasError
    })
  };
};

/**
 * Given an array of measurement type definitions, returns an array of measurement columns.
 *
 * @param {CBMeasurementType[]} measurements
 * @param {(params: GridCellParams) => boolean} hasError
 * @return {*}
 */
export const getMeasurementColumns = (
  measurements: CBMeasurementType[],
  hasError: (params: GridCellParams) => boolean
) => {
  const measurementColumns: MeasurementColumn[] = [];

  for (const measurement of measurements) {
    if (isQuantitativeMeasurementTypeDefinition(measurement)) {
      measurementColumns.push(getQuantitativeMeasurementColumn(measurement, hasError));
    }

    if (isQualitativeMeasurementTypeDefinition(measurement)) {
      measurementColumns.push(getQualitativeMeasurementColumn(measurement, hasError));
    }
  }

  return measurementColumns;
};
