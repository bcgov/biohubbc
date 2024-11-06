import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
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
        <Box display="flex" alignItems="center">
          <Typography component="legend" sx={{ mr: 1 }}>
            Detection distance (optional)
          </Typography>
          <HelpButtonTooltip content="The predefined limit set by the observer within which data is collected, regardless of actual visibility or other external conditions. It represents a methodological boundary rather than a measure of physical sight range." />
        </Box>
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          name="distance_threshold"
          label="Maximum detection distance (metres)"
          maxLength={1000}
          other={{ type: 'number' }}
        />
      </Grid>
    </Grid>
  );
};
