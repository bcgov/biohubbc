import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { CreateProjectDraftI18N, CreateProjectI18N, DeleteProjectDraftI18N } from 'constants/i18n';
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

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  pageTitleContainer: {
    maxWidth: '170ch',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  pageTitle: {
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    overflow: 'hidden'
  },
  pageTitleActions: {
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.75),
    '& button': {
      marginLeft: theme.spacing(1)
    }
  }
}));

/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const CreateProjectPage: React.FC = () => {
  const classes = useStyles();

  const history = useHistory();

  const biohubApi = useBiohubApi();

  const queryParams = useQuery();

  // Reference to pass to the formik component in order to access its state at any time
  // Used by the draft logic to fetch the values of a step form that has not been validated/completed
  const formikRef = useRef<FormikProps<ICreateProjectRequest>>(null);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  const dialogContext = useContext(DialogContext);

  const codesDataLoader = useDataLoader(() => biohubApi.codes.getAllCodeSets());
  codesDataLoader.load();

  const draftId = Number(queryParams.draftId);

  const formData = formikRef?.current?.values;

  const draftDataLoader = useDataLoader(() => {
    return biohubApi.draft.getDraft(draftId);
  });

  if (draftId) {
    draftDataLoader.load();
  }

  useEffect(() => {
    const setFormikValues = (data: ICreateProjectRequest) => {
      if (formikRef.current) {
        formikRef.current?.setValues(data);
      }
    };

    if (draftDataLoader.data?.data) {
      setFormikValues(draftDataLoader.data.data);
    }
  }, [draftDataLoader.data, formikRef]);

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

      // Get the form data for all steps
      // Fetch the data from the formikRef for whichever step is the active step
      // Why? WIP changes to the active step will not yet be updated into its respective stepForms[n].stepInitialValues

      if (draftId) {
        response = await biohubApi.draft.updateDraft(draftId, values.draft_name, formData);
      } else {
        response = await biohubApi.draft.createDraft(values.draft_name, formData);
        console.log('create response: ', response);
      }

      setOpenDraftDialog(false);

      if (!response?.webform_draft_id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a draft project ID.'
        });

        return;
      }

      setEnableCancelCheck(false);

      history.push(`/admin/projects`);
    } catch (error) {
      setOpenDraftDialog(false);

      const apiError = error as APIError;
      showDraftErrorDialog({
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
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
    const response = await biohubApi.project.createProject(projectPostObject);

    if (!response?.id) {
      showCreateErrorDialog({ dialogError: 'The response from the server was null, or did not contain a project ID.' });
      return;
    }

    await deleteDraft();

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

  const handleDeleteDraft = async () => {
    await deleteDraft();

    setEnableCancelCheck(false);

    history.push(`/admin/projects/`);
  };

  if (!codesDataLoader.data || (draftId && !draftDataLoader.data)) {
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
        dialogTitle="Delete Draft"
        dialogText="Are you sure you want to delete this draft?"
        open={openDeleteDraftDialog}
        onClose={() => setOpenDeleteDraftDialog(false)}
        onNo={() => setOpenDeleteDraftDialog(false)}
        onYes={() => handleDeleteDraft()}
      />

      <Paper square={true} elevation={0}>
        <Container maxWidth="xl">
          <Box py={4} display="flex" justifyContent="space-between">
            <Box display="flex" justifyContent="space-between">
              <Box className={classes.pageTitleContainer}>
                <Typography variant="h1" className={classes.pageTitle}>
                  Create Project
                </Typography>
                <Box mt={0.75} mb={0.5} display="flex" alignItems="center">
                  <Typography component="span" variant="subtitle1" color="textSecondary">
                    Configure and submit a new species inventory project
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box flex="0 0 auto" className={classes.pageTitleActions}>
              <Button color="primary" variant="contained" onClick={() => setOpenDraftDialog(true)}>
                Save Draft
              </Button>
              {queryParams.draftId && (
                <Button color="primary" variant="outlined" onClick={() => setOpenDeleteDraftDialog(true)}>
                  Delete Draft
                </Button>
              )}
              <Button color="primary" variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        <Box py={3}>
          <Paper elevation={0}>
            <Box p={5}>
              <CreateProjectForm handleSubmit={createProject} codes={codesDataLoader.data} formikRef={formikRef} />
              <Box mt={4} display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  onClick={() => formikRef.current?.submitForm()}
                  className={classes.actionButton}>
                  Submit Project
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => setOpenDraftDialog(true)}
                  className={classes.actionButton}>
                  Save Draft
                </Button>

                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => setOpenDeleteDraftDialog(true)}
                  className={classes.actionButton}>
                  Delete Draft
                </Button>

                <Button color="primary" variant="outlined" onClick={handleCancel} className={classes.actionButton}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default CreateProjectPage;
