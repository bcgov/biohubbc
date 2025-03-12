import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import {
  CreateHabitatFeatureFormValues,
  UpdateHabitatFeatureFormValues
} from 'features/surveys/habitat-features/components/forms/HabitatFeatureFormContainer';
import { HabitatFeatureSamplingForm } from 'features/surveys/habitat-features/components/forms/sampling-information/HabitatFeatureSamplingForm';
import { useFormikContext } from 'formik';
import { useState } from 'react';
import { HabitatFeatureGeneralInformationForm } from './general-information/HabitatFeatureGeneralInformationForm';
import { HabitatFeatureSpatialInformationForm } from './spatial-information/HabitatFeatureSpatialInformationForm';
import { HabitatFeatureTaxonAssociationForm } from './taxon-information/HabitatFeatureTaxonAssociationForm';

/**
 * Habitat Feature form.
 *
 * @return {*} {JSX.Element}
 */
export const HabitatFeatureForm = <
  HabitatFeatureFormValuesType extends CreateHabitatFeatureFormValues | UpdateHabitatFeatureFormValues
>() => {
  const formikProps = useFormikContext<HabitatFeatureFormValuesType>();

  const surveySamplePeriodId = formikProps.initialValues.survey_sample_period_id;

  const [showSamplingInformation, setShowSamplingInformation] = useState(surveySamplePeriodId !== null);

  return (
    <Stack>
      <HorizontalSplitFormComponent
        title="General Information"
        summary="Enter general information about the habitat feature">
        <HabitatFeatureGeneralInformationForm />
      </HorizontalSplitFormComponent>

      <Divider sx={{ my: 5 }} />

      <HorizontalSplitFormComponent
        title="Taxon Association Information"
        summary="Enter any taxon associations for the habitat feature">
        <HabitatFeatureTaxonAssociationForm />
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
        <HabitatFeatureSpatialInformationForm mapId="habitat-feature-location-form" />
      </HorizontalSplitFormComponent>

      <Divider sx={{ my: 5 }} />
    </Stack>
  );
};
