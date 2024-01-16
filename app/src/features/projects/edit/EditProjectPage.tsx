import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditProjectI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { FormikProps } from 'formik';
import * as History from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IUpdateProjectRequest, UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Prompt } from 'react-router-dom';
import EditProjectForm from './EditProjectForm';

/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const EditProjectPage: React.FC = (props) => {
  const history = useHistory();

  const biohubApi = useBiohubApi();

  const { projectId } = useContext(ProjectContext);

  // Reference to pass to the formik component in order to access its state at any time
  // Used by the draft logic to fetch the values of a step form that has not been validated/completed
  const formikRef = useRef<FormikProps<IUpdateProjectRequest>>(null);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  const dialogContext = useContext(DialogContext);

  const codesDataLoader = useDataLoader(() => biohubApi.codes.getAllCodeSets());
  codesDataLoader.load();

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

  useEffect(() => {
    const setFormikValues = (data: IUpdateProjectRequest) => {
      formikRef.current?.setValues(data);
    };

    if (editProjectDataLoader.data) {
      setFormikValues(editProjectDataLoader.data);
    }
  }, [editProjectDataLoader]);

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
    const response = await biohubApi.project.updateProject(projectId, projectPostObject);

    if (!response?.id) {
      showCreateErrorDialog({ dialogError: 'The response from the server was null, or did not contain a project ID.' });
      return;
    }

    setEnableCancelCheck(false);

    history.push(`/admin/projects/${response.id}`);
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

  if (!codesDataLoader.data || !editProjectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />

      <Paper
        square
        elevation={0}
        sx={{
          py: 3,
          borderBottom: '1px solid' + grey[300]
        }}>
        <Container maxWidth="xl">
          <Stack
            alignItems="flex-start"
            flexDirection={{ xs: 'column', lg: 'row' }}
            justifyContent="space-between"
            gap={3}>
            <Typography
              component="h1"
              variant="h2"
              sx={{
                ml: '-2px'
              }}>
              Edit Project Details
            </Typography>
            <Stack flexDirection="row" alignItems="center" gap={1}>
              <Button color="primary" variant="contained" onClick={() => formikRef.current?.submitForm()}>
                Save Project
              </Button>
              <Button color="primary" variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        <Box py={3}>
          <Paper elevation={0}>
            <EditProjectForm
              codes={codesDataLoader.data}
              projectData={editProjectDataLoader.data}
              handleSubmit={updateProject}
              handleCancel={handleCancel}
              formikRef={formikRef}
            />
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default EditProjectPage;
