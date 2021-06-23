import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
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

export interface IBCeIDRequestFormProps {
  codes?: IGetAllCodeSetsResponse;
}

/**
 * Access Request - BCeID request fields
 *
 * @return {*}
 */
const BCeIDRequestForm: React.FC<IBCeIDRequestFormProps> = (props) => {
  const { values, touched, errors, handleChange } = useFormikContext<IBCeIDRequestForm>();

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
          <h3>Why are you requesting access to Biohub?</h3>
          <TextField
            fullWidth
            id="request_reason"
            name="request_reason"
            label="Request Reason"
            variant="outlined"
            multiline
            rows={4}
            value={values.request_reason}
            onChange={handleChange}
            error={touched.request_reason && Boolean(errors.request_reason)}
            helperText={errors.request_reason}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BCeIDRequestForm;
