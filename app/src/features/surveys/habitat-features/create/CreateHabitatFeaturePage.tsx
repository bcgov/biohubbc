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
import { DialogContext } from 'contexts/dialogContext';
import { FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useHabitatFeatureTableContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { useContext, useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import {
  CreateHabitatFeatureFormValues,
  HabitatFeatureFormContainer
} from '../components/forms/HabitatFeatureFormContainer';

const initialHabitatFeatureFormValues: CreateHabitatFeatureFormValues = {
  habitat_feature_type_id: '' as unknown as number,
  latitude: '' as unknown as number,
  longitude: '' as unknown as number,
  count: '' as unknown as number,
  observed_date: '',
  observed_time: ''
};

/**
 * Page for creating a new habitat feature.
 *
 * @return {*} {JSX.Element}
 */
export const CreateHabitatFeaturePage = (): JSX.Element => {
  const biohubApi = useBiohubApi();
  const history = useHistory();
  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();
  const habitatFeatureContext = useHabitatFeatureTableContext();
  const dialogContext = useContext(DialogContext);

  const { locationChangeInterceptor, skipUnsavedChangesDialog } = useUnsavedChangesDialog();

  const formikRef = useRef<FormikProps<CreateHabitatFeatureFormValues>>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle the create habitat feature form submission.
   *
   * @param {CreateHabitatFeatureFormValues} values
   * @returns {*} {Promise<void>}
   */
  const handleSubmit = async (values: CreateHabitatFeatureFormValues): Promise<void> => {
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

      habitatFeatureContext.refreshData();

      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: 'Successfully created habitat feature'
      });

      skipUnsavedChangesDialog();
      history.goBack();
    } catch (error) {
      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: 'Error creating habitat feature',
        dialogText: 'An error occurred while creating the habitat feature',
        dialogError: error instanceof Error ? error.message : undefined,
        dialogErrorDetails: error instanceof APIError ? error.errors : undefined
      });
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
        title="Create Habitat Feature"
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
            <Button disabled={isSubmitting} color="primary" variant="outlined" onClick={() => history.goBack()}>
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
                history.goBack();
              }}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};
