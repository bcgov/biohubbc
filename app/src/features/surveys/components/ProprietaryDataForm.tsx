import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Typography from '@material-ui/core/Typography';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';
import CustomTextField from 'components/fields/CustomTextField';

const useStyles = makeStyles(() => ({
  legend: {
    marginTop: '1rem',
    float: 'left',
    marginBottom: '0.75rem',
    letterSpacing: '-0.01rem'
  },
  bold: {
    fontWeight: 'bold'
  }
}));

export interface IProprietaryDataForm {
  proprietary_data_category: number;
  proprietor_name: string;
  first_nations_id: number;
  category_rationale: string;
  survey_data_proprietary: string;
  data_sharing_agreement_required: string;
}

export const ProprietaryDataInitialValues: IProprietaryDataForm = {
  proprietary_data_category: 0,
  proprietor_name: '',
  first_nations_id: 0,
  category_rationale: '',
  survey_data_proprietary: 'false',
  data_sharing_agreement_required: 'false'
};

export const ProprietaryDataYupSchema = yup.object().shape({
  proprietary_data_category: yup
    .number()
    .when('survey_data_proprietary', { is: 'true', then: yup.number().min(1, 'required').required('Required') }),
  proprietor_name: yup
    .string()
    .when('survey_data_proprietary', { is: 'true', then: yup.string().required('Required') }),
  first_nations_id: yup.number().when('survey_data_category', { is: 2, then: yup.number().min(1, 'required') }),
  category_rationale: yup
    .string()
    .max(3000, 'Cannot exceed 3000 characters')
    .when('survey_data_proprietary', {
      is: 'true',
      then: yup.string().required('You must provide a category rationale for the survey')
    }),
  survey_data_proprietary: yup.string().required('Required'),
  data_sharing_agreement_required: yup
    .string()
    .when('survey_data_proprietary', { is: 'true', then: yup.string().required('Required') })
});

export interface IProprietaryDataFormProps {
  proprietary_data_category: IAutocompleteFieldOption<number>[];
  first_nations: IAutocompleteFieldOption<number>[];
}

/**
 * Create survey - proprietary data fields
 *
 * @return {*}
 */
const ProprietaryDataForm: React.FC<IProprietaryDataFormProps> = (props) => {
  const classes = useStyles();

  const {
    values,
    touched,
    errors,
    handleChange,
    setFieldValue,
    setFieldTouched,
    setFieldError
  } = useFormikContext<IProprietaryDataForm>();

  const resetField = (name: string) => {
    setFieldValue(name, ProprietaryDataInitialValues[name]);
    setFieldTouched(name, false);
    setFieldError(name, undefined);
  };

  return (
    <form>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl
            required={true}
            component="fieldset"
            error={touched.survey_data_proprietary && Boolean(errors.survey_data_proprietary)}>
            <FormLabel component="legend" className={classes.legend}>
              Is the data captured in this survey proprietary?
            </FormLabel>
            <Box mt={2}>
              <RadioGroup
                name="survey_data_proprietary"
                aria-label="Survey Data Proprietary"
                value={values.survey_data_proprietary}
                onChange={(event) => {
                  // If radio button is toggled to `false`, reset the now hidden form fields
                  if (event.target.value === 'false') {
                    resetField('proprietary_data_category');
                    resetField('first_nations_id');
                    resetField('proprietor_name');
                    resetField('category_rationale');
                    resetField('data_sharing_agreement_required');
                  }

                  handleChange(event);
                }}>
                <FormControlLabel value="false" control={<Radio required={true} color="primary" />} label="No" />
                <FormControlLabel value="true" control={<Radio required={true} color="primary" />} label="Yes" />
                <FormHelperText>{errors.survey_data_proprietary}</FormHelperText>
              </RadioGroup>
            </Box>
          </FormControl>
        </Grid>
        {values.survey_data_proprietary === 'true' && (
          <>
            <Grid item xs={12}>
              <Typography className={classes.bold}>Proprietary Information</Typography>
            </Grid>
            <Grid item xs={12}>
              <AutocompleteField
                id="proprietary_data_category"
                name="proprietary_data_category"
                label="Proprietary Data Category"
                options={props.proprietary_data_category}
                onChange={(event, option) => {
                  // Reset proprietor_name and first_nations_id if user changes proprietary_data_category from
                  // `First Nations Land` to any other option. This is because the `First Nations Land` category is
                  // based on a dropdown, where as the other options are free-text and only one of `proprietor_name` or
                  // `first_nations_id` should be populated at a time.
                  if (values.proprietary_data_category === 2 && option?.value !== 2) {
                    resetField('first_nations_id');
                    resetField('proprietor_name');
                  }

                  // Reset proprietor_name if user changes proprietary_data_category from any other option to
                  // `First Nations Land`. This is because the other options are free-text, where as the
                  // `First Nations Land` category is based on a dropdown, and only one of `proprietor_name` or
                  // `first_nations_id` should be populated at a time.
                  if (values.proprietary_data_category !== 2 && option?.value === 2) {
                    resetField('proprietor_name');
                  }

                  setFieldValue('proprietary_data_category', option?.value);
                }}
                required={true}
              />
            </Grid>
            <Grid item xs={12}>
              {values.proprietary_data_category === 2 && (
                <AutocompleteField
                  id="first_nations_id"
                  name="first_nations_id"
                  label="Proprietor Name"
                  options={props.first_nations}
                  onChange={(event, option) => {
                    // Set the first nations id field for sending to the API
                    setFieldValue('first_nations_id', option?.value);
                    setFieldValue('proprietor_name', option?.label);
                  }}
                  required={true}
                />
              )}
              {values.proprietary_data_category !== 2 && (
                <CustomTextField
                  name="proprietor_name"
                  label="Proprietor Name"
                  other={{
                    required: true
                  }}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name="category_rationale"
                label="Category Rationale"
                other={{ multiline: true, required: true, rows: 4 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl
                required={true}
                component="fieldset"
                error={touched.data_sharing_agreement_required && Boolean(errors.data_sharing_agreement_required)}>
                <FormLabel component="legend" className={classes.legend}>
                  Data and Information Sharing Agreement (DISA)
                </FormLabel>
                <Typography>Do you require a data and information sharing agreement?</Typography>
                <Box mt={2}>
                  <RadioGroup
                    name="data_sharing_agreement_required"
                    aria-label="Data and Information Sharing Agreement"
                    value={values.data_sharing_agreement_required}
                    onChange={handleChange}>
                    <FormControlLabel value="false" control={<Radio required={true} color="primary" />} label="No" />
                    <FormControlLabel value="true" control={<Radio required={true} color="primary" />} label="Yes" />
                    <FormHelperText>{errors.data_sharing_agreement_required}</FormHelperText>
                  </RadioGroup>
                </Box>
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>
    </form>
  );
};

export default ProprietaryDataForm;
