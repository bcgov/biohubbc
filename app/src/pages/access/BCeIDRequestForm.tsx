import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IBCeIDRequestForm {
  company: string;
  request_reason: string;
}

export const BCeIDRequestFormInitialValues: IBCeIDRequestForm = {
  company: '',
  request_reason: ''
};

export const BCeIDRequestFormYupSchema = yup.object().shape({
  company: yup.string().required('Required'),
  request_reason: yup.string().max(300, 'Maximum 300 characters')
});

/**
 * Access Request - BCeID request fields
 *
 * @return {*}
 */
const BCeIDRequestForm = () => {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h3>Company Name</h3>
          <CustomTextField
            name="company"
            label="Company Name"
            other={{
              required: true
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <h3>Why are you requesting access to Restoration Tracker?</h3>
          <CustomTextField name="request_reason" label="Request Reason" other={{ multiline: true, rows: 4 }} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BCeIDRequestForm;
