import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { HabitatFeatureGeneralInformationForm } from './general-information/HabitatFeatureGeneralInformationForm';

/**
 * Habitat Feature form.
 *
 * @return {*} {JSX.Element}
 */
export const HabitatFeatureForm = () => {
  return (
    <Stack>
      <HorizontalSplitFormComponent
        title="General Information"
        summary="Enter general information about the habitat feature">
        <HabitatFeatureGeneralInformationForm />
      </HorizontalSplitFormComponent>

      <Divider sx={{ my: 5 }} />

      <HorizontalSplitFormComponent
        title="Spatial Information"
        summary="Enter spatial information about the habitat feature"></HorizontalSplitFormComponent>

      <Divider sx={{ my: 5 }} />

      <HorizontalSplitFormComponent
        title="Temporal Information"
        summary="Enter temporal information about the habitat feature"></HorizontalSplitFormComponent>
    </Stack>
  );
};
