import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {
  CreateObservationFormData,
  UpdateObservationFormData
} from 'features/surveys/observations/form/components/ObservationForm.interface';
import { MethodTechniqueField } from 'features/surveys/observations/form/components/sampling/components/MethodTechniqueField';
import { SamplingPeriodField } from 'features/surveys/observations/form/components/sampling/components/SamplingPeriodField';
import { SamplingSiteField } from 'features/surveys/observations/form/components/sampling/components/SamplingSiteField';
import { useSamplingInformationCache } from 'features/surveys/observations/form/components/sampling/hooks/useSamplingInformationCache';
import { useFormikContext } from 'formik';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { useState } from 'react';

export interface IObservationSamplingFormProps {
  /**
   * The initial supplementary sampling data to populate the sampling autocomplete fields with.
   */
  initialSupplementarySamplingData?: GetSamplingPeriod[];
}

/**
 * Form component for the observation sampling information.
 *
 * @param {IObservationSamplingFormProps} props
 * @return {*}
 */
export const ObservationSamplingForm = (props: IObservationSamplingFormProps) => {
  const { initialSupplementarySamplingData } = props;

  const { values } = useFormikContext<CreateObservationFormData | UpdateObservationFormData>();

  const [showSamplingInformation, setShowSamplingInformation] = useState(
    !!(
      values.standardColumns.survey_sample_site_id ||
      values.standardColumns.survey_sample_period_id ||
      values.standardColumns.method_technique_id
    ) || false
  );

  const samplingInformationCache = useSamplingInformationCache();

  // Initialize the cached sampling information.
  // Optional when creating new records. Necessary when editing existing records.
  samplingInformationCache.initCachedSamplingInformationRef({ periods: initialSupplementarySamplingData ?? [] });

  return (
    <>
      {showSamplingInformation ? (
        <Stack gap={2}>
          <SamplingSiteField samplingInformationCache={samplingInformationCache} />
          <MethodTechniqueField samplingInformationCache={samplingInformationCache} />
          <SamplingPeriodField samplingInformationCache={samplingInformationCache} />
        </Stack>
      ) : (
        <Button
          color="primary"
          variant="outlined"
          startIcon={<Icon path={mdiPlus} size={1} />}
          aria-label="add sampling information"
          onClick={() => setShowSamplingInformation(true)}>
          Add Sampling Site
        </Button>
      )}
    </>
  );
};
