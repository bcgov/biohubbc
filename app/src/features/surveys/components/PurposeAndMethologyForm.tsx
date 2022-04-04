//import Box from '@material-ui/core/Box';
import { Box, Typography } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
//import Typography from '@material-ui/core/Typography';
import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
//import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
//import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IPurposeAndMethologyForm {
  intended_outcomes_id: number;
  additional_details: string;
  common_survey_methodology_id: number;
  ecological_season_id: number;
  vantage_code_id: number;
}

export const PurposeAndMethodologyInitialValues: IPurposeAndMethologyForm = {
  intended_outcomes_id: ('' as unknown) as number,
  additional_details: '',
  common_survey_methodology_id: ('' as unknown) as number,
  ecological_season_id: ('' as unknown) as number,
  vantage_code_id: ('' as unknown) as number
};

export const GeneralInformationYupSchema = (customYupRules?: any) => {
  return yup.object().shape({
    additional_details: yup.string(),
    intended_outcome: yup
      .string()
      .max(3000, 'Cannot exceed 3000 characters')
      .required('You must provide a purpose for the survey'),
    ecological_season: yup
      .string()
      .max(3000, 'Cannot exceed 3000 characters')
      .required('You must provide a purpose for the survey'),
    vantage_code: yup
      .string()
      .max(3000, 'Cannot exceed 3000 characters')
      .required('You must provide a purpose for the survey')
  });
};

export interface IPurposeAndMethodologyFormProps {
  intended_outcomes: IAutocompleteFieldOption<number>[];
  common_survey_methodologies: IAutocompleteFieldOption<number>[];
  ecological_seasons: IAutocompleteFieldOption<number>[];
  vantage_codes: IAutocompleteFieldOption<number>[];
}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const PurposeAndMethologyForm: React.FC<IPurposeAndMethodologyFormProps> = (props) => {
  const formikProps = useFormikContext<IPurposeAndMethologyForm>();

  return (
    <form>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box component="fieldset" mt={4}>
            <Typography component="legend">Purpose of Survey</Typography>
          </Box>
          <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
            <InputLabel id="intended_outcomes_id-label">Intended Outcomes</InputLabel>
            <Select
              id="intended_outcomes_id"
              name="intended_outcomes_id"
              labelId="intended_outcomes_id-label"
              label="Intended Outcomes"
              value={formikProps.values.intended_outcomes_id}
              labelWidth={300}
              onChange={formikProps.handleChange}
              error={formikProps.touched.intended_outcomes_id && Boolean(formikProps.errors.intended_outcomes_id)}
              displayEmpty
              inputProps={{ 'aria-label': 'Intended Outcomes' }}>
              {props.intended_outcomes.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formikProps.touched.intended_outcomes_id && formikProps.errors.intended_outcomes_id}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name="additional_details"
            label="Additional Details"
            other={{ multiline: true, required: true, rows: 2 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box component="fieldset" mt={4}>
            <Typography component="legend">Survey Methodology</Typography>
          </Box>
          <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
            <InputLabel id="field_methods_id-label">Field Method</InputLabel>
            <Select
              id="field_methods_id"
              name="field_methods_id"
              labelId="field_methods_id-label"
              label="Field Method"
              value={formikProps.values.common_survey_methodology_id}
              labelWidth={300}
              onChange={formikProps.handleChange}
              error={
                formikProps.touched.common_survey_methodology_id &&
                Boolean(formikProps.errors.common_survey_methodology_id)
              }
              displayEmpty
              inputProps={{ 'aria-label': 'Field Method' }}>
              {props.common_survey_methodologies.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formikProps.touched.common_survey_methodology_id && formikProps.errors.common_survey_methodology_id}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
            <InputLabel id="field_methods_id-label">Ecological Season</InputLabel>
            <Select
              id="ecological_season_id"
              name="ecological_seasons_id"
              labelId="ecological_seasons_id-label"
              label="Ecological Season"
              value={formikProps.values.ecological_season_id}
              labelWidth={300}
              onChange={formikProps.handleChange}
              error={formikProps.touched.ecological_season_id && Boolean(formikProps.errors.ecological_season_id)}
              displayEmpty
              inputProps={{ 'aria-label': 'Ecological Season' }}>
              {props.ecological_seasons.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formikProps.touched.ecological_season_id && formikProps.errors.ecological_season_id}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id="vantage_codes"
            label="Vantage Code"
            options={props.vantage_codes}
            required={true}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default PurposeAndMethologyForm;
