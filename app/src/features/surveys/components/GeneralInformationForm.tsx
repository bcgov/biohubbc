import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useFormikContext } from 'formik';
import React from 'react';
import { getFormattedDate } from 'utils/Utils';
import yup from 'utils/YupSchema';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  }
});

export interface IGeneralInformationForm {
  survey_name: string;
  start_date: string;
  end_date: string;
  focal_species: number[];
  ancillary_species: number[];
  survey_purpose: string;
  biologist_first_name: string;
  biologist_last_name: string;
}

export const GeneralInformationInitialValues: IGeneralInformationForm = {
  survey_name: '',
  start_date: '',
  end_date: '',
  focal_species: [],
  ancillary_species: [],
  survey_purpose: '',
  biologist_first_name: '',
  biologist_last_name: ''
};

export const GeneralInformationYupSchema = (customYupRules?: any) => {
  return yup.object().shape({
    survey_name: yup.string().required('Required'),
    survey_purpose: yup
      .string()
      .max(3000, 'Cannot exceed 3000 characters')
      .required('You must provide a purpose for the survey'),
    focal_species: yup.array().required('Required'),
    ancillary_species: yup.array().isUniqueFocalAncillarySpecies('Focal and Ancillary species must be unique'),
    biologist_first_name: yup.string().required('Required'),
    biologist_last_name: yup.string().required('Required'),
    start_date: customYupRules?.start_date || yup.string().isValidDateString().required('Required'),
    end_date: customYupRules?.end_date || yup.string().isValidDateString().isEndDateAfterStartDate('start_date')
  });
};

export interface IGeneralInformationFormProps {
  species: IMultiAutocompleteFieldOption[];
  projectStartDate: string;
  projectEndDate: string;
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
          <CustomTextField
            name="survey_name"
            label="Survey Name"
            other={{
              required: true
            }}
          />
        </Grid>
        <StartEndDateFields
          formikProps={formikProps}
          startRequired={true}
          endRequired={false}
          startDateHelperText={`Start date must be after project start date ${getFormattedDate(
            DATE_FORMAT.ShortMediumDateFormat,
            props.projectStartDate
          )}`}
          endDateHelperText={
            props.projectEndDate &&
            `End date must be before project end date ${getFormattedDate(
              DATE_FORMAT.ShortMediumDateFormat,
              props.projectEndDate
            )}`
          }
        />
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id="focal_species"
            label="Focal Species"
            options={props.species}
            required={true}
          />
        </Grid>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id="ancillary_species"
            label="Ancillary Species"
            options={props.species}
            required={false}
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
            <CustomTextField
              name="biologist_first_name"
              label="First Name"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField
              name="biologist_last_name"
              label="Last Name"
              other={{
                required: true
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
};

export default GeneralInformationForm;
