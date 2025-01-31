import { FormikKeyUuid } from 'interfaces/misc/formik.interface';

export type ObservationSubcountRecord = {
  observation_subcount_id: number;
  survey_observation_id: number;
  comment: string;
  subcount: number | null;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
};

export type ObservationSubcountObject = {
  observation_subcount_id: ObservationSubcountRecord['observation_subcount_id'];
  comment: ObservationSubcountRecord['comment'];
  subcount: ObservationSubcountRecord['subcount'];
  qualitative_measurements: ObservationSubcountQualitativeMeasurementObject[];
  quantitative_measurements: ObservationSubcountQuantitativeMeasurementObject[];
};

export type SubcountObservationColumns = {
  observation_subcount_id: number | null;
  comment: string | null;
  subcount: number | null;
  qualitative_measurements: {
    critterbase_taxon_measurement_id: string;
    critterbase_measurement_qualitative_option_id: string;
  }[];
  quantitative_measurements: {
    critterbase_taxon_measurement_id: string;
    value: number;
  }[];
  [key: string]: any;
};

export interface SubcountToSave {
  observation_subcount_id: number | null;
  subcount: number | null;
  comment: string | null;
  qualitative_measurements: SubcountQualitativeMeasurement[];
  quantitative_measurements: SubcountQuantitativeMeasurement[];
}

export interface SubcountQualitativeMeasurement {
  measurement_id: string;
  measurement_option_id: string;
}

export interface SubcountQuantitativeMeasurement {
  measurement_id: string;
  measurement_value: number;
}

export type ObservationSubcountQualitativeMeasurementObject = Pick<
  ObservationSubCountQualitativeMeasurementRecord,
  'critterbase_taxon_measurement_id' | 'critterbase_measurement_qualitative_option_id'
> &
  FormikKeyUuid;

export type ObservationSubcountQuantitativeMeasurementObject = Pick<
  ObservationSubCountQuantitativeMeasurementRecord,
  'critterbase_taxon_measurement_id' | 'value'
> &
  FormikKeyUuid;

export type ObservationSubCountQualitativeMeasurementRecord = {
  observation_subcount_id: number;
  critterbase_taxon_measurement_id: string;
  critterbase_measurement_qualitative_option_id: string;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
};

export type ObservationSubCountQuantitativeMeasurementRecord = {
  observation_subcount_id: number;
  critterbase_taxon_measurement_id: string;
  value: number;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
};
