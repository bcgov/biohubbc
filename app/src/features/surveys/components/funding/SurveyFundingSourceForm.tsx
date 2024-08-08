import { mdiClose, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import AutocompleteField from 'components/fields/AutocompleteField';
import DollarAmountField from 'components/fields/DollarAmountField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import get from 'lodash-es/get';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';

export interface ISurveyFundingSource {
  funding_source_id: number;
  amount: number;
  revision_count: number;
  survey_funding_source_id?: number | null;
  survey_id: number;
  funding_source_name?: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
}

export interface ISurveyFundingSourceForm {
  funding_used: boolean | null;
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
  funding_used: null,
  funding_sources: []
};

export const SurveyFundingSourceFormYupSchema = yup.object().shape({
  funding_used: yup
    .boolean()
    .nullable()
    .required('You must indicate whether a funding source requires this survey to be submitted'),
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
  const { values, handleChange, handleSubmit, errors, setFieldValue, submitCount, setFieldError } = formikProps;

  // Determine value of funding_used based on whether funding_sources exist
  useEffect(() => {
    if (values.funding_sources.length > 0) {
      setFieldValue('funding_used', values.funding_used);
    } else if (!values.funding_sources.length) {
      setFieldValue('funding_used', values.funding_used);
    }
  }, [setFieldValue, values.funding_sources, values.funding_used]);

  const biohubApi = useBiohubApi();
  const fundingSourcesDataLoader = useDataLoader(() => biohubApi.funding.getAllFundingSources());
  fundingSourcesDataLoader.load();

  const fundingSources = fundingSourcesDataLoader.data ?? [];

  // Determine the radio button value
  const getFundingUsedValue = () => {
    if (values.funding_used === true) {
      return 'true';
    }
    if (values.funding_used === false) {
      return 'false';
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldArray
        name="funding_sources"
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <Stack gap={1}>
            {get(errors, 'funding_used') && submitCount > 0 && (
              <AlertBar
                severity="error"
                variant="outlined"
                title="Funding declaration missing"
                text={
                  get(errors, 'funding_used') ||
                  'Indicate whether a funding source requires this survey to be submitted'
                }
              />
            )}
            <RadioGroup
              aria-label="funding_used"
              name="funding_used"
              value={getFundingUsedValue()}
              onChange={(event) => {
                const value = event.target.value === 'true' ? true : false;
                setFieldValue('funding_used', value);
                if (value) {
                  arrayHelpers.push(SurveyFundingSourceInitialValues);
                } else {
                  setFieldValue('funding_sources', []);
                }
                setFieldError('funding_used', undefined);
              }}>
              <FormControlLabel value="true" control={<Radio required={true} color="primary" />} label="Yes" />
              <FormControlLabel value="false" control={<Radio required={true} color="primary" />} label="No" />
            </RadioGroup>

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
                        mt: 1,
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
            {values.funding_used && (
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
            )}
          </Stack>
        )}
      />
    </form>
  );
};

export default SurveyFundingSourceForm;
