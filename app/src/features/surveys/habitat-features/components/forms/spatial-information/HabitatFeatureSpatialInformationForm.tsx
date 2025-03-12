import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';

/**
 * Habitat Feature spatial information form.
 *
 * @return {*} {JSX.Element}
 */
export const HabitatFeatureSpatialInformationForm = (): JSX.Element => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} display="flex" gap={1}>
        <Grid item xs={6}>
          <CustomTextField name="latitude" label="Latitude" other={{ type: 'number' }} />
        </Grid>

        <Grid item xs={6}>
          <CustomTextField name="longitude" label="Longitude" other={{ type: 'number' }} />
        </Grid>

        {/* TODO: Mac: Add a map for selecting lat / long values */}
      </Grid>
    </Grid>
  );
};
