import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
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
    revision_count: number;
  };
}

export const PurposeAndMethodologyInitialValues: IPurposeAndMethodologyForm = {
  purpose_and_methodology: {
    intended_outcome_ids: [],
    additional_details: '',
    revision_count: 0
  }
};

export const PurposeAndMethodologyYupSchema = yup.object().shape({
  purpose_and_methodology: yup.object().shape({
    additional_details: yup.string(),
    intended_outcome_ids: yup.array().min(1, 'One or more Ecological Variables are Required').required('Required')
  })
});

export interface IPurposeAndMethodologyFormProps {
  intended_outcomes: ISelectWithSubtextFieldOption[];
  type: IMultiAutocompleteFieldOption[];
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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MultiAutocompleteFieldVariableSize
              id={'survey_details.survey_types'}
              label={'Collected data'}
              options={props.type}
              required={true}
            />
          </Grid>
          <Grid item xs={12}>
            <MultiAutocompleteField
              id="purpose_and_methodology.intended_outcome_ids"
              label="Ecological concepts of interest"
              options={props.intended_outcomes}
              required={true}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="purpose_and_methodology.additional_details"
              label="Objectives"
              other={{ multiline: true, rows: 5, required: true }}
            />
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default PurposeAndMethodologyForm;
