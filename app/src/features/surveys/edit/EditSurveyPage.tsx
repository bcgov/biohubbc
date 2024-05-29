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
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import EditSurveyForm from './EditSurveyForm';

/**
 * Page to create a survey.
 *
 * @return {*}
 */
const EditSurveyPage = () => {
  const biohubApi = useBiohubApi();
  const history = useHistory();
  const urlParams: Record<string, string | number | undefined> = useParams();

  const surveyId = Number(urlParams['survey_id']);

  const formikRef = useRef<FormikProps<IEditSurveyRequest>>(null);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  const editSurveyDataLoader = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.survey.getSurveyForUpdate(projectId, surveyId)
  );

  if (surveyId) {
    editSurveyDataLoader.load(projectContext.projectId, surveyId);
  }

  const surveyData = editSurveyDataLoader.data?.surveyData;

  const getCancelDialogProps = (pathname: string) => {
    return {
      dialogTitle: EditSurveyI18N.cancelTitle,
      dialogText: EditSurveyI18N.cancelText,
      open: true,
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onYes: () => {
        dialogContext.setYesNoDialog({ open: false });
        history.push(pathname);
      }
    };
  };

  const handleCancel = () => {
    dialogContext.setYesNoDialog(getCancelDialogProps('details'));
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
        permit: values.permit,
        proprietor: values.proprietor,
        purpose_and_methodology: values.purpose_and_methodology,
        site_selection: {
          stratums: values.site_selection.stratums.map((stratum) => ({
            survey_stratum_id: stratum.survey_stratum_id,
            name: stratum.name,
            description: stratum.description
          })),
          strategies: values.site_selection.strategies
        },
        species: values.species,
        survey_details: values.survey_details
      });

      if (!response?.id) {
        showEditErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a survey ID.'
        });
        return;
      }

      setEnableCancelCheck(false);

      surveyContext.surveyDataLoader.refresh(projectContext.projectId, surveyContext.surveyId);

      history.push(`/admin/projects/${projectContext.projectId}/surveys/${response.id}/details`);
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

  /**
   * Intercepts all navigation attempts (when used with a `Prompt`).
   *
   * Returning true allows the navigation, returning false prevents it.
   *
   * @param {History.Location} location
   * @return {*}
   */
  const handleLocationChange = (location: History.Location) => {
    // If the form is currently saving: allow it
    if (isSaving) {
      return true;
    }

    // If the dialog is not currently open and location is trying to change: open dialog
    if (!dialogContext.yesNoDialogProps.open) {
      dialogContext.setYesNoDialog(getCancelDialogProps(location.pathname));
      return false;
    }

    return true;
  };

  if (!codesContext.codesDataLoader.data || !projectContext.projectDataLoader.data || !surveyData) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
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
          <EditSurveyForm initialSurveyData={surveyData} handleSubmit={handleSubmit} formikRef={formikRef} />
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
