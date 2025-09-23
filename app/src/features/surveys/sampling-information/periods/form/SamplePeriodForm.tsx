import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import {
  InitialSurveySamplePeriodPeriodFormData,
  ISurveySamplePeriodPeriodFormData
} from 'features/surveys/sampling-information/periods/form/components/periods/SamplePeriodPeriodForm';
import { SamplingPeriodPeriodFormContainer } from 'features/surveys/sampling-information/periods/form/components/periods/SamplingPeriodPeriodFormContainer';
import { SamplingPeriodSiteForm } from 'features/surveys/sampling-information/periods/form/components/sites/SamplingPeriodSiteForm';
import { SamplePeriodTechniqueForm } from 'features/surveys/sampling-information/periods/form/components/technique/SamplePeriodTechniqueForm';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { useHistory } from 'react-router';

export interface ISurveySamplePeriodFormData {
  method_technique_id: number | null;
  survey_sample_site_id: number | null;
  sample_periods: ISurveySamplePeriodPeriodFormData[];
}

export const InitialSurveySamplePeriodFormData = {
  method_technique_id: '' as unknown as number,
  survey_sample_site_id: '' as unknown as number,
  sample_periods: [InitialSurveySamplePeriodPeriodFormData]
};

export interface ISamplePeriodFormProps {
  isLoading: boolean;
  editData?: GetSamplingPeriod;
}

/**
 * Renders sampling site create form.
 *
 * @param {ISamplePeriodFormProps} props
 * @returns {*}
 */
export const SamplePeriodForm = (props: ISamplePeriodFormProps) => {
  const { isLoading, editData } = props;

  const { surveyId } = useSurveyContext();

  const history = useHistory();

  const { submitForm } = useFormikContext<ISurveySamplePeriodFormData>();

  // Limit the number of periods that can be added or removed to 1 if editing an existing period.
  const minimumNumberOfPeriods = editData !== undefined ? 1 : 0;
  const maximumNumberOfPeriods = editData !== undefined ? 1 : 0;

  return (
    <>
      <HorizontalSplitFormComponent title="Technique" summary="Select the technique used for the sampling period">
        <SamplePeriodTechniqueForm editData={editData?.method_technique} />
      </HorizontalSplitFormComponent>

      <Divider sx={{ my: 5 }} />

      <HorizontalSplitFormComponent title="Site" summary="Select the site where sampling occurred">
        <SamplingPeriodSiteForm editData={editData?.survey_sample_site} />
      </HorizontalSplitFormComponent>

      <Divider sx={{ my: 5 }} />

      <HorizontalSplitFormComponent title="Period" summary="Enter the start and end time of the sampling period">
        <SamplingPeriodPeriodFormContainer
          minimumNumberOfPeriods={minimumNumberOfPeriods}
          maximumNumberOfPeriods={maximumNumberOfPeriods}
        />
      </HorizontalSplitFormComponent>

      <Divider sx={{ my: 5 }} />

      <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={1}>
        <LoadingButton
          type="submit"
          variant="contained"
          color="primary"
          loading={isLoading}
          onClick={() => {
            submitForm();
          }}>
          Save and Exit
        </LoadingButton>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            history.push(`/admin/surveys/${surveyId}/sampling`);
          }}>
          Cancel
        </Button>
      </Stack>
    </>
  );
};
