import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useFormikContext } from 'formik';
import { ChangeEvent } from 'react';

/**
 * Component for adding a name and description to a sampling site on the create form.
 *
 * NOTE: When creating a sampling site, the sites are an array and the name and description apply to each of the sites in the array.
 * A name and description can only be manually entered when creating a single sampling site. If creating multiple,
 * the name and description are taken from the file or default to "Samping Site i" and no description.
 *
 * @return {*}
 */
const SampleSiteGeneralInformationCreateForm = () => {
  const { setFieldValue } = useFormikContext();

  const handleNameChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setFieldValue('survey_sample_sites[0].name', newValue);
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setFieldValue('survey_sample_sites[0].description', newValue);
  };

  return (
    <Box component="fieldset">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField label="Name" placeholder="Maximum 50 characters" required onChange={handleNameChange} fullWidth />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Description" multiline rows={4} onChange={handleDescriptionChange} fullWidth />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SampleSiteGeneralInformationCreateForm;
