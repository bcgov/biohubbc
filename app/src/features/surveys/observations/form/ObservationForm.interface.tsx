import {
  ObservationSubcountQualitativeEnvironmentObject,
  ObservationSubcountQuantitativeEnvironmentObject,
  StandardObservationColumns,
  SubcountQualitativeMeasurement,
  SubcountQuantitativeMeasurement
} from 'interfaces/useObservationApi.interface';

export type SubcountFormData = {
  /**
   * Unique id for react keys.
   */
  _id?: string;
  /**
   * The subcount record id.
   *
   * Will be null when creating a new subcount record, and will be non-null when editing an existing subcount record.
   */
  observation_subcount_id: number | null;
  /**
   * The count value for the subcount record.
   *
   * ie: How many of the species were observed.
   */
  count: number | null;
  /**
   * The comment for the subcount record.
   */
  comment: string | null;
  /**
   * The measurements for the subcount record.
   */
  measurements: (SubcountQualitativeMeasurement | SubcountQuantitativeMeasurement)[];
  observation_subcount_sign_id: number | null;
  markings?: never[]; // TODO - future enhancement
};

export type SubcountsFormData = {
  subcounts: SubcountFormData[];
};

/**
 * Defines the form data structure for the ObservationForm component.
 */
export type ObservationFormData = {
  /**
   * The standard columns for the observation record.
   */
  standardColumns: Omit<StandardObservationColumns, 'survey_observation_id'> & {
    survey_observation_id: number | null;
    observation_sign_id: number | null;
    survey_sample_site_id: number | undefined;
    method_technique_id: number | undefined;
    environments: (
      | ObservationSubcountQualitativeEnvironmentObject
      | ObservationSubcountQuantitativeEnvironmentObject
    )[];
  };
} & SubcountsFormData;
