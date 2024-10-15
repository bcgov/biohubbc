import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const SampleSiteGeneralInformationEditForm = () => {
  return (
    <Box component="fieldset">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextField name="name" label="Name" other={{ placeholder: 'Maximum 50 characters', required: true }} />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField name="description" label="Description" other={{ multiline: true, rows: 4 }} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SampleSiteGeneralInformationEditForm;
