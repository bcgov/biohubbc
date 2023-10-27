import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import MultiAutocompleteField from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import SelectWithSubtextField, { ISelectWithSubtextFieldOption } from 'components/fields/SelectWithSubtext';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IPurposeAndMethodologyForm {
  purpose_and_methodology: {
    intended_outcome_ids: number[];
    additional_details: string;
    field_method_id: number;
    ecological_season_id: number;
    vantage_code_ids: number[];
  };
}

export const PurposeAndMethodologyInitialValues: IPurposeAndMethodologyForm = {
  purpose_and_methodology: {
    intended_outcome_ids: [],
    additional_details: '',
    field_method_id: '' as unknown as number,
    ecological_season_id: '' as unknown as number,
    vantage_code_ids: []
  }
};

export const PurposeAndMethodologyYupSchema = yup.object().shape({
  purpose_and_methodology: yup.object().shape({
    field_method_id: yup.number().required('Field Method is Required'),
    additional_details: yup.string(),
    intended_outcome_ids: yup.array().required('Intended Outcome is Required'),
    ecological_season_id: yup.number().required('Ecological Season is Required'),
    vantage_code_ids: yup.array().min(1, 'One or more Vantage Codes are Required').required('Required')
  })
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
  const { values } = useFormikContext();

  return (
    <form>
      <Box component="fieldset">
        <Typography component="legend" variant="h5">
          Purpose of Survey
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MultiAutocompleteField
              //id="intended_outcome_id"
              id="purpose_and_methodology.intended_outcome_ids"
              label="Ecological Variables"
              options={props.intended_outcomes}
              required={true}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="purpose_and_methodology.additional_details"
              label="Additional Details"
              other={{ multiline: true, rows: 2 }}
            />
          </Grid>
        </Grid>
      </Box>
      <Box component="fieldset" mt={5}>
        <Typography component="legend" variant="h5">
          Survey Methodology
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SelectWithSubtextField
              id="field_method_id"
              name="purpose_and_methodology.field_method_id"
              label="Field Method"
              options={props.field_methods}
              required={true}
            />
          </Grid>
          <Grid item xs={12}>
            <SelectWithSubtextField
              id="ecological_season_id"
              name="purpose_and_methodology.ecological_season_id"
              label="Ecological Season"
              options={props.ecological_seasons}
              required={true}
            />
          </Grid>
          <Grid item xs={12}>
            <MultiAutocompleteFieldVariableSize
              id="purpose_and_methodology.vantage_code_ids"
              label="Vantage Codes"
              options={props.vantage_codes}
              required={true}
            />
          </Grid>
        </Grid>
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </Box>
    </form>
  );
};

export default PurposeAndMethodologyForm;
