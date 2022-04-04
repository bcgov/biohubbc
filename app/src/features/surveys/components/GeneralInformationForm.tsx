import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import { getFormattedDate } from 'utils/Utils';
import yup from 'utils/YupSchema';
import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@material-ui/core/IconButton';

export interface IGeneralInformationForm {
  survey_name: string;
  start_date: string;
  end_date: string;
  focal_species: number[];
  ancillary_species: number[];
  survey_purpose: string;
  common_survey_methodology_id: number;
  biologist_first_name: string;
  biologist_last_name: string;
  permit_number: string;
  permit_type: string;
  funding_sources: number[];
}

export const GeneralInformationInitialValues: IGeneralInformationForm = {
  survey_name: '',
  start_date: '',
  end_date: '',
  focal_species: [],
  ancillary_species: [],
  survey_purpose: '',
  common_survey_methodology_id: ('' as unknown) as number,
  biologist_first_name: '',
  biologist_last_name: '',
  permit_number: '',
  permit_type: '',
  funding_sources: []
};

export const GeneralInformationYupSchema = (customYupRules?: any) => {
  return yup.object().shape({
    survey_name: yup.string().required('Required'),
    focal_species: yup.array().min(1, 'You must specify a focal species').required('Required'),
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
  funding_sources: IMultiAutocompleteFieldOption[];
  common_survey_methodologies: IAutocompleteFieldOption<number>[];
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

  const addNewPermitButton = () => {
    return (
      <Button
        variant="outlined"
        color="primary"
        startIcon={<Icon path={mdiPlus} size={1} />}
        aria-label="add-permit"
        onClick={() => {
          formikProps.setFieldValue('permit_number', '');
          formikProps.setFieldValue('permit_type', '');
          setShowAddPermitRow(true);
        }}>
        <strong>Add Permit</strong>
      </Button>
    );
  };

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
        {/* <Grid item xs={12}>
          <CustomTextField
            name="survey_purpose"
            label="Purpose of Survey"
            other={{ multiline: true, required: true, rows: 2 }}
          />
        </Grid> */}
        <StartEndDateFields
          formikProps={formikProps}
          startName="start_date"
          endName="end_date"
          startRequired={true}
          endRequired={false}
          startDateHelperText={`Start date must be on or after project start date ${getFormattedDate(
            DATE_FORMAT.ShortMediumDateFormat,
            props.projectStartDate
          )}`}
          endDateHelperText={
            props.projectEndDate &&
            `End date must be on or before project end date ${getFormattedDate(
              DATE_FORMAT.ShortMediumDateFormat,
              props.projectEndDate
            )}`
          }
        />

        <Grid item xs={12}>
          <Typography component="legend">Species</Typography>
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
      </Grid>

      <Box component="fieldset" mt={4}>
        <Typography component="legend">Lead Biologist</Typography>
        <Grid container spacing={2}>
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
      </Box>

      <Box component="fieldset" mt={4}>
        <Typography component="legend">Permits</Typography>

        {props.permit_numbers.length > 0 && !showAddPermitRow && (
          <>
            <Typography variant="body1">
              If a permit is required for this survey, select a permit or add new one.
            </Typography>
            <Box mt={2} display="flex" alignItems="center">
              <Box flex="1 1 auto">
                <AutocompleteField
                  id="permit_number"
                  name="permit_number"
                  label="Select Permit"
                  options={props.permit_numbers}
                  onChange={(event, option) => {
                    if (!option) {
                      formikProps.setFieldValue('permit_number', '');
                    } else {
                      formikProps.setFieldValue('permit_number', option.value);
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
            <Typography variant="body1">Add a permit if one is required for this survey.</Typography>
            <Box mt={2}>{addNewPermitButton()}</Box>
          </>
        )}

        {showAddPermitRow && (
          <Box display="flex">
            <Box flexBasis="50%" pr={1}>
              <CustomTextField
                name="permit_number"
                label="Permit Number"
                other={{
                  required: false,
                  value: formikProps.values.permit_number,
                  error: formikProps.touched.permit_number && Boolean(formikProps.errors.permit_number),
                  helperText: formikProps.touched.permit_number && formikProps.errors.permit_number
                }}
              />
            </Box>
            <Box flexBasis="50%" pl={1}>
              <FormControl variant="outlined" required={false} style={{ width: '100%' }}>
                <InputLabel id="permit_type">Permit Type</InputLabel>
                <Select
                  id="permit_type"
                  name="permit_type"
                  labelId="permit_type"
                  label="Permit Type"
                  value={formikProps.values.permit_type}
                  onChange={formikProps.handleChange}
                  error={formikProps.touched.permit_type && Boolean(formikProps.errors.permit_type)}
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
                <FormHelperText>{formikProps.touched.permit_type && formikProps.errors.permit_type}</FormHelperText>
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

      <Box component="fieldset" mt={4}>
        <Typography component="legend">Funding Sources</Typography>
        <MultiAutocompleteFieldVariableSize
          id="funding_sources"
          label="Select Funding Sources"
          options={props.funding_sources}
          required={false}
        />
      </Box>
    </form>
  );
};

export default GeneralInformationForm;
