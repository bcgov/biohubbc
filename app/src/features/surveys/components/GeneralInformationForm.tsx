import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useFormikContext } from 'formik';
import React from 'react';
import { getFormattedDate } from 'utils/Utils';
import yup from 'utils/YupSchema';

export const AddPermitFormInitialValues = {
  permits: [
    {
      permit_number: '',
      permit_type: ''
    }
  ]
};

export const AddPermitsFormYupSchema = yup.object().shape({
  permits: yup.array().of(
    yup.object().shape({
      permit_number: yup.string().required('Permit number is required'),
      permit_type: yup.string().required('Permit type is required')
    })
  )
});

export interface IGeneralInformationForm {
  survey_details: {
    survey_name: string;
    start_date: string;
    end_date: string;
    survey_types: number[];
  };
  permit: {
    permits: {
      permit_id?: number;
      permit_number: string;
      permit_type: string;
    }[];
  };
}

export const GeneralInformationInitialValues: IGeneralInformationForm = {
  survey_details: {
    survey_name: '',
    start_date: '',
    end_date: '',
    survey_types: []
  },
  permit: {
    permits: []
  }
};

export const GeneralInformationYupSchema = (customYupRules?: any) => {
  return yup.object().shape({
    survey_details: yup.object().shape({
      survey_name: yup.string().required('Survey Name is Required'),
      start_date: customYupRules?.start_date || yup.string().isValidDateString().required('Start Date is Required'),
      end_date:
        customYupRules?.end_date || yup.string().isValidDateString().isEndDateSameOrAfterStartDate('start_date'),
      survey_types: yup
        .array(yup.number())
        .min(1, 'One or more Types are required')
        .required('One or more Types are required')
    })
  });
};

export interface IGeneralInformationFormProps {
  type: IMultiAutocompleteFieldOption[];
  projectStartDate: string;
  projectEndDate: string;
}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const GeneralInformationForm: React.FC<IGeneralInformationFormProps> = (props) => {
  const formikProps = useFormikContext<IGeneralInformationForm>();

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextField
            name="survey_details.survey_name"
            label="Survey Name"
            other={{
              required: true
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id={'survey_details.survey_types'}
            label={'Type'}
            options={props.type}
            required={true}
          />
        </Grid>
      </Grid>

      <Box component="fieldset" mt={5}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography component="legend" variant="h5">
              Timeline
            </Typography>
            <StartEndDateFields
              formikProps={formikProps}
              startName="survey_details.start_date"
              endName="survey_details.end_date"
              startRequired={true}
              endRequired={false}
              startDateHelperText={`Start Date cannot precede ${getFormattedDate(
                DATE_FORMAT.ShortMediumDateFormat,
                props.projectStartDate
              )}`}
              endDateHelperText={
                props.projectEndDate &&
                `End Date cannot come after the Project End Date ${getFormattedDate(
                  DATE_FORMAT.ShortMediumDateFormat,
                  props.projectEndDate
                )}`
              }
            />
          </Grid>
        </Grid>
      </Box>

      <Box component="fieldset" mt={5}>
        <Typography component="legend" variant="h5">
          Status
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl variant="outlined" fullWidth required={true}>
              <InputLabel id="permit_type">Status</InputLabel>
              <Select
                id={`survey-status`}
                name={`survey-status`}
                labelId="survey_status"
                label="Survey Status"
                displayEmpty
                inputProps={{ 'aria-label': 'Survey Status' }}>
                <MenuItem key={1} value="Planning">
                  Planning
                </MenuItem>
                <MenuItem key={2} value="In progress">
                  In progress
                </MenuItem>
                <MenuItem key={3} value="Completed">
                  Completed
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default GeneralInformationForm;
