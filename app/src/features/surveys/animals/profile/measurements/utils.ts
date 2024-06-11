import {
  IQualitativeMeasurementCreate,
  IQualitativeMeasurementUpdate,
  IQuantitativeMeasurementCreate,
  IQuantitativeMeasurementUpdate
} from 'interfaces/useCritterApi.interface';

// Type guard for qualitative measurements
export function isQualitativeMeasurementCreate(measurement: any): measurement is IQualitativeMeasurementCreate {
  return 'qualitative_option_id' in measurement && !measurement.value && !measurement.measurement_qualitative_id;
}

// Type guard for quantitative measurements
export function isQuantitativeMeasurementCreate(measurement: any): measurement is IQuantitativeMeasurementCreate {
  return 'value' in measurement && !measurement.qualitative_option_id && !measurement.measurement_quantitative_id;
}

// Type guard for qualitative measurements
export function isQualitativeMeasurementUpdate(measurement: any): measurement is IQualitativeMeasurementUpdate {
  return 'measurement_qualitative_id' in measurement && measurement.measurement_qualitative_id;
}

// Type guard for quantitative measurements
export function isQuantitativeMeasurementUpdate(measurement: any): measurement is IQuantitativeMeasurementUpdate {
  return 'measurement_quantitative_id' in measurement && measurement.measurement_quantitative_id;
}
