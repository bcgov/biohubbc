import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { ISurveySamplePeriodPeriodFormData } from 'features/surveys/sampling-information/periods/form/components/periods/SamplePeriodPeriodForm';
import { SamplingPeriodPeriodFormContainer } from 'features/surveys/sampling-information/periods/form/components/periods/SamplingPeriodPeriodFormContainer';
import { SamplingPeriodSiteForm } from 'features/surveys/sampling-information/periods/form/components/sites/SamplingPeriodSiteForm';
import SamplePeriodTechniqueForm from 'features/surveys/sampling-information/periods/form/components/technique/SamplePeriodTechniqueForm';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { useHistory } from 'react-router';

export interface ISurveySamplePeriodFormData {
  method_technique_id: number;
  survey_sample_site_id: number;
  sample_periods: ISurveySamplePeriodPeriodFormData[];
}

export const InitialSurveySamplePeriodFormData = {
  method_technique_id: '' as unknown as number,
  survey_sample_site_id: '' as unknown as number,
  sample_periods: []
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
export const SamplePeriodForm2 = (props: ISamplePeriodFormProps) => {
  const { isLoading, editData } = props;

  const { projectId, surveyId } = useSurveyContext();

  const history = useHistory();

  const { submitForm } = useFormikContext<ISurveySamplePeriodFormData>();

  return (
    <>
      <HorizontalSplitFormComponent title="Technique" summary="Select a technique">
        <SamplePeriodTechniqueForm editData={editData?.method_technique} />
      </HorizontalSplitFormComponent>

      <Divider sx={{ my: 5 }} />

      <HorizontalSplitFormComponent title="Site" summary="Select a site">
        <SamplingPeriodSiteForm editData={editData?.survey_sample_site} />
      </HorizontalSplitFormComponent>

      <Divider sx={{ my: 5 }} />

      <HorizontalSplitFormComponent title="Period" summary="Enter period information">
        <SamplingPeriodPeriodFormContainer disableMultiplePeriods={editData !== undefined} />
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
            history.push(`/admin/projects/${projectId}/surveys/${surveyId}/sampling`);
          }}>
          Cancel
        </Button>
      </Stack>
    </>
  );
};
