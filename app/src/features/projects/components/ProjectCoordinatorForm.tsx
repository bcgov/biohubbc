import AutocompleteField from 'components/fields/AutocompleteField';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  makeStyles,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@material-ui/core';
import { useFormikContext } from 'formik';
import React from 'react';
import * as yup from 'yup';

export interface IProjectCoordinatorForm {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: string;
}

export interface IProjectCoordinatorFormProps {
  coordinator_agency: string[];
}

export const ProjectCoordinatorInitialValues: IProjectCoordinatorForm = {
  first_name: '',
  last_name: '',
  email_address: '',
  coordinator_agency: '',
  share_contact_details: 'false'
};

export const ProjectCoordinatorYupSchema = yup.object().shape({
  first_name: yup.string().required('Required'),
  last_name: yup.string().required('Required'),
  email_address: yup.string().email('Must be a valid email address').required('Required'),
  coordinator_agency: yup.string().required('Required'),
  share_contact_details: yup.string().required('Required')
});

const useStyles = makeStyles((theme) => ({
  legend: {
    marginTop: '1rem',
    float: 'left',
    marginBottom: '0.75rem',
    letterSpacing: '-0.01rem'
  }
}));

/**
 * Create project - coordinator fields
 *
 * @return {*}
 */
const ProjectCoordinatorForm: React.FC<IProjectCoordinatorFormProps> = (props) => {
  const classes = useStyles();
  const { values, touched, errors, handleChange } = useFormikContext<IProjectCoordinatorForm>();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required={true}
          id="first_name"
          name="first_name"
          label="First Name"
          variant="outlined"
          value={values.first_name}
          onChange={handleChange}
          error={touched.first_name && Boolean(errors.first_name)}
          helperText={errors.first_name}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required={true}
          id="last_name"
          name="last_name"
          label="Last Name"
          variant="outlined"
          value={values.last_name}
          onChange={handleChange}
          error={touched.last_name && Boolean(errors.last_name)}
          helperText={errors.last_name}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          required={true}
          id="email_address"
          name="email_address"
          label="Business Email Address"
          variant="outlined"
          value={values.email_address}
          onChange={handleChange}
          error={touched.email_address && Boolean(errors.email_address)}
          helperText={errors.email_address}
        />
      </Grid>

      <Grid item xs={12}>
        <AutocompleteField
          id="coordinator_agency"
          name="Coordinator Agency"
          label={'Coordinator Agency'}
          value={values.coordinator_agency}
          options={props.coordinator_agency}
          required={true}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControl
          required={true}
          component="fieldset"
          error={touched.share_contact_details && Boolean(errors.share_contact_details)}>
          <FormLabel component="legend" className={classes.legend}>
            Share Contact Details
          </FormLabel>
          <Typography>Do you want the project coordinator contact information visible to the public?</Typography>
          <Box mt={2}>
            <RadioGroup
              name="share_contact_details"
              aria-label="Share Contact Details"
              value={values.share_contact_details}
              onChange={handleChange}>
              <FormControlLabel value="false" control={<Radio required={true} color="primary" />} label="No" />
              <FormControlLabel value="true" control={<Radio required={true} color="primary" />} label="Yes" />
              <FormHelperText>{errors.share_contact_details}</FormHelperText>
            </RadioGroup>
          </Box>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default ProjectCoordinatorForm;
