import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import ComponentDialog from 'components/dialog/ComponentDialog';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { get } from 'lodash-es';
import React, { useState } from 'react';
import { StringBoolean } from 'types/misc';
import yup from 'utils/YupSchema';

const useStyles = makeStyles(() => ({
  alignCenter: {
    display: 'flex',
    alignItems: 'center'
  },
  learnMoreBtn: {
    textDecoration: 'underline',
    lineHeight: 'auto',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  dialogText: {
    maxWidth: '72ch'
  }
}));

export interface IProprietaryDataForm {
  proprietor: {
    survey_data_proprietary: StringBoolean;
    proprietary_data_category: number;
    proprietor_name: string;
    first_nations_id: number;
    category_rationale: string;
    disa_required: StringBoolean;
  };
}

export const ProprietaryDataInitialValues: IProprietaryDataForm = {
  proprietor: {
    survey_data_proprietary: 'false',
    proprietary_data_category: 0,
    proprietor_name: '',
    first_nations_id: 0,
    category_rationale: '',
    disa_required: 'false'
  }
};

export const ProprietaryDataYupSchema = yup.object().shape({
  proprietor: yup.object().shape({
    survey_data_proprietary: yup.string().required('Required'),
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
    disa_required: yup.string().when('survey_data_proprietary', { is: 'true', then: yup.string().required('Required') })
  })
});

export interface IProprietaryDataCategoryOption<T extends string | number> extends IAutocompleteFieldOption<T> {
  is_first_nation: boolean;
}

export interface IProprietaryDataFormProps {
  proprietary_data_category: IProprietaryDataCategoryOption<number>[];
  first_nations: IAutocompleteFieldOption<number>[];
}

/**
 * Create survey - proprietary data fields
 *
 * @return {*}
 */
const ProprietaryDataForm: React.FC<IProprietaryDataFormProps> = (props) => {
  const [openDialog, setOpenDialog] = useState(false);
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
    setFieldValue(name, get(ProprietaryDataInitialValues, name));
    setFieldTouched(name, false);
    setFieldError(name, undefined);
  };

  const isProprietaryDataCategoryAFirstNation = (proprietaryDataCategoryId: number | string | undefined): boolean => {
    return !!props.proprietary_data_category.find(
      (item) => item.value === proprietaryDataCategoryId && item.is_first_nation
    );
  };

  return (
    <>
      <form>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl
              component="fieldset"
              error={
                touched.proprietor?.survey_data_proprietary && Boolean(errors.proprietor?.survey_data_proprietary)
              }>
              <Typography variant="body1" className={classes.alignCenter}>
                <span>Is the data captured in this survey proprietary?</span>
                <Button
                  color="primary"
                  className={classes.learnMoreBtn}
                  data-testid="prop-dialog-btn"
                  onClick={() => setOpenDialog(true)}>
                  <Typography component="span">Learn more</Typography>
                </Button>
              </Typography>
              <Box mt={2}>
                <RadioGroup
                  name="proprietor.survey_data_proprietary"
                  aria-label="Survey Data Proprietary"
                  value={values.proprietor?.survey_data_proprietary}
                  onChange={(event) => {
                    // If radio button is toggled to `false`, reset the now hidden form fields
                    if (event.target.value === 'false') {
                      resetField('proprietor.proprietary_data_category');
                      resetField('proprietor.first_nations_id');
                      resetField('proprietor.proprietor_name');
                      resetField('proprietor.category_rationale');
                      resetField('proprietor.disa_required');
                    }
                    handleChange(event);
                  }}>
                  <FormControlLabel value="false" control={<Radio required={true} color="primary" />} label="No" />
                  <FormControlLabel value="true" control={<Radio required={true} color="primary" />} label="Yes" />
                  <FormHelperText>{errors.proprietor?.survey_data_proprietary}</FormHelperText>
                </RadioGroup>
              </Box>
            </FormControl>
          </Grid>
          {values.proprietor?.survey_data_proprietary === 'true' && (
            <>
              <Grid item xs={12}>
                <Typography>Proprietary Information</Typography>
              </Grid>
              <Grid item xs={12}>
                <AutocompleteField
                  id="proprietary_data_category"
                  name="proprietor.proprietary_data_category"
                  label="Proprietary Data Category"
                  options={props.proprietary_data_category}
                  onChange={(event, option) => {
                    // Reset proprietor_name and first_nations_id if user changes proprietary_data_category from
                    // `First Nations Land` to any other option. This is because the `First Nations Land` category is
                    // based on a dropdown, where as the other options are free-text and only one of `proprietor_name` or
                    // `first_nations_id` should be populated at a time.
                    if (
                      isProprietaryDataCategoryAFirstNation(values.proprietor?.proprietary_data_category) &&
                      !isProprietaryDataCategoryAFirstNation(option?.value)
                    ) {
                      resetField('proprietor.first_nations_id');
                      resetField('proprietor.proprietor_name');
                    }

                    // Reset proprietor_name if user changes proprietary_data_category from any other option to
                    // `First Nations Land`. This is because the other options are free-text, where as the
                    // `First Nations Land` category is based on a dropdown, and only one of `proprietor_name` or
                    // `first_nations_id` should be populated at a time.
                    if (
                      !isProprietaryDataCategoryAFirstNation(values.proprietor?.proprietary_data_category) &&
                      isProprietaryDataCategoryAFirstNation(option?.value)
                    ) {
                      resetField('proprietor.proprietor_name');
                    }

                    setFieldValue('proprietor.proprietary_data_category', option?.value);
                  }}
                  required={true}
                />
              </Grid>
              <Grid item xs={12}>
                {isProprietaryDataCategoryAFirstNation(values.proprietor?.proprietary_data_category) && (
                  <AutocompleteField
                    id="first_nations_id"
                    name="proprietor.first_nations_id"
                    label="Proprietor Name"
                    options={props.first_nations}
                    onChange={(event, option) => {
                      // Set the first nations id field for sending to the API
                      setFieldValue('proprietor.first_nations_id', option?.value);
                      setFieldValue('proprietor.proprietor_name', option?.label);
                    }}
                    required={true}
                  />
                )}
                {!isProprietaryDataCategoryAFirstNation(values.proprietor?.proprietary_data_category) && (
                  <CustomTextField
                    name="proprietor.proprietor_name"
                    label="Proprietor Name"
                    other={{
                      required: true
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name="proprietor.category_rationale"
                  label="Category Rationale"
                  other={{ multiline: true, required: true, rows: 4 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl
                  required={true}
                  component="fieldset"
                  error={touched.proprietor?.disa_required && Boolean(errors.proprietor?.disa_required)}>
                  <Typography component="legend">Data and Information Sharing Agreement (DISA)</Typography>
                  <Typography>Do you require a data and information sharing agreement?</Typography>
                  <Box mt={2}>
                    <RadioGroup
                      name="proprietor.disa_required"
                      aria-label="Data and Information Sharing Agreement"
                      value={values.proprietor?.disa_required}
                      onChange={handleChange}>
                      <FormControlLabel value="false" control={<Radio required={true} color="primary" />} label="No" />
                      <FormControlLabel value="true" control={<Radio required={true} color="primary" />} label="Yes" />
                      <FormHelperText>{errors.proprietor?.disa_required}</FormHelperText>
                    </RadioGroup>
                  </Box>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </form>

      <ComponentDialog open={openDialog} dialogTitle="Proprietary Data" onClose={() => setOpenDialog(false)}>
        <Typography variant="body1">
          Proprietary data is information and data that has been collected under the following conditions:
          <ul>
            <li>
              Collection required access to private or First Nations lands, and the landowner has specified that the
              collected information is not to be distributed <em>OR</em>
            </li>
            <li>
              The data or information collected is restricted on a time-limited basis (e.g., the data owner is awaiting
              publication or awaiting permit approval).
            </li>
          </ul>
          <Alert severity="warning">
            The Province of British Columbia will not retroactively secure data and information for proprietary reasons.
          </Alert>
        </Typography>
      </ComponentDialog>
    </>
  );
};

export default ProprietaryDataForm;
