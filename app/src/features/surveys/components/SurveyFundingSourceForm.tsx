import { mdiClose, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import DollarAmountField from 'components/fields/DollarAmountField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { TransitionGroup } from 'react-transition-group';
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

export const SurveyFundingSourceFormInitialValues: ISurveyFundingSourceForm = {
  funding_sources: []
};

export const SurveyFundingSourceFormYupSchema = yup.object().shape({
  funding_sources: yup.array(
    yup.object().shape({
      funding_source_id: yup
        .number()
        .required('Must select a funding source')
        .min(1, 'Must select a funding source')
        .test('is-unique-funding-source', 'Funding sources must be unique', function (fundingSourceId) {
          const formValues = this.options.context;

          if (!formValues?.funding_sources?.length) {
            return true;
          }

          return (
            formValues.funding_sources.filter(
              (fundingSource: ISurveyFundingSource) => fundingSource.funding_source_id === fundingSourceId
            ).length <= 1
          );
        }),
      amount: yup
        .number()
        .min(0, 'Must be a positive number')
        .max(9999999999, 'Cannot exceed $9,999,999,999')
        .nullable(true)
        .transform((value) => (isNaN(value) ? null : Number(value)))
    })
  )
});

/**
 * Create/edit survey - Funding section
 *
 * @return {*}
 */
const SurveyFundingSourceForm = () => {
  const formikProps = useFormikContext<IEditSurveyRequest>();
  const { values, handleChange, handleSubmit, errors } = formikProps;

  const biohubApi = useBiohubApi();
  const fundingSourcesDataLoader = useDataLoader(() => biohubApi.funding.getAllFundingSources());
  fundingSourcesDataLoader.load();

  const fundingSources = fundingSourcesDataLoader.data ?? [];

  return (
    <form onSubmit={handleSubmit}>
      <FieldArray
        name="funding_sources"
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <Stack gap={1}>
            <TransitionGroup
              component={Stack}
              gap={1}
              role="list"
              sx={{
                '&:not(:has(div[role=listitem]))': {
                  display: 'none'
                }
              }}>
              {values.funding_sources.map((surveyFundingSource: ISurveyFundingSource, index: number) => {
                return (
                  <Collapse role="listitem" key={index}>
                    <Card
                      component={Stack}
                      variant="outlined"
                      flexDirection="row"
                      alignItems="flex-start"
                      gap={2}
                      sx={{
                        width: '100%',
                        p: 2,
                        backgroundColor: grey[100]
                      }}>
                      <AutocompleteField
                        id={`funding_sources.[${index}].funding_source_id`}
                        name={`funding_sources.[${index}].funding_source_id`}
                        label="Funding Source"
                        options={fundingSources.map((fundingSource) => ({
                          value: fundingSource.funding_source_id,
                          label: fundingSource.name
                        }))}
                        loading={fundingSourcesDataLoader.isLoading}
                        required
                        sx={{
                          flex: '1 1 auto'
                        }}
                      />
                      <DollarAmountField
                        label="Amount (Optional)"
                        id={`funding_sources.[${index}].amount`}
                        name={`funding_sources.[${index}].amount`}
                        value={surveyFundingSource.amount}
                        onChange={handleChange}
                        sx={{
                          width: '200px'
                        }}
                      />

                      <IconButton
                        data-testid={`funding-form-delete-button-${index}`}
                        title="Remove Funding Source"
                        aria-label="Remove Funding Source"
                        onClick={() => arrayHelpers.remove(index)}
                        sx={{ mt: 1.125 }}>
                        <Icon path={mdiClose} size={1} />
                      </IconButton>
                    </Card>
                  </Collapse>
                );
              })}
            </TransitionGroup>
            {errors.funding_sources && !Array.isArray(errors?.funding_sources) && (
              <Box mt={3}>
                <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors.funding_sources}</Typography>
              </Box>
            )}
            <Button
              data-testid="funding-form-add-button"
              variant="outlined"
              color="primary"
              title="Create Funding Source"
              aria-label="Create Funding Source"
              startIcon={<Icon path={mdiPlus} size={1} />}
              onClick={() => arrayHelpers.push(SurveyFundingSourceInitialValues)}
              sx={{
                alignSelf: 'flex-start'
              }}>
              Add Funding Source
            </Button>
          </Stack>
        )}
      />
    </form>
  );
};

export default SurveyFundingSourceForm;
