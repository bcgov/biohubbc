import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { SamplingSiteMethodYupSchema } from 'features/surveys/sampling-information/methods/components/SamplingMethodForm';
import { SamplingSiteMethodPeriodYupSchema } from 'features/surveys/sampling-information/periods/form/SamplingPeriodFormContainer';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { ICreateSamplingPeriodRequest } from 'interfaces/useSamplingPeriodApi.interface';
import { useHistory } from 'react-router';
import yup from 'utils/YupSchema';
import SamplePeriodGeneralInformationForm from './general-information/SamplePeriodGeneralInformationForm';
import { SamplingPeriodPeriodForm } from './periods/SamplePeriodPeriodForm';

export const CreateSamplePeriodFormYupSchema = yup.object({
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

interface ICreateSamplePeriodFormProps {
  isSubmitting: boolean;
}

/**
 * Renders sampling site create form.
 *
 * @param {ICreateSamplePeriodFormProps} props
 * @returns {*}
 */
const CreateSamplePeriodForm = (props: ICreateSamplePeriodFormProps) => {
  const { isSubmitting } = props;

  const { projectId, surveyId } = useSurveyContext();
  const history = useHistory();

  const { submitForm } = useFormikContext<ICreateSamplingPeriodRequest>();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        <HorizontalSplitFormComponent
          title="General Information"
          summary="Select the site and technique to create periods for">
          <SamplePeriodGeneralInformationForm />
        </HorizontalSplitFormComponent>

        <Divider sx={{ my: 5 }} />

        <HorizontalSplitFormComponent title="Periods" summary="Enter periods by specifying start and end times">
          <SamplingPeriodPeriodForm />
        </HorizontalSplitFormComponent>

        <Divider sx={{ my: 5 }} />

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
              history.push(`/admin/projects/${projectId}/surveys/${surveyId}/sampling`);
            }}>
            Cancel
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default CreateSamplePeriodForm;
