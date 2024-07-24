import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import SelectWithSubtextField from 'components/fields/SelectWithSubtext';
import { CodesContext } from 'contexts/codesContext';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { useContext, useEffect } from 'react';
import yup from 'utils/YupSchema';
import { v4 } from 'uuid';
import {
  ISurveySampleMethodPeriodData,
  SamplingSiteMethodPeriodYupSchema
} from '../../periods/SamplingPeriodFormContainer';

export interface ISurveySampleMethodFormData {
  _id?: string; // Internal ID used only for a unique key prop. Should not be sent to the API.
  survey_sample_method_id: number | null;
  survey_sample_site_id: number | null;
  method_response_metric_id: number | null;
  description: string;
  technique: {
    method_technique_id: number | null;
  };
  sample_periods: ISurveySampleMethodPeriodData[];
}

/**
 * Returns initial values for the survey sampling method form.
 */
export const SurveySampleMethodDataInitialValues: () => ISurveySampleMethodFormData = () => ({
  _id: v4(),
  survey_sample_method_id: null,
  survey_sample_site_id: null,
  method_response_metric_id: null,
  description: '',
  technique: {
    method_technique_id: null
  },
  sample_periods: []
});

export const SamplingSiteMethodYupSchema = yup.object({
  method_response_metric_id: yup
    .number()
    .typeError('Response Metric is required')
    .required('Response Metric is required'),
  description: yup.string().max(250, 'Maximum 250 characters'),
  technique: yup.object({
    method_technique_id: yup.number().required('Technique is required.').typeError('Technique is required')
  }),
  sample_periods: yup.array(SamplingSiteMethodPeriodYupSchema)
});

/**
 * Returns a form for editing a sampling method
 *
 * @returns
 */
export const SamplingMethodForm = () => {
  const codesContext = useContext(CodesContext);
  const surveyContext = useSurveyContext();

  const { setFieldValue } = useFormikContext<ISurveySampleMethodFormData>();

  const methodResponseMetricOptions: IAutocompleteFieldOption<number>[] =
    codesContext.codesDataLoader.data?.method_response_metrics.map((option) => ({
      value: option.id,
      label: option.name,
      description: option.description
    })) ?? [];

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const techniques = surveyContext.techniqueDataLoader.data?.techniques;

  if (!codesContext.codesDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <form>
      <Stack gap={3}>
        <Stack component="fieldset" gap={3}>
          <Typography component="legend">Details</Typography>
          <SelectWithSubtextField
            id="method_technique_id"
            label="Technique"
            name="technique.method_technique_id"
            options={
              techniques?.map((option) => ({
                value: option.method_technique_id,
                label: option.name,
                subText: option.description ?? undefined
              })) ?? []
            }
          />
          <AutocompleteField
            id="method_response_metric_id"
            label="Response Metric"
            name="method_response_metric_id"
            showValue={true}
            options={methodResponseMetricOptions ?? []}
            onChange={(_, value) => {
              if (value?.value) {
                setFieldValue('method_response_metric_id', value.value);
              }
            }}
          />
          <CustomTextField
            name="description"
            label="Description (optional)"
            maxLength={250}
            other={{ multiline: true, placeholder: 'Maximum 250 characters', rows: 3 }}
          />
        </Stack>
      </Stack>
    </form>
  );
};
