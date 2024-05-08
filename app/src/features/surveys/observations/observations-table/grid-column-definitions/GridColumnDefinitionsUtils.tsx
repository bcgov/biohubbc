import { GridCellParams, GridColDef } from '@mui/x-data-grid';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import {
  ObservationQualitativeEnvironmentColDef,
  ObservationQualitativeMeasurementColDef,
  ObservationQuantitativeEnvironmentColDef,
  ObservationQuantitativeMeasurementColDef
} from 'features/surveys/observations/observations-table/grid-column-definitions/GridColumnDefinitions';
import {
  CBMeasurementType,
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';
import {
  EnvironmentQualitativeTypeDefinition,
  EnvironmentQuantitativeTypeDefinition,
  EnvironmentType
} from 'interfaces/useReferenceApi.interface';

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
 * Asserts the environment is a quantitative environment type definition.
 *
 * @param {(EnvironmentQualitativeTypeDefinition | EnvironmentQuantitativeTypeDefinition)} environment
 * @return {*}  {environment is EnvironmentQuantitativeTypeDefinition}
 */
export const isQuantitativeEnvironmentTypeDefinition = (
  environment: EnvironmentQualitativeTypeDefinition | EnvironmentQuantitativeTypeDefinition
): environment is EnvironmentQuantitativeTypeDefinition => {
  return (environment as EnvironmentQuantitativeTypeDefinition).environment_quantitative_id !== undefined;
};

/**
 * Asserts the environment is a qualitative environment type definition.
 *
 * @param {(EnvironmentQualitativeTypeDefinition | EnvironmentQuantitativeTypeDefinition)} environment
 * @return {*}  {environment is EnvironmentQualitativeTypeDefinition}
 */
export const isQualitativeEnvironmentTypeDefinition = (
  environment: EnvironmentQualitativeTypeDefinition | EnvironmentQuantitativeTypeDefinition
): environment is EnvironmentQualitativeTypeDefinition => {
  return (environment as EnvironmentQualitativeTypeDefinition).environment_qualitative_id !== undefined;
};

export const getMeasurementColumnDefinitions = (
  measurements: CBMeasurementType[],
  hasError: (params: GridCellParams) => boolean
): GridColDef<IObservationTableRow>[] => {
  const colDefs: GridColDef<IObservationTableRow>[] = [];
  for (const measurement of measurements) {
    if (isQuantitativeMeasurementTypeDefinition(measurement)) {
      colDefs.push(
        ObservationQuantitativeMeasurementColDef({
          measurement: measurement,
          hasError: hasError
        })
      );
    }

    if (isQualitativeMeasurementTypeDefinition(measurement)) {
      colDefs.push(
        ObservationQualitativeMeasurementColDef({
          measurement: measurement,
          measurementOptions: measurement.options,
          hasError: hasError
        })
      );
    }
  }
  return colDefs;
};

export const getEnvironmentColumnDefinitions = (
  environments: EnvironmentType,
  hasError: (params: GridCellParams) => boolean
): GridColDef<IObservationTableRow>[] => {
  const colDefs: GridColDef<IObservationTableRow>[] = [];
  for (const environment of environments.quantitative_environments) {
    colDefs.push(
      ObservationQuantitativeEnvironmentColDef({
        environment: environment,
        hasError: hasError
      })
    );
  }

  for (const environment of environments.qualitative_environments) {
    colDefs.push(
      ObservationQualitativeEnvironmentColDef({
        environment: environment,
        hasError: hasError
      })
    );
  }

  return colDefs;
};
