import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { debounce } from 'lodash-es';
import React, { useCallback, useState } from 'react';
import { getFormattedDate } from 'utils/Utils';
import yup from 'utils/YupSchema';

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
    permit_number: string;
    permit_type: string;
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
    permit_number: '',
    permit_type: ''
  },
  funding: {
    funding_sources: []
  }
};

export const GeneralInformationYupSchema = (customYupRules?: any) => {
  return yup.object().shape({
    survey_details: yup.object().shape({
      survey_name: yup.string().required('Survey Name is Required'),
      biologist_first_name: yup.string().required('First Name is Required'),
      biologist_last_name: yup.string().required('Last Name is Required'),
      start_date: customYupRules?.start_date || yup.string().isValidDateString().required('Start Date is Required'),
      end_date: customYupRules?.end_date || yup.string().isValidDateString().isEndDateSameOrAfterStartDate('start_date')
    }),
    species: yup.object().shape({
      focal_species: yup.array().min(1, 'One or more Focal Species are Required').required('Required'),
      ancillary_species: yup.array().isUniqueFocalAncillarySpecies('Focal and Ancillary Species Must be Unique')
    }),
    permit: yup.object().shape({
      permit_number: yup.string().max(100, 'Cannot exceed 100 characters')
    })
  });
};

export interface IGeneralInformationFormProps {
  permit_numbers: IAutocompleteFieldOption<string>[];
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
  const [showAddPermitRow, setShowAddPermitRow] = useState<boolean>(false);

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

  const addNewPermitButton = () => {
    return (
      <Button
        variant="outlined"
        color="primary"
        startIcon={<Icon path={mdiPlus} size={1} />}
        aria-label="add-permit"
        onClick={() => {
          formikProps.setFieldValue('permit.permit_number', '');
          formikProps.setFieldValue('permit.permit_type', '');
          setShowAddPermitRow(true);
        }}>
        Add Permit
      </Button>
    );
  };

  return (
    <form>
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

        {props.permit_numbers.length > 0 && !showAddPermitRow && (
          <>
            <Typography variant="body1">
              If a permit is required for this survey, select a permit or add new one.
            </Typography>
            <Box mt={2} display="flex" alignItems="center">
              <Box flex="1 1 auto">
                <AutocompleteField
                  id="permit_number"
                  name="permit.permit_number"
                  label="Select Permit"
                  options={props.permit_numbers}
                  onChange={(event, option) => {
                    if (!option) {
                      formikProps.setFieldValue('permit.permit_number', '');
                    } else {
                      formikProps.setFieldValue('permit.permit_number', option.value);
                    }
                  }}
                />
              </Box>
              <Box mx={2}>
                <Typography variant="body1">OR</Typography>
              </Box>
              <Box flex="0 0 auto">{addNewPermitButton()}</Box>
            </Box>
          </>
        )}

        {props.permit_numbers.length === 0 && !showAddPermitRow && (
          <>
            <Typography variant="body1" color="textSecondary">
              Add a permit if one is required for this survey.
            </Typography>
            <Box mt={3}>{addNewPermitButton()}</Box>
          </>
        )}

        {showAddPermitRow && (
          <Box display="flex">
            <Box flexBasis="50%" pr={1}>
              <CustomTextField
                name="permit.permit_number"
                label="Permit Number"
                other={{
                  required: false,
                  value: formikProps.values.permit.permit_number,
                  error: formikProps.touched.permit?.permit_number && Boolean(formikProps.errors.permit?.permit_number),
                  helperText: formikProps.touched.permit?.permit_number && formikProps.errors.permit?.permit_number
                }}
              />
            </Box>
            <Box flexBasis="50%" pl={1}>
              <FormControl variant="outlined" required={false} style={{ width: '100%' }}>
                <InputLabel id="permit_type">Permit Type</InputLabel>
                <Select
                  id="permit_type"
                  name="permit.permit_type"
                  labelId="permit_type"
                  label="Permit Type"
                  value={formikProps.values.permit.permit_type}
                  onChange={formikProps.handleChange}
                  error={formikProps.touched.permit?.permit_type && Boolean(formikProps.errors.permit?.permit_type)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Permit Type' }}>
                  <MenuItem key={1} value="Park Use Permit">
                    Park Use Permit
                  </MenuItem>
                  <MenuItem key={2} value="Wildlife Permit - General">
                    Wildlife Permit - General
                  </MenuItem>
                  <MenuItem key={3} value="Scientific Fish Collection Permit">
                    Scientific Fish Collection Permit
                  </MenuItem>
                </Select>
                <FormHelperText>
                  {formikProps.touched.permit?.permit_type && formikProps.errors.permit?.permit_type}
                </FormHelperText>
              </FormControl>
            </Box>
            <Box pt={0.5} pl={1}>
              <IconButton
                color="primary"
                data-testid="delete-icon"
                aria-label="remove-permit"
                onClick={() => setShowAddPermitRow(false)}>
                <Icon path={mdiTrashCanOutline} size={1} />
              </IconButton>
            </Box>
          </Box>
        )}
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
    </form>
  );
};

export default GeneralInformationForm;
