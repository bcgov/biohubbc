import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { HabitatFeatureSamplingForm } from 'features/surveys/habitat-features/components/forms/sampling/HabitatFeatureSamplingForm';
import { useState } from 'react';
import { HabitatFeatureGeneralInformationForm } from './general-information/HabitatFeatureGeneralInformationForm';
import { HabitatFeatureSpatialInformationForm } from './spatial-information/HabitatFeatureSpatialInformationForm';

/**
 * Habitat Feature form.
 *
 * @return {*} {JSX.Element}
 */
export const HabitatFeatureForm = () => {
  const [showSamplingInformation, setShowSamplingInformation] = useState(false);

  return (
    <Stack>
      <HorizontalSplitFormComponent
        title="General Information"
        summary="Enter general information about the habitat feature">
        <HabitatFeatureGeneralInformationForm />
      </HorizontalSplitFormComponent>

      <Divider sx={{ my: 5 }} />

      <HorizontalSplitFormComponent
        title="Sampling Information"
        summary="Enter sampling information about the habitat feature">
        <HabitatFeatureSamplingForm
          showSamplingInformation={showSamplingInformation}
          setShowSamplingInformation={setShowSamplingInformation}
        />
      </HorizontalSplitFormComponent>

      <Divider sx={{ my: 5 }} />

      <HorizontalSplitFormComponent
        title="Spatial Information"
        summary="Enter spatial information about the habitat feature">
        <HabitatFeatureSpatialInformationForm />
      </HorizontalSplitFormComponent>

      <Divider sx={{ my: 5 }} />
    </Stack>
  );
};
