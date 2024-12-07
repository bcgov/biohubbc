import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { useHistory } from 'react-router';
import { IEditSamplePeriodFormData } from '../../edit/EditSamplePeriodPage';
import SamplePeriodPeriodFormContainer from '../components/sites/periods/SamplePeriodPeriodFormContainer';
import SamplePeriodTechniqueForm, { PartialTechnique } from '../components/technique/SamplePeriodTechniqueForm';

interface IEditSamplePeriodFormProps {
  isSubmitting: boolean;
  initialTechnique: PartialTechnique;
}

/**
 * Renders sampling site create form.
 *
 * @param {IEditSamplePeriodFormProps} props
 * @returns {*}
 */
const EditSamplePeriodForm = (props: IEditSamplePeriodFormProps) => {
  const { isSubmitting, initialTechnique } = props;

  const { projectId, surveyId } = useSurveyContext();
  const history = useHistory();

  const { submitForm, values } = useFormikContext<IEditSamplePeriodFormData>();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        <HorizontalSplitFormComponent title="Technique" summary="Select a new technique to edit the technique">
          <SamplePeriodTechniqueForm initialValue={initialTechnique} />
        </HorizontalSplitFormComponent>

        <Divider sx={{ my: 5 }} />

        <HorizontalSplitFormComponent title="Period" summary="Change the start and end times to edit the period">
          <SamplePeriodPeriodFormContainer
            formikFieldName={`sample_site.sample_periods`}
            site={{ survey_sample_site_id: values.sample_site.survey_sample_site_id, name: values.sample_site.name }}
            index={0}
            samplePeriods={values.sample_site.sample_periods}
          />
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

export default EditSamplePeriodForm;
