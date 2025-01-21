import {
  ObservationSubcountQualitativeEnvironmentObject,
  ObservationSubcountQuantitativeEnvironmentObject,
  StandardObservationColumns,
  SubcountQualitativeEnvironment,
  SubcountQualitativeMeasurement,
  SubcountQuantitativeEnvironment,
  SubcountQuantitativeMeasurement
} from 'interfaces/useObservationApi.interface';

export interface IObservationSubcountForm {
  _id?: string; // Temporary id for react key
  observation_subcount_id: number | null;
  subcount: number | null;
  comment: string | null;
  measurements: (SubcountQualitativeMeasurement | SubcountQuantitativeMeasurement)[];
  markings?: never[]; // TODO - future enhancement
  // TODO - move environments out of subcounts and into standard columns
  observation_subcount_sign_id: number | null;
  // TODO - move environments out of subcounts and into standard columns
  environments: (SubcountQualitativeEnvironment | SubcountQuantitativeEnvironment)[];
}

/**
 * Defines the form data structure for the ObservationForm component.
 */
export interface IObservationForm {
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
  subcounts: IObservationSubcountForm[];
}
