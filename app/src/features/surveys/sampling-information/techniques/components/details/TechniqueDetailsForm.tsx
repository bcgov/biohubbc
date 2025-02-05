import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';

/**
 * Technique details form.
 *
 * @return {*}
 */
export const TechniqueDetailsForm = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography component="legend">Detection distance (optional)</Typography>
        <CustomTextField
          name="distance_threshold"
          label="Maximum detection distance (metres)"
          maxLength={1000}
          other={{ type: 'number' }}
          helpText={`The range within which observations can be made, influenced by the constituents of the technique specified above.`}
        />
      </Grid>
    </Grid>
  );
};
