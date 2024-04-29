import { LoadingButton } from '@mui/lab';
import { Button, Divider, Paper } from '@mui/material';
import { Container, Stack } from '@mui/system';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import SamplingMethodForm from 'features/surveys/observations/sampling-sites/create/form/SamplingMethodForm';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { ICreateSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';
import { useHistory } from 'react-router';
import SamplingSiteGroupingsForm from '../../components/SamplingSiteGroupingsForm';
import SurveySamplingSiteImportForm from 'features/surveys/components/locations/SurveySamplingSiteImportForm';

interface ISampleSiteCreateFormProps {
  isSubmitting: boolean;
}

const SampleSiteCreateForm = (props: ISampleSiteCreateFormProps) => {
  const { isSubmitting } = props;

  const history = useHistory();
  const { submitForm } = useFormikContext<ICreateSamplingSiteRequest>();

  const surveyContext = useSurveyContext();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        <Stack gap={5}>
          <HorizontalSplitFormComponent
            title="Site Location"
            summary="Import or draw sampling site locations used for this survey."
            component={<SurveySamplingSiteImportForm />}></HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="Sampling Methods"
            summary="Specify sampling methods that were used to collect data."
            component={<SamplingMethodForm />}></HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="Sampling Site Groupings"
            summary="Group similar sites by assigning them to groups or strata, 
                    which you can add when creating or editing your Survey."
            component={<SamplingSiteGroupingsForm />}></HorizontalSplitFormComponent>

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
                history.push(
                  `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/observations`
                );
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
