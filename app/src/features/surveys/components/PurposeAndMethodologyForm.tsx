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
//import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
//import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IPurposeAndMethodologyForm {
  intended_outcome_id: number;
  additional_details: string;
  field_method_id: number;
  ecological_season_id: number;
  vantage_code_ids: number[];
}

export const PurposeAndMethodologyInitialValues: IPurposeAndMethodologyForm = {
  intended_outcome_id: ('' as unknown) as number,
  additional_details: '',
  field_method_id: ('' as unknown) as number,
  ecological_season_id: ('' as unknown) as number,
  vantage_code_ids: []
};

export const PurposeAndMethodologyYupSchema = yup.object().shape({
  field_method_id: yup.number().required('You must provide a field method'),
  additional_details: yup.string(),
  intended_outcome_id: yup.number().required('You must provide intended outcomes for the survey'),
  ecological_season_id: yup.number().required('You must provide an ecological season for the survey'),
  vantage_code_ids: yup.array().min(1, 'You must specify a focal species').required('Required')
});

export interface IPurposeAndMethodologyFormProps {
  intended_outcomes: IAutocompleteFieldOption<number>[];
  field_methods: IAutocompleteFieldOption<number>[];
  ecological_seasons: IAutocompleteFieldOption<number>[];
  vantage_codes: IAutocompleteFieldOption<number>[];
}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const PurposeAndMethologyForm: React.FC<IPurposeAndMethodologyFormProps> = (props) => {
  const formikProps = useFormikContext<IPurposeAndMethodologyForm>();

  return (
    <form>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box component="fieldset" mt={4}>
            <Typography component="legend">Purpose of Survey</Typography>
          </Box>
          <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
            <InputLabel id="intended_outcome_id-label">Intended Outcomes</InputLabel>
            <Select
              id="intended_outcome_id"
              name="intended_outcome_id"
              labelId="intended_outcome_id-label"
              label="Intended Outcomes"
              value={formikProps.values.intended_outcome_id}
              labelWidth={300}
              onChange={formikProps.handleChange}
              error={formikProps.touched.intended_outcome_id && Boolean(formikProps.errors.intended_outcome_id)}
              displayEmpty
              inputProps={{ 'aria-label': 'Intended Outcomes' }}>
              {props.intended_outcomes.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formikProps.touched.intended_outcome_id && formikProps.errors.intended_outcome_id}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField name="additional_details" label="Additional Details" other={{ multiline: true, rows: 2 }} />
        </Grid>
        <Grid item xs={12}>
          <Box component="fieldset" mt={4}>
            <Typography component="legend">Survey Methodology</Typography>
          </Box>
          <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
            <InputLabel id="field_method_id-label">Field Method</InputLabel>
            <Select
              id="field_method_id"
              name="field_method_id"
              labelId="field_method_id-label"
              label="Field Method"
              value={formikProps.values.field_method_id}
              labelWidth={300}
              onChange={formikProps.handleChange}
              error={formikProps.touched.field_method_id && Boolean(formikProps.errors.field_method_id)}
              displayEmpty
              inputProps={{ 'aria-label': 'Field Method' }}>
              {props.field_methods.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{formikProps.touched.field_method_id && formikProps.errors.field_method_id}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
            <InputLabel id="field_method_id-label">Ecological Season</InputLabel>
            <Select
              id="ecological_season_id"
              name="ecological_season_id"
              labelId="ecological_season_id-label"
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
            id="vantage_code_ids"
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
