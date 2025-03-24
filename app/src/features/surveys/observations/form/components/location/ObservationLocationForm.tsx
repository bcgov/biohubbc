import Stack from '@mui/material/Stack';
import CustomTextField from 'components/fields/CustomTextField';

/**
 * Form component for the observation location.
 *
 * @return {*}
 */
export const ObservationLocationForm = () => {
  return (
    <Stack spacing={2}>
      <CustomTextField label="Latitude" name="standardColumns.latitude" other={{ type: 'number' }} />
      <CustomTextField label="Longitude" name="standardColumns.longitude" other={{ type: 'number' }} />
    </Stack>
  );
};
