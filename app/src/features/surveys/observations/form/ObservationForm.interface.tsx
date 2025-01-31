import { EnvironmentsFormData } from 'features/surveys/observations/form/components/environments/ObservationEnvironmentsForm';
import { SubcountsFormData } from 'features/surveys/observations/form/components/subcounts/SubcountsForm';
import { StandardObservationColumns } from 'interfaces/useObservationApi.interface';

/**
 * Defines the form data structure for the ObservationForm component.
 */
export type ObservationFormData = {
  /**
   * The standard columns for the observation record.
   */
  standardColumns: Pick<
    StandardObservationColumns,
    | 'itis_tsn'
    | 'itis_scientific_name'
    | 'survey_sample_period_id'
    | 'count'
    | 'observation_date'
    | 'observation_time'
    | 'latitude'
    | 'longitude'
    | 'observation_sign_id'
  > & {
    survey_observation_id: number | null;
    survey_sample_site_id: number | undefined;
    method_technique_id: number | undefined;
  } & EnvironmentsFormData;
} & SubcountsFormData;
