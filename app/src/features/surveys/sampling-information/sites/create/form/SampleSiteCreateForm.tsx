import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { SamplingSiteMethodYupSchema } from 'features/surveys/sampling-information/methods/components/SamplingMethodForm';
import { SamplingMethodFormContainer } from 'features/surveys/sampling-information/methods/SamplingMethodFormContainer';
import { SamplingSiteMethodPeriodYupSchema } from 'features/surveys/sampling-information/periods/SamplingPeriodFormContainer';
import { SamplingSiteGroupingsForm } from 'features/surveys/sampling-information/sites/components/site-groupings/SamplingSiteGroupingsForm';
import { ICreateSampleSiteFormData } from 'features/surveys/sampling-information/sites/create/CreateSamplingSitePage';
import { SampleSiteImportForm } from 'features/surveys/sampling-information/sites/create/form/SampleSiteImportForm';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { useHistory } from 'react-router';
import yup from 'utils/YupSchema';

export const SampleSiteCreateFormYupSchema = yup.object({
  survey_sample_sites: yup
    .array(
      yup.object({
        name: yup.string().default(''),
        description: yup.string().default(''),
        geojson: yup.object({})
      })
    )
    .min(1, 'At least one sampling site location is required'),
  sample_methods: yup
    .array()
    .of(
      SamplingSiteMethodYupSchema.shape({
        sample_periods: yup
          .array()
          .of(SamplingSiteMethodPeriodYupSchema)
          .min(
            1,
            'At least one sampling period is required for each method, describing when exactly this method was done'
          )
      })
    ) // Ensure each item in the array conforms to SamplingSiteMethodYupSchema
    .min(1, 'At least one sampling method is required') // Add check for at least one item in the array
});

interface ISampleSiteCreateFormProps {
  isSubmitting: boolean;
}

/**
 * Renders sampling site create form.
 *
 * @param {ISampleSiteCreateFormProps} props
 * @returns {*}
 */
const SampleSiteCreateForm = (props: ISampleSiteCreateFormProps) => {
  const { isSubmitting } = props;

  const history = useHistory();
  const { submitForm } = useFormikContext<ICreateSampleSiteFormData>();

  const surveyContext = useSurveyContext();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        <Stack gap={5}>
          <HorizontalSplitFormComponent
            title="Site Location"
            summary="Import or draw sampling site locations used for this survey.">
            <SampleSiteImportForm />
          </HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="Sampling Techniques"
            summary="Specify sampling techniques that were used to collect data.">
            <SamplingMethodFormContainer />
          </HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="Sampling Site Groupings"
            summary="Group similar sites by assigning them to groups or strata, which you can add when creating or editing your Survey.">
            <SamplingSiteGroupingsForm />
          </HorizontalSplitFormComponent>

          <Divider />

          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={1}>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              onClick={() => {
                submitForm();
              }}>
              Save and Exit
            </LoadingButton>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`);
              }}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default SampleSiteCreateForm;
