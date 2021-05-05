import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Typography from '@material-ui/core/Typography';
import AutocompleteField from 'components/fields/AutocompleteField';
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
  proprietary_data_category: string;
  proprietor_name: string;
  category_rational: string;
  survey_data_proprietary: string;
  data_sharing_agreement_required: string;
}

export const ProprietaryDataInitialValues: IProprietaryDataForm = {
  proprietary_data_category: '',
  proprietor_name: '',
  category_rational: '',
  survey_data_proprietary: 'false',
  data_sharing_agreement_required: 'false'
};

export const ProprietaryDataYupSchema = yup.object().shape({
  proprietary_data_category: yup.string().required('Required'),
  proprietor_name: yup.string().required('Required'),
  category_rational: yup
    .string()
    .max(3000, 'Cannot exceed 3000 characters')
    .required('You must provide a category rational for the survey'),
  survey_data_proprietary: yup.string().required('Required'),
  data_sharing_agreement_required: yup.string().required('Required')
});

export interface IProprietaryDataFormProps {
  proprietary_data_category: string[];
}

/**
 * Create survey - proprietary data fields
 *
 * @return {*}
 */
const ProprietaryDataForm: React.FC<IProprietaryDataFormProps> = (props) => {
  const classes = useStyles();

  const { values, touched, errors, handleChange } = useFormikContext<IProprietaryDataForm>();

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
        <Grid item xs={12}>
          <Typography className={classes.bold}>Proprietary Information</Typography>
        </Grid>
        <Grid item xs={12}>
          <AutocompleteField
            id="proprietary_data_category"
            name="Proprietary Data Category"
            label="Proprietary Data Category"
            value={values.proprietary_data_category}
            options={props.proprietary_data_category}
            required={true}
          />
        </Grid>
        <Grid item xs={12}>
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
