import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { debounce } from 'lodash-es';
import React, { useCallback } from 'react';
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
    biologist_first_name: string;
    biologist_last_name: string;
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
  funding: {
    funding_sources: number[];
  };
}

export const GeneralInformationInitialValues: IGeneralInformationForm = {
  survey_details: {
    survey_name: '',
    start_date: '',
    end_date: '',
    biologist_first_name: '',
    biologist_last_name: ''
  },
  species: {
    focal_species: [],
    ancillary_species: []
  },
  permit: {
    permits: []
  },
  funding: {
    funding_sources: []
  }
};

export const GeneralInformationYupSchema = (customYupRules?: any) => {
  return yup
    .object()
    .shape({
      survey_details: yup.object().shape({
        survey_name: yup.string().required('Survey Name is Required'),
        biologist_first_name: yup.string().required('First Name is Required'),
        biologist_last_name: yup.string().required('Last Name is Required'),
        start_date: customYupRules?.start_date || yup.string().isValidDateString().required('Start Date is Required'),
        end_date:
          customYupRules?.end_date || yup.string().isValidDateString().isEndDateSameOrAfterStartDate('start_date')
      }),
      species: yup.object().shape({
        focal_species: yup.array().min(1, 'You must specify a focal species').required('Required'),
        ancillary_species: yup.array().isUniqueFocalAncillarySpecies('Focal and Ancillary species must be unique')
      })
    })
    .concat(SurveyPermitFormYupSchema);
};

export interface IGeneralInformationFormProps {
  funding_sources: IMultiAutocompleteFieldOption[];
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

  const biohubApi = useBiohubApi();

  const convertOptions = (value: any): IMultiAutocompleteFieldOption[] =>
    value.map((item: any) => {
      return { value: parseInt(item.id), label: item.label };
    });

  const handleGetInitList = async (initialvalues: number[]) => {
    const response = await biohubApi.taxonomy.getSpeciesFromIds(initialvalues);

    return convertOptions(response.searchResponse);
  };

  const handleSearch = useCallback(
    debounce(
      async (
        inputValue: string,
        existingValues: (string | number)[],
        callback: (searchedValues: IMultiAutocompleteFieldOption[]) => void
      ) => {
        const response = await biohubApi.taxonomy.searchSpecies(inputValue);
        const newOptions = convertOptions(response.searchResponse).filter(
          (item: any) => !existingValues?.includes(item.value)
        );
        callback(newOptions);
      },
      500
    ),
    []
  );

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
            <MultiAutocompleteFieldVariableSize
              id="species.focal_species"
              label="Focal Species"
              required={true}
              type="api-search"
              getInitList={handleGetInitList}
              search={handleSearch}
            />
          </Grid>
          <Grid item xs={12}>
            <MultiAutocompleteFieldVariableSize
              id="species.ancillary_species"
              label="Ancillary Species"
              required={false}
              type="api-search"
              getInitList={handleGetInitList}
              search={handleSearch}
            />
          </Grid>
        </Grid>
      </Box>

      <Box component="fieldset" mt={5}>
        <Typography component="legend" variant="h5">
          Lead Biologist
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <CustomTextField
              name="survey_details.biologist_first_name"
              label="First Name"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField
              name="survey_details.biologist_last_name"
              label="Last Name"
              other={{
                required: true
              }}
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

      <Box component="fieldset" mt={5}>
        <Typography component="legend" variant="h5">
          Funding Sources
        </Typography>
        <MultiAutocompleteFieldVariableSize
          id="funding.funding_sources"
          label="Select Funding Sources"
          options={props.funding_sources}
          required={false}
        />
      </Box>
    </>
  );
};

export default GeneralInformationForm;
