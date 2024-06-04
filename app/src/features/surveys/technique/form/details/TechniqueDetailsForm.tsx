import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const TechniqueDetailsForm = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography component="legend">Detection distance (optional)</Typography>
        <CustomTextField name="distance_threshold" label="Maximum detection distance (metres)" maxLength={1000} />
      </Grid>
    </Grid>
  );
};

export default TechniqueDetailsForm;
