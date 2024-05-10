import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import { EditProjectI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { FormikProps } from 'formik';
import * as History from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IUpdateProjectRequest, UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Prompt } from 'react-router-dom';
import { defaultProjectDataFormValues } from '../create/CreateProjectPage';
import EditProjectForm from './EditProjectForm';

/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const EditProjectPage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const formikRef = useRef<FormikProps<IUpdateProjectRequest>>(null);

  const { projectId } = useContext(ProjectContext);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const dialogContext = useContext(DialogContext);
  const codesContext = useContext(CodesContext);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const editProjectDataLoader = useDataLoader((projectId: number) =>
    biohubApi.project.getProjectForUpdate(projectId, [
      UPDATE_GET_ENTITIES.project,
      UPDATE_GET_ENTITIES.objectives,
      UPDATE_GET_ENTITIES.iucn,
      UPDATE_GET_ENTITIES.participants
    ])
  );

  if (projectId) {
    editProjectDataLoader.load(projectId);
  }

  const defaultCancelDialogProps = {
    dialogTitle: EditProjectI18N.cancelTitle,
    dialogText: EditProjectI18N.cancelText,
    open: false,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history.push(`/admin/projects/${projectId}`);
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
      dialogTitle: EditProjectI18N.createErrorTitle,
      dialogText: EditProjectI18N.createErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${projectId}`);
  };

  /**
   * Creates a new project record
   *
   * @param {IUpdateProjectRequest} projectPostObject
   * @return {*}
   */
  const updateProject = async (projectPostObject: IUpdateProjectRequest) => {
    setIsSaving(true);
    try {
      const response = await biohubApi.project.updateProject(projectId, projectPostObject);

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

  if (!codesContext.codesDataLoader.data || !editProjectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <PageHeader
        title="Edit Project Details"
        buttonJSX={
          <>
            <LoadingButton
              loading={isSaving}
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}>
              Save Project
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
            initialProjectData={editProjectDataLoader.data ?? defaultProjectDataFormValues}
            handleSubmit={updateProject}
            formikRef={formikRef}
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

export default EditProjectPage;
