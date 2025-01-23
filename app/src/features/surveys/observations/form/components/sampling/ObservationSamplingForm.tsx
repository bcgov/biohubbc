import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { MethodTechniqueField } from 'features/surveys/observations/form/components/sampling/components/MethodTechniqueField';
import { SamplingPeriodField } from 'features/surveys/observations/form/components/sampling/components/SamplingPeriodField';
import { SamplingSiteField } from 'features/surveys/observations/form/components/sampling/components/SamplingSiteField';
import { useSamplingInformationCache } from 'features/surveys/observations/form/components/sampling/hooks/useSamplingInformationCache';
import React from 'react';

interface IObservationSamplingFormProps {
  showSamplingInformation: boolean;
  setShowSamplingInformation: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Form component for the observation sampling information.
 *
 * @param {IObservationSamplingFormProps} props
 * @return {*}
 */
export const ObservationSamplingForm = (props: IObservationSamplingFormProps) => {
  const { showSamplingInformation, setShowSamplingInformation } = props;

  const samplingInformationCache = useSamplingInformationCache();

  // Initialize the cached sampling information.
  // Optional when creating new records. Necessary when editing existing records.
  samplingInformationCache.initCachedSamplingInformationRef({ periods: [] });

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
