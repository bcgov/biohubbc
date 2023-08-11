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
  survey_funding_source_id: number;
  survey_id: number;
  funding_source_name?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface ISurveyFundingSourceForm {
  funding_sources: ISurveyFundingSource[];
}

export const SurveyFundingSourceFormInitialValues: ISurveyFundingSourceForm = {
  funding_sources: []
};

export const SurveyFundingSourceFormYupSchema = yup.object().shape({
  funding_sources: yup.array()
});

export const SurveyFundingSourceInitialValues: ISurveyFundingSource = {
  funding_source_id: undefined as unknown as number,
  amount: 0,
  revision_count: 0,
  survey_funding_source_id: 0,
  survey_id: 0
};

export const SurveyFundingSourceYupSchema = yup.object().shape({
  funding_source_id: yup.number().required('Must select a Funding Source').min(1, 'Must select a valid Funding Source'), // TODO confirm that this is not triggered when the autocomplete is empty.
  funding_amount: yup
    .number()
    .transform((value) => (isNaN(value) && null) || value)
    .typeError('Must be a number')
    .min(0, 'Must be a positive number')
    .max(9999999999, 'Cannot exceed $9,999,999,999')
});

/**
 * Create/edit survey - Funding section
 *
 * @return {*}
 */
const FundingSourceForm = () => {
  const formikProps = useFormikContext<IEditSurveyRequest>();
  const { values, handleChange, handleSubmit } = formikProps;

  const biohubApi = useBiohubApi();
  const fundingSourcesDataLoader = useDataLoader(() => biohubApi.funding.getAllFundingSources());
  fundingSourcesDataLoader.load();

  const fundingSources = fundingSourcesDataLoader.data ?? [];

  console.log({ values, fundingSources });

  return (
    <form onSubmit={handleSubmit}>
      <FieldArray
        name="funding_sources"
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <Box>
            {values.funding_sources.map((surveyFundingSource, index) => {
              return (
                <Box
                  mb={3}
                  display="flex"
                  gap={2}
                  alignItems="center"
                  key={surveyFundingSource.survey_funding_source_id}>
                  <AutocompleteField // <IGetFundingSourcesResponse>
                    id={`funding_sources.[${index}].funding_source_id`}
                    name={`funding_sources.[${index}].funding_source_id`}
                    label="Funding Source"
                    sx={{ flex: 6 }}
                    options={fundingSources.map((fundingSource) => ({
                      value: fundingSource.funding_source_id,
                      label: fundingSource.name
                    }))}
                    // getOptionDisabled={(option) => values.funding_sources.some((source) => source.funding_source_id === option.value)}
                    loading={fundingSourcesDataLoader.isLoading}
                    required
                  />
                  <DollarAmountField
                    label="Funding Amount"
                    id={`funding_sources.[${index}].amount`}
                    name={`funding_sources.[${index}].amount`}
                    value={surveyFundingSource.amount}
                    onChange={handleChange}
                    sx={{ flex: 4 }}
                  />
                  <Box>
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
              title="Add Funding Source"
              aria-label="Add Funding Source"
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

export default FundingSourceForm;
