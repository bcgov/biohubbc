import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { MethodTechniqueField } from 'features/surveys/habitat-features/components/forms/sampling/components/MethodTechniqueField';
import { SamplingPeriodField } from 'features/surveys/habitat-features/components/forms/sampling/components/SamplingPeriodField';
import { SamplingSiteField } from 'features/surveys/habitat-features/components/forms/sampling/components/SamplingSiteField';
import { useSamplingInformationCache } from 'features/surveys/habitat-features/components/forms/sampling/hooks/useSamplingInformationCache';
import React from 'react';

interface IHabitatFeatureSamplingFormProps {
  showSamplingInformation: boolean;
  setShowSamplingInformation: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Form component for the habitat feature sampling information.
 *
 * @param {IHabitatFeatureSamplingFormProps} props
 * @return {*}
 */
export const HabitatFeatureSamplingForm = (props: IHabitatFeatureSamplingFormProps) => {
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
