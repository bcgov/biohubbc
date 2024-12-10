import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateSamplingPeriodRequest } from 'interfaces/useSamplingPeriodApi.interface';
import { useEffect } from 'react';
import { useHistory } from 'react-router';
import { SamplingPeriodSiteForm } from '../components/sites/SamplePeriodSiteForm';
import SamplePeriodTechniqueForm from '../components/technique/SamplePeriodTechniqueForm';

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
  const biohubApi = useBiohubApi();

  const { submitForm } = useFormikContext<ICreateSamplingPeriodRequest>();

  const sampleSitesDataLoader = useDataLoader(() => biohubApi.samplingSite.getSampleSites(projectId, surveyId));

  useEffect(() => {
    sampleSitesDataLoader.load();
  }, [sampleSitesDataLoader]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        <HorizontalSplitFormComponent title="Technique" summary="Select the technique to create periods with">
          <SamplePeriodTechniqueForm />
        </HorizontalSplitFormComponent>

        <Divider sx={{ my: 5 }} />

        <HorizontalSplitFormComponent title="Sites" summary="Select sites to create periods for">
          <SamplingPeriodSiteForm sampleSites={sampleSitesDataLoader.data?.sampleSites ?? []} />
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
