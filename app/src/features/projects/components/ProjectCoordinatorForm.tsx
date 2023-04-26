import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Typography from '@material-ui/core/Typography';
import AutocompleteFreeSoloField from 'components/fields/AutocompleteFreeSoloField';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectCoordinatorForm {
  coordinator: {
    first_name: string;
    last_name: string;
    email_address: string;
    coordinator_agency: string;
    share_contact_details: string;
  };
}

export const ProjectCoordinatorInitialValues: IProjectCoordinatorForm = {
  coordinator: {
    first_name: '',
    last_name: '',
    email_address: '',
    coordinator_agency: '',
    share_contact_details: 'false'
  }
};

export const ProjectCoordinatorYupSchema = yup.object().shape({
  coordinator: yup.object().shape({
    first_name: yup.string().max(50, 'Cannot exceed 50 characters').required('First Name is Required'),
    last_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Last Name is Required'),
    email_address: yup
      .string()
      .max(500, 'Cannot exceed 500 characters')
      .email('Must be a valid email address')
      .required('Business Email Address is Required'),
    coordinator_agency: yup
      .string()
      .max(300, 'Cannot exceed 300 characters')
      .required('Coordinator Agency is Required')
      .nullable(),
    share_contact_details: yup.string().required('Please select an option')
  })
});

export interface IProjectCoordinatorFormProps {
  coordinator_agency: string[];
}

/**
 * Create project - coordinator fields
 *
 * @return {*}
 */
const ProjectCoordinatorForm: React.FC<IProjectCoordinatorFormProps> = (props) => {
  const { values, touched, handleSubmit, errors, handleChange } = useFormikContext<ICreateProjectRequest>();

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <CustomTextField
            name="coordinator.first_name"
            label="First Name"
            other={{
              required: true
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            name="coordinator.last_name"
            label="Last Name"
            other={{
              required: true
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name="coordinator.email_address"
            label="Business Email Address"
            other={{
              required: true
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <AutocompleteFreeSoloField
            id="coordinator_agency"
            name="coordinator.coordinator_agency"
            label="Contact Agency"
            options={props.coordinator_agency}
            required={true}
          />
        </Grid>
      </Grid>
      <Box mt={5}>
        <FormControl
          required={true}
          component="fieldset"
          error={touched.coordinator?.share_contact_details && Boolean(errors.coordinator?.share_contact_details)}>
          <Typography component="legend" variant="h5">
            Share Contact Details
          </Typography>
          <Typography color="textSecondary">
            Do you want the project contact's name and email address visible to the public?
          </Typography>
          <Box mt={2} pl={1}>
            <RadioGroup
              name="coordinator.share_contact_details"
              aria-label="Share Contact Details"
              value={values.coordinator.share_contact_details}
              onChange={handleChange}>
              <FormControlLabel
                value="false"
                control={<Radio required={true} color="primary" size="small" />}
                label="No"
              />
              <FormControlLabel
                value="true"
                control={<Radio required={true} color="primary" size="small" />}
                label="Yes"
              />
              <FormHelperText>{errors.coordinator?.share_contact_details}</FormHelperText>
            </RadioGroup>
          </Box>
        </FormControl>
      </Box>
    </form>
  );
};

export default ProjectCoordinatorForm;
