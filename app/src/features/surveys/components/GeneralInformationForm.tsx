import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import SpeciesAutocompleteField from 'components/fields/SpeciesAutocompleteField';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useFormikContext } from 'formik';
import React from 'react';
import { getFormattedDate } from 'utils/Utils';
import yup from 'utils/YupSchema';
import SurveyPermitForm, { SurveyPermitFormYupSchema } from '../SurveyPermitForm';

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
  species: {
    focal_species: number[];
    ancillary_species: number[];
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
  species: {
    focal_species: [],
    ancillary_species: []
  },
  permit: {
    permits: []
  }
};

export const GeneralInformationYupSchema = (customYupRules?: any) => {
  return yup
    .object()
    .shape({
      survey_details: yup.object().shape({
        survey_name: yup.string().required('Survey Name is Required'),
        start_date: customYupRules?.start_date || yup.string().isValidDateString().required('Start Date is Required'),
        end_date:
          customYupRules?.end_date || yup.string().isValidDateString().isEndDateSameOrAfterStartDate('start_date'),
        survey_types: yup
          .array(yup.number())
          .min(1, 'One or more Types are required')
          .required('One or more Types are required')
      }),
      species: yup.object().shape({
        focal_species: yup.array().min(1, 'You must specify a focal species').required('Required'),
        ancillary_species: yup.array().isUniqueFocalAncillarySpecies('Focal and Ancillary species must be unique')
      })
    })
    .concat(SurveyPermitFormYupSchema);
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
        <Grid item xs={12}>
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

      <Box component="fieldset" mt={5}>
        <Typography component="legend" variant="h5">
          Species
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SpeciesAutocompleteField formikFieldName="species.focal_species" label="Focal Species" required={true} />
          </Grid>
          <Grid item xs={12}>
            <SpeciesAutocompleteField
              formikFieldName="species.ancillary_species"
              label="Ancillary Species"
              required={false}
            />
          </Grid>
        </Grid>
      </Box>

      <Box component="fieldset" mt={5}>
        <Typography component="legend" variant="h5">
          Permits
        </Typography>
        <Box>
          <SurveyPermitForm />
        </Box>
      </Box>
    </>
  );
};

export default GeneralInformationForm;
