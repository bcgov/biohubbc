import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AutocompleteField from 'components/fields/AutocompleteField';
import DollarAmountField from 'components/fields/DollarAmountField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import yup from 'utils/YupSchema';

export interface ISurveyFundingSource {
  funding_source_id: number;
  amount: number;
  revision_count: number;
  survey_funding_source_id?: number;
  survey_id: number;
  funding_source_name?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface ISurveyFundingSourceForm {
  funding_sources: ISurveyFundingSource[];
}

const SurveyFundingSourceInitialValues: ISurveyFundingSource = {
  funding_source_id: undefined as unknown as number,
  amount: undefined as unknown as number,
  revision_count: 0,
  survey_funding_source_id: undefined,
  survey_id: 0
};

export const SurveyFundingSourceYupSchema = yup.object().shape({
  funding_source_id: yup.number().required('Must select a funding source').min(1, 'Must select a funding source'), // TODO confirm that this is not triggered when the autocomplete is empty.
  amount: yup
    .number()
    .min(0, 'Must be a positive number')
    .max(9999999999, 'Cannot exceed $9,999,999,999')
    .nullable(true)
    .transform((value) => (isNaN(value) ? null : Number(value)))
});

export const SurveyFundingSourceFormInitialValues: ISurveyFundingSourceForm = {
  funding_sources: []
};

export const SurveyFundingSourceFormYupSchema = yup.object().shape({
  funding_sources: yup.array(SurveyFundingSourceYupSchema)
});

/**
 * Create/edit survey - Funding section
 *
 * @return {*}
 */
const SurveyFundingSourceForm = () => {
  const formikProps = useFormikContext<IEditSurveyRequest>();
  const { values, handleChange, handleSubmit } = formikProps;

  const biohubApi = useBiohubApi();
  const fundingSourcesDataLoader = useDataLoader(() => biohubApi.funding.getAllFundingSources());
  fundingSourcesDataLoader.load();

  const fundingSources = fundingSourcesDataLoader.data ?? [];

  return (
    <form onSubmit={handleSubmit}>
      <FieldArray
        name="funding_sources"
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <Box>
            {values.funding_sources.map((surveyFundingSource: ISurveyFundingSource, index: number) => {
              return (
                <Box
                  mb={3}
                  display="flex"
                  gap={2}
                  alignItems="flex-start"
                  key={surveyFundingSource.survey_funding_source_id}>
                  <AutocompleteField
                    id={`funding_sources.[${index}].funding_source_id`}
                    name={`funding_sources.[${index}].funding_source_id`}
                    label="Funding Source"
                    sx={{ flex: 6 }}
                    options={fundingSources.map((fundingSource) => ({
                      value: fundingSource.funding_source_id,
                      label: fundingSource.name
                    }))}
                    loading={fundingSourcesDataLoader.isLoading}
                    required
                  />
                  <DollarAmountField
                    label="Amount (Optional)"
                    id={`funding_sources.[${index}].amount`}
                    name={`funding_sources.[${index}].amount`}
                    value={surveyFundingSource.amount}
                    onChange={handleChange}
                    sx={{ flex: 4 }}
                  />
                  <Box mt={1}>
                    <IconButton
                      data-testid={`funding-form-delete-button-${index}`}
                      title="Remove Funding Source"
                      aria-label="Remove Funding Source"
                      onClick={() => arrayHelpers.remove(index)}
                      sx={{ ml: -1 }}>
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
            <Button
              data-testid="funding-form-add-button"
              variant="outlined"
              color="primary"
              title="Create Funding Source"
              aria-label="Create Funding Source"
              startIcon={<Icon path={mdiPlus} size={1} />}
              onClick={() => arrayHelpers.push(SurveyFundingSourceInitialValues)}>
              Add Funding Source
            </Button>
          </Box>
        )}
      />
    </form>
  );
};

export default SurveyFundingSourceForm;
