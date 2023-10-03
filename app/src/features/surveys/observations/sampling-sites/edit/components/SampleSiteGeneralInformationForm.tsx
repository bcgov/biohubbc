import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import React from 'react';

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const SampleSiteGeneralInformationForm: React.FC = (props) => {
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextField
            name="sampleSite.name"
            label="Name"
            other={{
              required: true
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name="sampleSite.description"
            label="Description"
            other={{ multiline: true, required: true, rows: 4 }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default SampleSiteGeneralInformationForm;
