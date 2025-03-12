import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import {
  CreateHabitatFeatureFormValues,
  UpdateHabitatFeatureFormValues
} from 'features/surveys/habitat-features/components/forms/HabitatFeatureFormContainer';
import { MethodTechniqueField } from 'features/surveys/habitat-features/components/forms/sampling-information/components/MethodTechniqueField';
import { SamplingPeriodField } from 'features/surveys/habitat-features/components/forms/sampling-information/components/SamplingPeriodField';
import { SamplingSiteField } from 'features/surveys/habitat-features/components/forms/sampling-information/components/SamplingSiteField';
import { useSamplingInformationCache } from 'features/surveys/habitat-features/components/forms/sampling-information/hooks/useSamplingInformationCache';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import React, { useEffect } from 'react';

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
export const HabitatFeatureSamplingForm = <
  HabitatFeatureFormValuesType extends CreateHabitatFeatureFormValues | UpdateHabitatFeatureFormValues
>(
  props: IHabitatFeatureSamplingFormProps
) => {
  const { showSamplingInformation, setShowSamplingInformation } = props;

  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();

  const samplingInformationCache = useSamplingInformationCache();

  const formikProps = useFormikContext<HabitatFeatureFormValuesType>();

  const surveySamplePeriodId = formikProps.initialValues.survey_sample_period_id;

  const samplePeriodDataLoader = useDataLoader(async () => {
    if (!surveySamplePeriodId) {
      // No survey sample period id, nothing to load
      return null;
    }

    return biohubApi.samplingPeriod.getSamplePeriodById(
      surveyContext.projectId,
      surveyContext.surveyId,
      surveySamplePeriodId
    );
  });

  useEffect(() => {
    samplePeriodDataLoader.load();
  }, [samplePeriodDataLoader]);

  // If a survey sample period id is provided, and the sample period data loader is still loading or not ready, show
  // a loading skeleton.
  if (surveySamplePeriodId && (samplePeriodDataLoader.isLoading || !samplePeriodDataLoader.isReady)) {
    return (
      <Stack gap={2} direction={'column'}>
        <Skeleton variant="rectangular" height={56} />
        <Skeleton variant="rectangular" height={56} />
        <Skeleton variant="rectangular" height={56} />
      </Stack>
    );
  }

  // Initialize the cached sampling information.
  // Optional when creating new records. Necessary when editing existing records.
  samplingInformationCache.initCachedSamplingInformationRef({
    periods: samplePeriodDataLoader.data ? [samplePeriodDataLoader.data] : undefined
  });

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
