import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import makeStyles from '@material-ui/core/styles/makeStyles';
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
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  },
  center: {
    alignSelf: 'center'
  },
  buttonPadding: {
    padding: 14
  },
  bottomSpacing: {
    paddingBottom: 14
  }
});

export interface IGeneralInformationForm {
  survey_name: string;
  start_date: string;
  end_date: string;
  focal_species: number[];
  ancillary_species: number[];
  survey_type: string;
  survey_purpose: string;
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
  survey_type: '',
  survey_purpose: '',
  biologist_first_name: '',
  biologist_last_name: '',
  permit_number: '',
  permit_type: '',
  funding_sources: []
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
    survey_type: yup.string().required('Required'),
    biologist_first_name: yup.string().required('Required'),
    biologist_last_name: yup.string().required('Required'),
    start_date: customYupRules?.start_date || yup.string().isValidDateString().required('Required'),
    end_date: customYupRules?.end_date || yup.string().isValidDateString().isEndDateAfterStartDate('start_date'),
    permit_number: yup.string().max(100, 'Cannot exceed 100 characters')
  });
};

export interface IGeneralInformationFormProps {
  species: IMultiAutocompleteFieldOption[];
  survey_types: IMultiAutocompleteFieldOption[];
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
  const classes = useStyles();

  const formikProps = useFormikContext<IGeneralInformationForm>();

  const [showAddPermitRow, setShowAddPermitRow] = useState<boolean>(false);

  const addNewPermitButton = () => {
    return (
      <Button
        className={classes.buttonPadding}
        type="button"
        variant="outlined"
        color="primary"
        aria-label="add-permit"
        onClick={() => {
          formikProps.setFieldValue('permit_number', '');
          formikProps.setFieldValue('permit_type', '');

          setShowAddPermitRow(true);
        }}>
        Add New Permit
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
        <StartEndDateFields
          formikProps={formikProps}
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
          <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
            <InputLabel id="survey_type-label">Survey Type</InputLabel>
            <Select
              id="survey_type"
              name="survey_type"
              labelId="survey_type-label"
              label="Survey Type"
              value={formikProps.values.survey_type}
              labelWidth={300}
              onChange={formikProps.handleChange}
              error={formikProps.touched.survey_type && Boolean(formikProps.errors.survey_type)}
              displayEmpty
              inputProps={{ 'aria-label': 'Survey Type' }}>
              {props.survey_types.map((item: any) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{formikProps.touched.survey_type && formikProps.errors.survey_type}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name="survey_purpose"
            label="Purpose of Survey"
            other={{ multiline: true, required: true, rows: 4 }}
          />
        </Grid>
        <Grid item xs={12}>
          <Box pt={2}>
            <Typography className={classes.bold}>Permit</Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          {props.permit_numbers.length > 0 && !showAddPermitRow && (
            <Grid container direction="row">
              <Grid item xs={12}>
                <Box display="flex">
                  <Box flexBasis="100%" pr={2}>
                    <AutocompleteField
                      id="permit_number"
                      name="permit_number"
                      label="Select Existing Permit"
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
                  <Typography className={classes.center} variant="body2">
                    OR
                  </Typography>
                  <Box flexBasis="50%" pl={2} className={classes.center}>
                    {addNewPermitButton()}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
          {props.permit_numbers.length === 0 && !showAddPermitRow && (
            <>
              <Typography variant="body2" className={classes.bottomSpacing}>
                You do not have any permits to select from for this survey, please add a new permit.
              </Typography>
              {addNewPermitButton()}
            </>
          )}
          {showAddPermitRow && (
            <Grid item xs={12}>
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
            </Grid>
          )}
        </Grid>
        <Grid item xs={12}>
          <Box pt={2}>
            <Typography className={classes.bold}>Funding Sources</Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id="funding_sources"
            label="Select Funding Sources"
            options={props.funding_sources}
            required={false}
          />
        </Grid>
        <Grid item xs={12}>
          <Box pt={2}>
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
