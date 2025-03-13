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
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useHabitatFeatureTableContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import {
  HabitatFeatureFormContainer,
  UpdateHabitatFeatureFormValues
} from '../components/forms/HabitatFeatureFormContainer';

/**
 * Page for editing a habitat feature.
 *
 * @return {*} {JSX.Element}
 */
export const EditHabitatFeaturePage = (): JSX.Element => {
  const biohubApi = useBiohubApi();
  const history = useHistory();
  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();
  const habitatFeatureContext = useHabitatFeatureTableContext();
  const dialogContext = useDialogContext();

  const urlParams = useParams<Record<string, string | undefined>>();
  const habitatFeatureId = Number(urlParams.habitat_feature_id);

  const { locationChangeInterceptor, skipUnsavedChangesDialog } = useUnsavedChangesDialog();

  const formikRef = useRef<FormikProps<UpdateHabitatFeatureFormValues>>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const habitatFeatureDataLoader = useDataLoader(() =>
    biohubApi.habitatFeature.getSurveyHabitatFeature(surveyContext.projectId, surveyContext.surveyId, habitatFeatureId)
  );

  useEffect(() => {
    habitatFeatureDataLoader.load();
  }, [habitatFeatureDataLoader]);

  if (
    !surveyContext.surveyDataLoader.data ||
    !projectContext.projectDataLoader.data ||
    !habitatFeatureDataLoader.data ||
    habitatFeatureDataLoader.isLoading
  ) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const initialHabitatFeatureFormValues: UpdateHabitatFeatureFormValues = {
    habitat_feature_type_id: habitatFeatureDataLoader.data.surveyHabitatFeature.habitat_feature_type_id,
    latitude: habitatFeatureDataLoader.data.surveyHabitatFeature.latitude,
    longitude: habitatFeatureDataLoader.data.surveyHabitatFeature.longitude,
    count: habitatFeatureDataLoader.data.surveyHabitatFeature.count,
    observed_date: habitatFeatureDataLoader.data.surveyHabitatFeature.observed_date,
    observed_time: habitatFeatureDataLoader.data.surveyHabitatFeature.observed_time,
    survey_habitat_feature_taxons: habitatFeatureDataLoader.data.surveyHabitatFeature.survey_habitat_feature_taxons.map(
      (taxon) => ({
        itis_tsn: taxon.itis_tsn,
        itis_scientific_name: taxon.itis_scientific_name,
        comment: taxon.comment
      })
    )
  };

  /**
   * Handle the create habitat feature form submission.
   *
   * @param {UpdateHabitatFeatureFormValues} values
   * @returns {*} {Promise<void>}
   */
  const handleSubmit = async (values: UpdateHabitatFeatureFormValues): Promise<void> => {
    try {
      setIsSubmitting(true);
      await biohubApi.habitatFeature.updateSurveyHabitatFeature(
        surveyContext.projectId,
        surveyContext.surveyId,
        habitatFeatureId,
        {
          habitat_feature_type_id: values.habitat_feature_type_id,
          latitude: values.latitude,
          longitude: values.longitude,
          count: values.count,
          observed_date: values.observed_date,
          observed_time: values.observed_time,
          survey_habitat_feature_taxons: values.survey_habitat_feature_taxons.map((formTaxon) => ({
            itis_tsn: formTaxon.itis_tsn,
            itis_scientific_name: formTaxon.itis_scientific_name,
            comment: formTaxon.comment
          }))
        }
      );

      habitatFeatureContext.refreshHabitatFeatureRecords();

      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: 'Successfully updated habitat feature'
      });

      skipUnsavedChangesDialog();
      history.goBack();
    } catch (error) {
      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: 'Error editing habitat feature',
        dialogText: 'An error occurred while editing the habitat feature',
        dialogError: error instanceof Error ? error.message : undefined,
        dialogErrorDetails: error instanceof APIError ? error.errors : undefined,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Prompt when={true} message={locationChangeInterceptor} />
      <PageHeader
        title="Edit Habitat Feature"
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
              Edit Habitat Feature
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
