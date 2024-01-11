import { LoadingButton } from '@mui/lab';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { CreateProjectDraftI18N, CreateProjectI18N, DeleteProjectDraftI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import ProjectDraftForm, {
  IProjectDraftForm,
  ProjectDraftFormYupSchema
} from 'features/projects/components/ProjectDraftForm';
import { FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useQuery } from 'hooks/useQuery';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Prompt } from 'react-router-dom';
import CreateProjectForm from './CreateProjectForm';
import grey from '@mui/material/colors/grey';

/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const CreateProjectPage: React.FC = () => {
  const history = useHistory();

  const biohubApi = useBiohubApi();

  const queryParams = useQuery();

  // Reference to pass to the formik component in order to access its state at any time
  // Used by the draft logic to fetch the values of a step form that has not been validated/completed
  const formikRef = useRef<FormikProps<ICreateProjectRequest>>(null);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const dialogContext = useContext(DialogContext);
  const codesContext = useContext(CodesContext);

  const codes = codesContext.codesDataLoader.data;
  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const draftId = Number(queryParams.draftId);

  const draftDataLoader = useDataLoader(() => {
    return biohubApi.draft.getDraft(draftId);
  });

  if (draftId) {
    draftDataLoader.load();
  }

  // Whether or not to show the 'Save as draft' dialog
  const [openDraftDialog, setOpenDraftDialog] = useState(false);
  const [openDeleteDraftDialog, setOpenDeleteDraftDialog] = useState(false);

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

  const showDeleteDraftErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: DeleteProjectDraftI18N.draftErrorTitle,
      dialogText: DeleteProjectDraftI18N.draftErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  const showDraftErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateProjectDraftI18N.draftErrorTitle,
      dialogText: CreateProjectDraftI18N.draftErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
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

  const handleSubmitDraft = async (values: IProjectDraftForm) => {
    try {
      let response;
      setIsLoading(true);

      // Get the form data for all steps
      // Fetch the data from the formikRef for whichever step is the active step
      // Why? WIP changes to the active step will not yet be updated into its respective stepForms[n].stepInitialValues

      if (draftId) {
        response = await biohubApi.draft.updateDraft(draftId, values.draft_name, formikRef.current?.values);
      } else {
        response = await biohubApi.draft.createDraft(values.draft_name, formikRef.current?.values);
      }

      setOpenDraftDialog(false);

      if (!response?.webform_draft_id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a draft project ID.'
        });
        setIsLoading(false);
        return;
      }

      setEnableCancelCheck(false);
      setIsLoading(false);
      history.push(`/admin/projects`);
    } catch (error) {
      setOpenDraftDialog(false);

      const apiError = error as APIError;
      showDraftErrorDialog({
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deletes the draft record used when creating this project, if one exists.
   *
   * @param {number} draftId
   * @returns {*}
   */
  const deleteDraft = async () => {
    if (!draftId) {
      return;
    }

    try {
      await biohubApi.draft.deleteDraft(draftId);
    } catch (error: any) {
      showDeleteDraftErrorDialog({ dialogError: error });
      return error;
    }
  };

  /**
   * Creates a new project record
   *
   * @param {ICreateProjectRequest} projectPostObject
   * @return {*}
   */
  const createProject = async (projectPostObject: ICreateProjectRequest) => {
    setIsLoading(true);
    const response = await biohubApi.project.createProject(projectPostObject);

    if (!response?.id) {
      showCreateErrorDialog({ dialogError: 'The response from the server was null, or did not contain a project ID.' });
      return;
    }

    await deleteDraft();

    setEnableCancelCheck(false);
    setIsLoading(false);
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

  const handleDeleteDraft = async () => {
    await deleteDraft();

    setEnableCancelCheck(false);

    history.push(`/admin/projects/`);
  };

  if (!codes || (draftId && !draftDataLoader.data)) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <EditDialog
        dialogTitle="Save Draft"
        dialogSaveButtonLabel="Save"
        open={openDraftDialog}
        component={{
          element: <ProjectDraftForm />,
          initialValues: {
            draft_name: formikRef.current?.values.project.project_name || draftDataLoader.data?.name || ''
          },
          validationSchema: ProjectDraftFormYupSchema
        }}
        onCancel={() => setOpenDraftDialog(false)}
        onSave={(values) => handleSubmitDraft(values)}
      />

      <YesNoDialog
        dialogTitle="Delete Draft Project?"
        dialogText="Are you sure you want to permanently delete this draft project? This action cannot be undone."
        open={openDeleteDraftDialog}
        yesButtonLabel="Delete Draft"
        yesButtonProps={{ color: 'error' }}
        noButtonLabel="Cancel"
        onClose={() => setOpenDeleteDraftDialog(false)}
        onNo={() => setOpenDeleteDraftDialog(false)}
        onYes={() => handleDeleteDraft()}
      />

      <Paper
        square
        elevation={0}
        sx={{
          py: 3,
          borderBottom: '1px solid' + grey[300]
        }}
      >
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
                ml: '-2px',
              }}>
              Create New Project
            </Typography>
            <Stack flexDirection="row" alignItems="center" gap={1}>
              
              {/* TODO: DEPRICATE DRAFT FUNCTIONALITY */}
              {/* <Button color="primary" variant="contained" onClick={() => setOpenDraftDialog(true)}>
                Save Draft
              </Button>
              {draftId ? (
                <Button color="primary" variant="outlined" onClick={() => setOpenDeleteDraftDialog(true)}>
                  Delete Draft
                </Button>
              ) : null} */}

              <LoadingButton
                loading={isLoading}
                type="submit"
                color="primary"
                variant="contained"
                onClick={() => formikRef.current?.submitForm()}
                data-testid="submit-project-button">
                Save and Exit
              </LoadingButton>
              <Button color="primary" variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        <Box py={3}>
          <Paper elevation={0}
            sx={{
              p: 5
            }}
          >

            <CreateProjectForm
              handleSubmit={createProject}
              codes={codes}
              formikRef={formikRef}
              initialValues={draftDataLoader.data?.data}
            />
            <Stack mt={4} flexDirection="row" justifyContent="flex-end" gap={1}>
              <LoadingButton
                loading={isLoading}
                type="submit"
                color="primary"
                variant="contained"
                onClick={() => formikRef.current?.submitForm()}
                data-testid="submit-project-button">
                Save and Exit
              </LoadingButton>

              {/* TODO: DEPRICATE DRAFT FUNCTIONALITY */}
              {/* <Button
                color="primary"
                variant="contained"
                onClick={() => setOpenDraftDialog(true)}
                data-testid="save-draft-button">
                Save Draft
              </Button>
              <Button
                color="primary"
                variant="outlined"
                onClick={() => setOpenDeleteDraftDialog(true)}
                data-testid="delete-draft-button">
                Delete Draft
              </Button> */}

              <Button color="primary" variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
            </Stack>

          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default CreateProjectPage;
