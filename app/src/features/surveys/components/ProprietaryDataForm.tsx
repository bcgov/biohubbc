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
import TextField from '@material-ui/core/TextField';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

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
  category_rational: string;
  survey_data_proprietary: string;
  data_sharing_agreement_required: string;
}

export const ProprietaryDataInitialValues: IProprietaryDataForm = {
  proprietary_data_category: ('' as unknown) as number,
  proprietor_name: '',
  first_nations_id: (null as unknown) as number,
  category_rational: '',
  survey_data_proprietary: 'false',
  data_sharing_agreement_required: 'false'
};

export const ProprietaryDataYupSchema = yup.object().shape({
  proprietary_data_category: yup
    .number()
    .when('survey_data_proprietary', { is: 'true', then: yup.number().required('Required') }),
  proprietor_name: yup
    .string()
    .when('survey_data_proprietary', { is: 'true', then: yup.string().required('Required') }),
  category_rational: yup
    .string()
    .max(3000, 'Cannot exceed 3000 characters')
    .when('survey_data_proprietary', {
      is: 'true',
      then: yup.string().required('You must provide a category rational for the survey')
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

  const { values, touched, errors, handleChange, setFieldValue } = useFormikContext<IProprietaryDataForm>();

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
                onChange={handleChange}>
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
                  setFieldValue('proprietary_data_category', option?.value);

                  // Need to reset proprietor name if user changes category from first nations to something else
                  // because the name will now be freeform text
                  if (values.proprietary_data_category === 2 && option?.value !== 2) {
                    setFieldValue('proprietor_name', '');
                  }
                }}
                required={true}
              />
            </Grid>
            <Grid item xs={12}>
              {values.proprietary_data_category === 2 && (
                <AutocompleteField
                  id="proprietor_name"
                  name="proprietor_name"
                  label="Proprietor Name"
                  options={props.first_nations}
                  onChange={(event, option) => {
                    // Set the first nations id field instead of the proprietor name field for sending to the API
                    setFieldValue('first_nations_id', option?.value);
                  }}
                  required={true}
                />
              )}
              {values.proprietary_data_category !== 2 && (
                <TextField
                  fullWidth
                  required={true}
                  id="proprietor_name"
                  name="proprietor_name"
                  label="Proprietor Name"
                  variant="outlined"
                  value={values.proprietor_name}
                  onChange={handleChange}
                  error={touched.proprietor_name && Boolean(errors.proprietor_name)}
                  helperText={touched.proprietor_name && errors.proprietor_name}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="category_rational"
                name="category_rational"
                label="Category Rational"
                multiline
                required={true}
                rows={4}
                fullWidth
                variant="outlined"
                value={values.category_rational}
                onChange={handleChange}
                error={touched.category_rational && Boolean(errors.category_rational)}
                helperText={touched.category_rational && errors.category_rational}
              />
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <FormControl
            required={true}
            component="fieldset"
            error={touched.data_sharing_agreement_required && Boolean(errors.data_sharing_agreement_required)}>
            <FormLabel component="legend" className={classes.legend}>
              Data Sharing Agreement (DISA)
            </FormLabel>
            <Typography>Do you require a data sharing agreement?</Typography>
            <Box mt={2}>
              <RadioGroup
                name="data_sharing_agreement_required"
                aria-label="Data Sharing Agreement"
                value={values.data_sharing_agreement_required}
                onChange={handleChange}>
                <FormControlLabel value="false" control={<Radio required={true} color="primary" />} label="No" />
                <FormControlLabel value="true" control={<Radio required={true} color="primary" />} label="Yes" />
                <FormHelperText>{errors.data_sharing_agreement_required}</FormHelperText>
              </RadioGroup>
            </Box>
          </FormControl>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProprietaryDataForm;
