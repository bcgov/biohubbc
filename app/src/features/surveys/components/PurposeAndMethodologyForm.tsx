import { Box, createMuiTheme, ListItemText, Typography, Divider } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';
import { ThemeProvider } from '@material-ui/styles';
import appTheme from 'themes/appTheme';

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

export interface IIntendedOutcomesOption extends IAutocompleteFieldOption<number> {
  description: string;
}

export interface IFieldMethodsOption extends IAutocompleteFieldOption<number> {
  description: string;
}

export interface IEcologicalSeasonsOption extends IAutocompleteFieldOption<number> {
  description: string;
}

export interface IPurposeAndMethodologyFormProps {
  intended_outcomes: IIntendedOutcomesOption[];
  field_methods: IFieldMethodsOption[];
  ecological_seasons: IEcologicalSeasonsOption[];
  vantage_codes: IMultiAutocompleteFieldOption[];
}

const selectWithSubheadersTheme = createMuiTheme({
  typography: appTheme.typography,
  overrides: {
    MuiMenu: {
      paper: {
        maxWidth: 500,
        maxHeight: 500
      }
    },
    MuiMenuItem: {
      root: {
        whiteSpace: 'break-spaces'
      }
    },
    MuiListItemText: {
      primary: {
        fontWeight: 700
      }
    }
  }
})

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const PurposeAndMethodologyForm: React.FC<IPurposeAndMethodologyFormProps> = (props) => {
  const formikProps = useFormikContext<IPurposeAndMethodologyForm>();

  return (
    <ThemeProvider theme={selectWithSubheadersTheme}>
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
                inputProps={{ 'aria-label': 'Intended Outcomes' }}
                renderValue={(value) => {
                  const code = props.intended_outcomes.find((item) => item.value === value);
                  return <>{code?.label}</>;
                }}>
                {props.intended_outcomes.map((item) => <>
                  <MenuItem dense key={item.value} value={item.value}>
                    <ListItemText primary={item.label} secondary={item.description} />
                  </MenuItem>
                  <Divider />
                </>)}
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
                inputProps={{ 'aria-label': 'Field Method' }}
                renderValue={(value) => {
                  const code = props.field_methods.find((item) => item.value === value);
                  return <>{code?.label}</>;
                }}>
                {props.field_methods.map((item) => <>
                  <MenuItem key={item.value} value={item.value}>
                    <ListItemText primary={item.label} secondary={item.description} />
                  </MenuItem>
                  <Divider />
                </>)}
              </Select>
              <FormHelperText>{formikProps.touched.field_method_id && formikProps.errors.field_method_id}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
              <InputLabel id="ecological_season_id-label">Ecological Season</InputLabel>
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
                inputProps={{ 'aria-label': 'Ecological Season' }}
                renderValue={(value) => {
                  const code = props.ecological_seasons.find((item) => item.value === value);
                  return <>{code?.label}</>;
                }}>
                {props.ecological_seasons.map((item) => <>
                  <MenuItem key={item.value} value={item.value}>
                    <ListItemText primary={item.label} secondary={item.description} />
                  </MenuItem>
                  <Divider />
                </>)}
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
    </ThemeProvider>
  );
};

export default PurposeAndMethodologyForm
