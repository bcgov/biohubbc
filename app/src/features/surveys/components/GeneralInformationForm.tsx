import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
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
  permit_number: string;
}

export const GeneralInformationInitialValues: IGeneralInformationForm = {
  survey_name: '',
  start_date: '',
  end_date: '',
  focal_species: [],
  ancillary_species: [],
  survey_purpose: '',
  biologist_first_name: '',
  biologist_last_name: '',
  permit_number: ''
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
    end_date: customYupRules?.end_date || yup.string().isValidDateString().isEndDateAfterStartDate('start_date'),
    permit_number: yup.string().max(100, 'Cannot exceed 100 characters')
  });
};

export interface IGeneralInformationFormProps {
  species: IMultiAutocompleteFieldOption[];
  permit_numbers: IAutocompleteFieldOption<string>[];
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

  const [permitNumberOptions, setPermitNumberOptions] = useState<IAutocompleteFieldOption<string>[]>([]);

  useEffect(() => {
    console.log(props.permit_numbers);
    console.log(formikProps.values);
    const result = props.permit_numbers;

    if (formikProps.values.permit_number) {
      setPermitNumberOptions(
        result.concat([{ value: formikProps.values.permit_number, label: formikProps.values.permit_number }])
      );
    } else {
      setPermitNumberOptions(result);
    }
  }, [props.permit_numbers]);

  console.log(formikProps.values.permit_number);

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
          <CustomTextField
            name="survey_purpose"
            label="Purpose of Survey"
            other={{ multiline: true, required: true, rows: 4 }}
          />
        </Grid>
        <Grid item xs={12}>
          {permitNumberOptions.length > 0 && (
            <AutocompleteField
              id="permit_number"
              name="permit_number"
              label="Permit Number"
              options={permitNumberOptions}
              onChange={(event, option) => {
                console.log(option);
                if (!option) {
                  formikProps.setFieldValue('permit_number', '');
                } else {
                  formikProps.setFieldValue('permit_number', option.value);
                }
              }}
            />
          )}
          {permitNumberOptions.length === 0 && (
            <Typography variant="body2">
              This survey will not have an associated permit number because you do not have any permits to select from.
              All permits have been used by surveys, please add another project permit or change an existing survey
              permit.
            </Typography>
          )}
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
