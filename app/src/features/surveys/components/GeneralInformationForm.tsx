import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';
import makeStyles from '@material-ui/core/styles/makeStyles';
import AutocompleteField from 'components/fields/AutocompleteField';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  }
});

export interface IGeneralInformationForm {
  survey_name: string;
  start_date: string;
  end_date: string;
  species: string;
  survey_purpose: string;
  biologist_first_name: string;
  biologist_last_name: string;
}

export const GeneralInformationInitialValues: IGeneralInformationForm = {
  survey_name: '',
  start_date: '',
  end_date: '',
  species: '',
  survey_purpose: '',
  biologist_first_name: '',
  biologist_last_name: ''
};

export const GeneralInformationYupSchema = yup.object().shape({
  survey_name: yup.string().required('Required'),
  survey_purpose: yup
    .string()
    .max(3000, 'Cannot exceed 3000 characters')
    .required('You must provide a purpose for the survey'),
  species: yup.string().required('Required'),
  biologist_first_name: yup.string().required('Required'),
  biologist_last_name: yup.string().required('Required'),
  start_date: yup.string().isValidDateString().required('Required'),
  end_date: yup.string().isValidDateString().isEndDateAfterStartDate('start_date')
});

export interface IGeneralInformationFormProps {
  species: string[];
}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const GeneralInformationForm: React.FC<IGeneralInformationFormProps> = (props) => {
  const classes = useStyles();

  const formikProps = useFormikContext<IGeneralInformationForm>();
  const { values, touched, errors, handleChange } = formikProps;

  return (
    <form>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required={true}
            id="survey_name"
            name="survey_name"
            label="Survey Name"
            variant="outlined"
            value={values.survey_name}
            onChange={handleChange}
            error={touched.survey_name && Boolean(errors.survey_name)}
            helperText={touched.survey_name && errors.survey_name}
          />
        </Grid>
        <StartEndDateFields formikProps={formikProps} startRequired={true} endRequired={false} />
        <Grid item xs={12}>
          <AutocompleteField
            id="species"
            name="Species"
            label="Species"
            value={values.species}
            options={props.species}
            required={true}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="survey_purpose"
            name="survey_purpose"
            label="Purpose of Survey"
            multiline
            required={true}
            rows={4}
            fullWidth
            variant="outlined"
            value={values.survey_purpose}
            onChange={handleChange}
            error={touched.survey_purpose && Boolean(errors.survey_purpose)}
            helperText={touched.survey_purpose && errors.survey_purpose}
          />
        </Grid>
        <Grid item xs={12}>
          <Box pt={4}>
            <Typography className={classes.bold}>Lead biologist for this survey</Typography>
          </Box>
        </Grid>
        <Grid container item spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required={true}
              id="biologist_first_name"
              name="biologist_first_name"
              label="First Name"
              variant="outlined"
              value={values.biologist_first_name}
              onChange={handleChange}
              error={touched.biologist_first_name && Boolean(errors.biologist_first_name)}
              helperText={touched.biologist_first_name && errors.biologist_first_name}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required={true}
              id="biologist_last_name"
              name="biologist_last_name"
              label="Last Name"
              variant="outlined"
              value={values.biologist_last_name}
              onChange={handleChange}
              error={touched.biologist_last_name && Boolean(errors.biologist_last_name)}
              helperText={touched.biologist_last_name && errors.biologist_last_name}
            />
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
};

export default GeneralInformationForm;
