import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
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
import { CreateSurveyI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { SurveyPartnershipsFormInitialValues } from 'features/surveys/view/components/SurveyPartnershipsForm';
import { FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICreateSurveyRequest, IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { AgreementsInitialValues } from './components/AgreementsForm';
import { GeneralInformationInitialValues } from './components/GeneralInformationForm';
import { ProprietaryDataInitialValues } from './components/ProprietaryDataForm';
import { PurposeAndMethodologyInitialValues } from './components/PurposeAndMethodologyForm';
import { SurveyLocationInitialValues } from './components/StudyAreaForm';
import { SurveyBlockInitialValues } from './components/SurveyBlockSection';
import { SurveyFundingSourceFormInitialValues } from './components/SurveyFundingSourceForm';
import { SurveySiteSelectionInitialValues } from './components/SurveySiteSelectionForm';
import { SurveyUserJobFormInitialValues } from './components/SurveyUserForm';
import EditSurveyForm from './edit/EditSurveyForm';

export const defaultSurveyDataFormValues: ICreateSurveyRequest = {
  ...GeneralInformationInitialValues,
  ...PurposeAndMethodologyInitialValues,
  ...SurveyFundingSourceFormInitialValues,
  ...SurveyPartnershipsFormInitialValues,
  ...ProprietaryDataInitialValues,
  ...AgreementsInitialValues,
  ...SurveyLocationInitialValues,
  ...SurveySiteSelectionInitialValues,
  ...SurveyUserJobFormInitialValues,
  ...SurveyBlockInitialValues
};

/**
 * Page to create a survey.
 *
 * @return {*}
 */
const CreateSurveyPage = () => {
  console.log('defaultSurveyDataFormValues.participants:', defaultSurveyDataFormValues.participants)
  const biohubApi = useBiohubApi();
  const history = useHistory();

  const codesContext = useContext(CodesContext);
  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);
  const codes = codesContext.codesDataLoader.data;

  const projectContext = useContext(ProjectContext);
  useEffect(() => {
    projectContext.projectDataLoader.load(projectContext.projectId);
  }, [projectContext.projectDataLoader, projectContext.projectId]);
  const projectData = projectContext.projectDataLoader.data?.projectData;

  const formikRef = useRef<FormikProps<IEditSurveyRequest>>(null);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  const dialogContext = useContext(DialogContext);

  const defaultCancelDialogProps = {
    dialogTitle: CreateSurveyI18N.cancelTitle,
    dialogText: CreateSurveyI18N.cancelText,
    open: false,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history.push(`/admin/projects/${projectData?.project.project_id}`);
    }
  };

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${projectData?.project.project_id}`);
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateSurveyI18N.createErrorTitle,
      dialogText: CreateSurveyI18N.createErrorText,
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
  const handleSubmit = async (values: ICreateSurveyRequest) => {
    setIsSaving(true);
    try {
      const response = await biohubApi.survey.createSurvey(Number(projectData?.project.project_id), values);

      if (!response?.id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a survey ID.'
        });
        return;
      }

      setEnableCancelCheck(false);

      history.push(`/admin/projects/${projectData?.project.project_id}/surveys/${response.id}/details`);
    } catch (error) {
      const apiError = error as APIError;
      showCreateErrorDialog({
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
  const handleLocationChange = (location: History.Location, action: History.Action) => {
    if (!dialogContext.yesNoDialogProps.open) {
      // If the cancel dialog is not open: open it
      dialogContext.setYesNoDialog({
        ...defaultCancelDialogProps,
        onYes: () => {
          dialogContext.setYesNoDialog({ open: false });
          history.push(location.pathname);
        },
        open: true
      });
      return false;
    }

    // If the cancel dialog is already open and another location change action is triggered: allow it
    return true;
  };

  if (!codes || !projectData) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <PageHeader
        title="Create New Survey"
        breadCrumbJSX={
          <Breadcrumbs aria-label="breadcrumb" separator={'>'}>
            <Link component={RouterLink} underline="hover" to={`/admin/projects/${projectData.project.project_id}/`}>
              {projectData.project.project_name}
            </Link>
            <Typography variant="body2" component="span" color="textSecondary" aria-current="page">
              Create New Survey
            </Typography>
          </Breadcrumbs>
        }
        buttonJSX={
          <Stack flexDirection="row" gap={1}>
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
          </Stack>
        }
      />

      <Box my={3}>
        <Container maxWidth="xl">
          <Box p={5} component={Paper} display="block">
            <EditSurveyForm
              initialSurveyData={defaultSurveyDataFormValues}
              handleSubmit={(formikData) => handleSubmit(formikData as unknown as ICreateSurveyRequest)}
              formikRef={formikRef}
            />
            <Stack mt={5} flexDirection="row" justifyContent="flex-end" gap={1}>
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
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default CreateSurveyPage;
