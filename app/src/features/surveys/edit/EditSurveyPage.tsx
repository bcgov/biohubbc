import { LoadingButton } from '@mui/lab';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import { EditSurveyI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { SurveyContext } from 'contexts/surveyContext';
import { FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import EditSurveyForm from './EditSurveyForm';

/**
 * Page to create a survey.
 *
 * @returns {*}
 */
const EditSurveyPage = () => {
  const biohubApi = useBiohubApi();
  const history = useHistory();
  const urlParams: Record<string, string | number | undefined> = useParams();

  const surveyId = Number(urlParams['survey_id']);

  const formikRef = useRef<FormikProps<IEditSurveyRequest>>(null);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const dialogContext = useContext(DialogContext);
  const codesContext = useContext(CodesContext);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const projectContext = useContext(ProjectContext);

  useEffect(() => {
    projectContext.projectDataLoader.load(projectContext.projectId);
  }, [projectContext.projectDataLoader, projectContext.projectId]);

  const surveyContext = useContext(SurveyContext);

  const getSurveyForUpdateDataLoader = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.survey.getSurveyForUpdate(projectId, surveyId)
  );

  if (surveyId) {
    getSurveyForUpdateDataLoader.load(projectContext.projectId, surveyId);
  }

  const surveyData = getSurveyForUpdateDataLoader.data?.surveyData;

  const handleCancel = () => {
    history.push('details');
  };

  const showEditErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: EditSurveyI18N.createErrorTitle,
      dialogText: EditSurveyI18N.createErrorText,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps,
      open: true
    });
  };

  /**
   * Handle creation of surveys.
   *
   * @return {*}
   */
  const handleSubmit = async (values: IEditSurveyRequest) => {
    setIsSaving(true);

    try {
      // Remove the permit_used and funding_used properties
      const response = await biohubApi.survey.updateSurvey(projectContext.projectId, surveyId, {
        blocks: values.blocks,
        funding_sources: values.funding_sources,
        locations: values.locations.map((location) => ({
          survey_location_id: location.survey_location_id,
          geojson: location.geojson,
          name: location.name,
          description: location.description,
          revision_count: location.revision_count
        })),
        participants: values.participants,
        partnerships: values.partnerships,
        permit: {
          permits: values.permit.permits
        },
        proprietor: values.proprietor,
        site_selection: {
          stratums: values.site_selection.stratums.map((stratum) => ({
            survey_stratum_id: stratum.survey_stratum_id,
            name: stratum.name,
            description: stratum.description
          })),
          strategies: values.site_selection.strategies
        },
        species: values.species,
        survey_details: values.survey_details,
        purpose_and_methodology: values.purpose_and_methodology,
        agreements: values.agreements
      });

      if (!response?.id) {
        showEditErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a survey ID.'
        });
        return;
      }

      setEnableCancelCheck(false);

      surveyContext.surveyDataLoader.refresh(projectContext.projectId, surveyContext.surveyId);

      history.push(
        `/admin/projects/${projectContext.projectId}/surveys/${response.id}/details`,
        SKIP_CONFIRMATION_DIALOG
      );
    } catch (error) {
      const apiError = error as APIError;
      showEditErrorDialog({
        dialogTitle: 'Error Creating Survey',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!codesContext.codesDataLoader.data || !projectContext.projectDataLoader.data || !surveyData) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={locationChangeInterceptor} />
      <PageHeader
        title="Edit Survey Details"
        breadCrumbJSX={
          <Breadcrumbs aria-label="breadcrumb" separator={'>'}>
            <Link component={RouterLink} underline="hover" to={`/admin/projects/${projectContext.projectId}/`}>
              {projectContext.projectDataLoader.data.projectData.project.project_name}
            </Link>
            <Link
              component={RouterLink}
              underline="hover"
              to={`/admin/projects/${projectContext.projectId}/surveys/${surveyId}/details`}>
              {surveyData && surveyData.survey_details && surveyData.survey_details.survey_name}
            </Link>
            <Typography component="a" color="textSecondary" aria-current="page">
              Edit Survey Details
            </Typography>
          </Breadcrumbs>
        }
        buttonJSX={
          <>
            <LoadingButton
              loading={isSaving}
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}>
              Save and Exit
            </LoadingButton>
            <Button disabled={isSaving} color="primary" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 5 }}>
          <EditSurveyForm
            // Add the permit_used and funding_used properties
            initialSurveyData={{
              survey_details: surveyData.survey_details,
              purpose_and_methodology: surveyData.purpose_and_methodology,
              species: surveyData.species,
              site_selection: surveyData.site_selection,
              locations: surveyData.locations,
              participants: surveyData.participants,
              partnerships: surveyData.partnerships,
              blocks: surveyData.blocks,
              proprietor: surveyData.proprietor,
              permit: surveyData.permit,
              permit_used: Boolean(surveyData.permit?.permits.length),
              funding_sources: surveyData.funding_sources,
              funding_used: Boolean(surveyData.funding_sources?.length),
              agreements: surveyData.agreements
            }}
            handleSubmit={handleSubmit}
            formikRef={formikRef}
          />
          <Stack mt={4} flexDirection="row" justifyContent="flex-end" gap={1}>
            <LoadingButton
              loading={isSaving}
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => {
                formikRef.current?.submitForm();
              }}>
              Save and Exit
            </LoadingButton>
            <Button disabled={isSaving} variant="outlined" color="primary" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};

export default EditSurveyPage;
