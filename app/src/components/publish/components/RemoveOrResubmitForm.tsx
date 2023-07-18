import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import yup from 'utils/YupSchema';

export interface IRemoveOrResubmitForm {
  full_name: string;
  email_address: string;
  phone_number: string;
  description: string;
}

export const RemoveOrResubmitFormInitialValues: IRemoveOrResubmitForm = {
  full_name: '',
  email_address: '',
  phone_number: '',
  description: ''
};

export const RemoveOrResubmitFormYupSchema = yup.object().shape({
  full_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Full Name is Required'),
  email_address: yup
    .string()
    .max(500, 'Cannot exceed 500 characters')
    .email('Must be a valid email address')
    .required('Email Address is Required'),
  phone_number: yup.string().max(300, 'Cannot exceed 300 characters').required('Phone Number is Required'),
  description: yup.string().max(3000, 'Cannot exceed 3000 characters').required('Description is Required')
});

/**
 * Publish button.
 *
 * @return {*}
 */
const RemoveOrResubmitForm = () => {
  return (
    <>
      <Typography variant="body1">
        <strong>CONTACT DETAILS</strong>
      </Typography>

      <Box py={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <CustomTextField
              name="full_name"
              label="Full Name"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="email_address"
              label="Email Address"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="phone_number"
              label="Phone Number"
              other={{
                required: true
              }}
            />
          </Grid>
        </Grid>
      </Box>

      <Box mt={2}>
        <Typography variant="body1">
          <strong>DESCRIPTION OF REQUEST</strong>
        </Typography>
        <Box py={2}>
          <CustomTextField
            name="description"
            label="Description"
            other={{ multiline: true, required: true, rows: 4 }}
          />
        </Box>
      </Box>
    </>
  );
};

export default RemoveOrResubmitForm;
