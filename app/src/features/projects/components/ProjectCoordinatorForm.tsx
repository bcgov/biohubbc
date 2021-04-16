import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import AutocompleteField from 'components/fields/AutocompleteField';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectCoordinatorForm {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: string;
}

export const ProjectCoordinatorInitialValues: IProjectCoordinatorForm = {
  first_name: '',
  last_name: '',
  email_address: '',
  coordinator_agency: '',
  share_contact_details: 'false'
};

export const ProjectCoordinatorYupSchema = yup.object().shape({
  first_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  last_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  email_address: yup
    .string()
    .max(500, 'Cannot exceed 500 characters')
    .email('Must be a valid email address')
    .required('Required'),
  coordinator_agency: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
  share_contact_details: yup.string().required('Required')
});

export interface IProjectCoordinatorFormProps {
  coordinator_agency: string[];
}

const useStyles = makeStyles((theme: Theme) => ({
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
  const { values, touched, errors, handleChange, handleSubmit } = useFormikContext<IProjectCoordinatorForm>();

  return (
    <form onSubmit={handleSubmit}>
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
    </form>
  );
};

export default ProjectCoordinatorForm;
