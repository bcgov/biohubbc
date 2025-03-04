import LoadingButton from '@mui/lab/LoadingButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PageHeader from 'components/layout/PageHeader';
import { FormikProps } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { CreateHabitatFeatureFormValues, HabitatFeatureFormContainer } from '../components/HabitatFeatureFormContainer';

const initialHabitatFeatureFormValues: CreateHabitatFeatureFormValues = {
  habitat_feature_type_id: '' as unknown as number,
  latitude: '' as unknown as number,
  longitude: '' as unknown as number,
  count: '' as unknown as number,
  observed_date: '',
  observed_time: ''
};

export const CreateHabitatFeaturePage = (): JSX.Element => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formikRef = useRef<FormikProps<CreateHabitatFeatureFormValues>>(null);

  const handleSubmit = async (values: CreateHabitatFeatureFormValues) => {
    console.log({ values });
    try {
      setIsSubmitting(true);
      await biohubApi.habitatFeature.createSurveyHabitatFeatures(surveyContext.projectId, surveyContext.surveyId, [
        {
          habitat_feature_type_id: values.habitat_feature_type_id,
          survey_id: surveyContext.surveyId,
          latitude: values.latitude,
          longitude: values.longitude,
          count: values.count,
          observed_date: values.observed_date,
          observed_time: values.observed_time
        }
      ]);
    } catch (err) {
      // TODO: Mac: Update with a dialog
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={true} message={locationChangeInterceptor} />
      <PageHeader
        title="Create New Habitat Feature"
        breadCrumbJSX={
          <Breadcrumbs
            aria-label="breadcrumb"
            separator=">"
            sx={{
              typography: 'body2'
            }}>
            <Link
              component={RouterLink}
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/details`}
              underline="none">
              {projectContext.projectDataLoader.data?.projectData.project.project_name}
            </Link>
            <Link
              component={RouterLink}
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/details`}
              underline="none">
              {surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name}
            </Link>
            <Link
              component={RouterLink}
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/habitat-features/details`}
              underline="none">
              Manage Habitat Features
            </Link>
            <Typography component="span" variant="body2" color="textSecondary">
              Create New Habitat Feature
            </Typography>
          </Breadcrumbs>
        }
        buttonJSX={
          <Stack flexDirection="row" gap={1}>
            <LoadingButton
              loading={isSubmitting}
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}>
              Save and Exit
            </LoadingButton>
            <Button
              disabled={isSubmitting}
              color="primary"
              variant="outlined"
              onClick={() =>
                history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`)
              }>
              Cancel
            </Button>
          </Stack>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 5 }}>
          <HabitatFeatureFormContainer
            initialData={initialHabitatFeatureFormValues}
            handleSubmit={(formikData) => handleSubmit(formikData)}
            formikRef={formikRef}
          />
          <Stack mt={4} flexDirection="row" justifyContent="flex-end" gap={1}>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              onClick={() => {
                formikRef.current?.submitForm();
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
        </Paper>
      </Container>
    </>
  );
};
