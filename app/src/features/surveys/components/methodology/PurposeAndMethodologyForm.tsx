import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MultiAutocompleteField, { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import { ISelectWithSubtextFieldOption } from 'components/fields/SelectWithSubtext';
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

interface IPurposeAndMethodologyFormProps {
  intended_outcomes: ISelectWithSubtextFieldOption[];
  type: IMultiAutocompleteFieldOption[];
}

/**
 * Create survey - purpose and methodology fields
 *
 * @return {*}
 */
const PurposeAndMethodologyForm = (props: IPurposeAndMethodologyFormProps) => {
  return (
    <form>
      <Box component="fieldset">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MultiAutocompleteField
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
              options={props.intended_outcomes.map((outcome) => ({
                value: outcome.value,
                label: outcome.label,
                description: outcome.description
              }))}
              required={true}
            />
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default PurposeAndMethodologyForm;
