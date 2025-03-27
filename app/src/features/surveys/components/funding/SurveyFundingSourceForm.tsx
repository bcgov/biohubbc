import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import AlertBar from 'components/alert/AlertBar';
import { NameDescriptionCard } from 'components/card/NameDescriptionCard';
import AutocompleteField from 'components/fields/AutocompleteField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import get from 'lodash-es/get';
import { useEffect, useMemo } from 'react';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';

export interface ISurveyFundingSource {
  funding_source_id: number;
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
  funding_sources: { funding_source_id: number }[];
}

export const SurveyFundingSourceFormInitialValues: ISurveyFundingSourceForm = {
  funding_used: null,
  funding_sources: []
};

export const SurveyFundingSourceFormYupSchema = yup.object().shape({
  funding_used: yup
    .boolean()
    .nullable()
    .required('You must indicate whether a funding source requires this survey to be submitted'),
  funding_sources: yup
    .array(
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
          })
      })
    )
    .when('funding_used', {
      is: true,
      then: yup.array().min(1, 'You must select at least one funding source'),
      otherwise: yup.array().nullable()
    })
});

/**
 * Create/edit survey - Funding section
 *
 * @return {*}
 */

const SurveyFundingSourceForm = () => {
  const { values, handleSubmit, errors, setFieldValue, submitCount, setFieldError } =
    useFormikContext<IEditSurveyRequest>();

  const biohubApi = useBiohubApi();

  const fundingSourcesDataLoader = useDataLoader(() => biohubApi.funding.getAllFundingSources());

  useEffect(() => {
    fundingSourcesDataLoader.load();
  }, [fundingSourcesDataLoader]);

  const fundingSourceOptions = useMemo(
    () =>
      fundingSourcesDataLoader.data?.map((option) => ({ value: option.funding_source_id, label: option.name })) ?? [],
    [fundingSourcesDataLoader.data]
  );

  const existingFunctionSources = useMemo(
    () =>
      fundingSourceOptions.filter((option) =>
        values.funding_sources.map((source) => source.funding_source_id).includes(option.value)
      ),
    [fundingSourceOptions, values.funding_sources]
  );

  // Update `funding_used` based on the existence of `funding_sources`
  useEffect(() => {
    if (values.funding_sources.length > 0) {
      setFieldValue('funding_used', values.funding_used);
    } else if (!values.funding_sources.length) {
      setFieldValue('funding_used', values.funding_used);
    }
  }, [setFieldValue, values.funding_sources, values.funding_used]);

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

            {/* Radio Buttons for funding_used */}
            <RadioGroup
              aria-label="funding_used"
              name="funding_used"
              value={getFundingUsedValue()}
              sx={{ mb: 1 }}
              onChange={(event) => {
                const value = event.target.value === 'true' ? true : false;
                setFieldValue('funding_used', value);
                if (!value) {
                  setFieldValue('funding_sources', []);
                }
                setFieldError('funding_used', undefined);
              }}>
              <FormControlLabel value="true" control={<Radio required={true} color="primary" />} label="Yes" />
              <FormControlLabel value="false" control={<Radio required={true} color="primary" />} label="No" />
            </RadioGroup>

            {/* Autocomplete to select funding sources */}
            {values.funding_used && (
              <AutocompleteField
                id="funding_sources"
                name="funding_sources"
                label="Funding Source"
                selectedOptions={values.funding_sources.map((source) => source.funding_source_id)}
                required
                options={fundingSourceOptions}
                onChange={(_, option) => {
                  if (option) {
                    setFieldValue('funding_sources', [...values.funding_sources, { funding_source_id: option.value }]);
                  }
                }}
              />
            )}

            {/* Transition Group for displaying funding sources */}
            <TransitionGroup>
              {existingFunctionSources.map((fundingSource, index) => (
                <Collapse key={fundingSource.value}>
                  <NameDescriptionCard
                    sx={{ my: 0.5 }}
                    onDelete={() => arrayHelpers.remove(index)}
                    label={fundingSource.label}
                  />
                </Collapse>
              ))}
            </TransitionGroup>
          </Stack>
        )}
      />
    </form>
  );
};

export default SurveyFundingSourceForm;
