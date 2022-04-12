import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import SelectWithSubtextField, { ISelectWithSubtextFieldOption } from 'components/fields/SelectWithSubtext';
import React from 'react';
import yup from 'utils/YupSchema';
import { ThemeProvider } from '@material-ui/styles';
import appTheme from 'themes/appTheme';
import { createMuiTheme } from '@material-ui/core';

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
  vantage_code_ids: yup.array().min(1, 'You must one or more vantage codes').required('Required')
});

export interface IPurposeAndMethodologyFormProps {
  intended_outcomes: ISelectWithSubtextFieldOption[];
  field_methods: ISelectWithSubtextFieldOption[];
  ecological_seasons: ISelectWithSubtextFieldOption[];
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
        whiteSpace: 'break-spaces',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
      },
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
  return (
    <ThemeProvider theme={selectWithSubheadersTheme}>
      <form>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box component="fieldset" mt={4}>
              <Typography component="legend">Purpose of Survey</Typography>
            </Box>
            <SelectWithSubtextField
              id="intended_outcome_id"
              name="intended_outcome_id"
              label="Intended Outcomes"
              options={props.intended_outcomes}
              required={true}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField name="additional_details" label="Additional Details" other={{ multiline: true, rows: 2 }} />
          </Grid>
          <Grid item xs={12}>
            <Box component="fieldset" mt={4}>
              <Typography component="legend">Survey Methodology</Typography>
            </Box>
            <SelectWithSubtextField
              id="field_method_id"
              name="field_method_id"
              label="Field Method"
              options={props.field_methods}
              required={true}
            />
          </Grid>
          <Grid item xs={12}>
            <SelectWithSubtextField
              id="ecological_season_id"
              name="ecological_season_id"
              label="Ecological Season"
              options={props.ecological_seasons}
              required={true}
            />
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
