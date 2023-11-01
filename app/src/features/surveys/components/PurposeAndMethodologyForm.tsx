import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import MultiAutocompleteField from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import { ISelectWithSubtextFieldOption } from 'components/fields/SelectWithSubtext';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IPurposeAndMethodologyForm {
  purpose_and_methodology: {
    intended_outcome_ids: number[];
    additional_details: string;
    vantage_code_ids: number[];
  };
}

export const PurposeAndMethodologyInitialValues: IPurposeAndMethodologyForm = {
  purpose_and_methodology: {
    intended_outcome_ids: [],
    additional_details: '',
    vantage_code_ids: []
  }
};

export const PurposeAndMethodologyYupSchema = yup.object().shape({
  purpose_and_methodology: yup.object().shape({
    additional_details: yup.string(),
    intended_outcome_ids: yup.array().min(1, 'One or more Ecological Variables are Required').required('Required'),
    vantage_code_ids: yup.array().min(1, 'One or more Vantage Codes are Required').required('Required')
  })
});

export interface IPurposeAndMethodologyFormProps {
  intended_outcomes: ISelectWithSubtextFieldOption[];
  vantage_codes: IMultiAutocompleteFieldOption[];
}

/**
 * Create survey - purpose and methodology fields
 *
 * @return {*}
 */
const PurposeAndMethodologyForm: React.FC<IPurposeAndMethodologyFormProps> = (props) => {
  return (
    <form>
      <Box component="fieldset">
        <Typography component="legend" variant="h5">
          Purpose of Survey
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MultiAutocompleteField
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
            <MultiAutocompleteFieldVariableSize
              id="purpose_and_methodology.vantage_code_ids"
              label="Vantage Codes"
              options={props.vantage_codes}
              required={true}
            />
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default PurposeAndMethodologyForm;
