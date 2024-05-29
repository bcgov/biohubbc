import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import { CreateProjectI18N } from 'constants/i18n';
import { PROJECT_ROLE } from 'constants/roles';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { FormikProps } from 'formik';
import * as History from 'history';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import {
  ICreateProjectRequest,
  IGetProjectParticipant,
  IUpdateProjectRequest
} from 'interfaces/useProjectApi.interface';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Prompt } from 'react-router-dom';
import { ProjectDetailsFormInitialValues } from '../components/ProjectDetailsForm';
import { ProjectIUCNFormInitialValues } from '../components/ProjectIUCNForm';
import { ProjectObjectivesFormInitialValues } from '../components/ProjectObjectivesForm';
import { ProjectUserRoleFormInitialValues } from '../components/ProjectUserForm';
import EditProjectForm from '../edit/EditProjectForm';

export const defaultProjectDataFormValues: ICreateProjectRequest = {
  ...ProjectDetailsFormInitialValues,
  ...ProjectObjectivesFormInitialValues,
  ...ProjectIUCNFormInitialValues,
  ...ProjectUserRoleFormInitialValues
};

/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const CreateProjectPage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const formikRef = useRef<FormikProps<ICreateProjectRequest>>(null);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const dialogContext = useContext(DialogContext);
  const codesContext = useContext(CodesContext);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const authStateContext = useAuthStateContext();

  const initialParticipants: IGetProjectParticipant[] = useMemo(() => {
    return [
      {
        system_user_id: authStateContext.simsUserWrapper?.systemUserId,
        display_name: authStateContext.simsUserWrapper?.displayName,
        email: authStateContext.simsUserWrapper?.email,
        agency: authStateContext.simsUserWrapper?.agency,
        identity_source: authStateContext.simsUserWrapper?.identitySource,
        project_role_names: [PROJECT_ROLE.COORDINATOR]
      } as IGetProjectParticipant
    ];
  }, [authStateContext.simsUserWrapper]);

  const initialProjectData: ICreateProjectRequest = useMemo(() => {
    return {
      ...defaultProjectDataFormValues,
      participants: initialParticipants
    };
  }, [initialParticipants]);

  const defaultCancelDialogProps = {
    dialogTitle: CreateProjectI18N.cancelTitle,
    dialogText: CreateProjectI18N.cancelText,
    open: false,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history.push('/admin/projects');
    }
  };

  const defaultErrorDialogProps = {
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateProjectI18N.createErrorTitle,
      dialogText: CreateProjectI18N.createErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push('/admin/projects');
  };

  /**
   * Creates a new project record
   *
   * @param {ICreateProjectRequest} projectPostObject
   * @return {*}
   */
  const createProject = async (projectPostObject: ICreateProjectRequest) => {
    setIsSaving(true);
    try {
      const response = await biohubApi.project.createProject(projectPostObject);

      if (!response?.id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a project ID.'
        });
        return;
      }

      setEnableCancelCheck(false);
      
      history.push(`/admin/projects/${response.id}`);
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

  if (!codesContext.codesDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <PageHeader
        title="Create New Project"
        buttonJSX={
          <>
            <LoadingButton
              loading={isSaving}
              type="submit"
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}
              data-testid="submit-project-button">
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
          <EditProjectForm
            initialProjectData={initialProjectData}
            handleSubmit={(formikData) => createProject(formikData as ICreateProjectRequest)}
            formikRef={formikRef as unknown as React.RefObject<FormikProps<IUpdateProjectRequest>>}
          />
          <Stack mt={4} flexDirection="row" justifyContent="flex-end" gap={1}>
            <LoadingButton
              loading={isSaving}
              type="submit"
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}
              data-testid="submit-project-button">
              Save and Exit
            </LoadingButton>
            <Button disabled={isSaving} color="primary" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};

export default CreateProjectPage;
