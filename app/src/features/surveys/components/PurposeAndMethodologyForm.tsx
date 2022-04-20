import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Typography from '@material-ui/core/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import SelectWithSubtextField, { ISelectWithSubtextFieldOption } from 'components/fields/SelectWithSubtext';
import { useFormikContext } from 'formik';
import React from 'react';
import { StringBoolean } from 'types/misc';
import yup from 'utils/YupSchema';

export interface IPurposeAndMethodologyForm {
  intended_outcome_id: number;
  additional_details: string;
  field_method_id: number;
  ecological_season_id: number;
  vantage_code_ids: number[];
  surveyed_all_areas: StringBoolean;
}

export const PurposeAndMethodologyInitialValues: IPurposeAndMethodologyForm = {
  intended_outcome_id: ('' as unknown) as number,
  additional_details: '',
  field_method_id: ('' as unknown) as number,
  ecological_season_id: ('' as unknown) as number,
  vantage_code_ids: [],
  surveyed_all_areas: ('' as unknown) as StringBoolean
};

export const PurposeAndMethodologyYupSchema = yup.object().shape({
  field_method_id: yup.number().required('You must provide a field method'),
  additional_details: yup.string(),
  intended_outcome_id: yup.number().required('You must provide intended outcomes for the survey'),
  ecological_season_id: yup.number().required('You must provide an ecological season for the survey'),
  vantage_code_ids: yup.array().min(1, 'You must one or more vantage codes').required('Required'),
  surveyed_all_areas: yup.string().oneOf(['true', 'false'], 'This field is required').required('This field is required')
});

export interface IPurposeAndMethodologyFormProps {
  intended_outcomes: ISelectWithSubtextFieldOption[];
  field_methods: ISelectWithSubtextFieldOption[];
  ecological_seasons: ISelectWithSubtextFieldOption[];
  vantage_codes: IMultiAutocompleteFieldOption[];
}

/**
 * Create survey - purpose and methodology fields
 *
 * @return {*}
 */
const PurposeAndMethodologyForm: React.FC<IPurposeAndMethodologyFormProps> = (props) => {
  const { values, touched, errors, handleChange } = useFormikContext<IPurposeAndMethodologyForm>();

  return (
    <form>
      <Box component="fieldset">
        <Typography component="legend">Purpose of Survey</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SelectWithSubtextField
              id="intended_outcome_id"
              name="intended_outcome_id"
              label="Intended Outcomes"
              options={props.intended_outcomes}
              required={true}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="additional_details"
              label="Additional Details"
              other={{ multiline: true, rows: 2 }}
            />
          </Grid>
        </Grid>
      </Box>
      <Box component="fieldset" mt={4}>
        <Typography component="legend">Survey Methodology</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
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
          <Grid item xs={12}>
            <FormControl
              required={true}
              component="fieldset"
              error={touched.surveyed_all_areas && Boolean(errors.surveyed_all_areas)}>
              <Typography component="legend">Population of Interest</Typography>
              <Typography>Did you survey all areas that include your population of interest?</Typography>
              <Box mt={2}>
                <RadioGroup
                  name="surveyed_all_areas"
                  aria-label="Data and Information Sharing Agreement"
                  value={values.surveyed_all_areas}
                  onChange={handleChange}>
                  <FormControlLabel
                    value="true"
                    control={<Radio required={true} color="primary" />}
                    label="Yes - all areas were surveyed"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio required={true} color="primary" />}
                    label="No - only some areas were surveyed"
                  />
                  <FormHelperText>{errors.surveyed_all_areas}</FormHelperText>
                </RadioGroup>
              </Box>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default PurposeAndMethodologyForm;
