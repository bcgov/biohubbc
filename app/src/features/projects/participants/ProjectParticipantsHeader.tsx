import { mdiArrowLeft, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import assert from 'assert';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { ProjectParticipantsI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AddProjectParticipantsForm, {
  AddProjectParticipantsFormInitialValues,
  AddProjectParticipantsFormYupSchema,
  IAddProjectParticipantsForm
} from './AddProjectParticipantsForm';

const useStyles = makeStyles((theme: Theme) => ({
  projectTitleContainer: {
    maxWidth: '170ch',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  projectTitle: {
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    overflow: 'hidden'
  },
  titleActions: {
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.75)
  }
}));

export interface IProjectParticipantsHeaderProps {
  refresh: () => void;
}

/**
 * Project participants page header.
 *
 * @param {IProjectParticipantsHeaderProps} props
 * @return {*}
 */
const ProjectParticipantsHeader = (props: IProjectParticipantsHeaderProps) => {
  const classes = useStyles();

  const codesContext = useContext(CodesContext);
  const projectContext = useContext(ProjectContext);

  // Codes data must be loaded by a parent before this component is rendered
  assert(codesContext.codesDataLoader.data);

  const codes = codesContext.codesDataLoader.data;

  const dialogContext = useContext(DialogContext);

  const biohubApi = useBiohubApi();

  const [openAddParticipantsDialog, setOpenAddParticipantsDialog] = useState(false);

  const defaultErrorDialogProps: Partial<IErrorDialogProps> = {
    onClose: () => dialogContext.setErrorDialog({ open: false }),
    onOk: () => dialogContext.setErrorDialog({ open: false })
  };

  const openErrorDialog = (errorDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      ...defaultErrorDialogProps,
      ...errorDialogProps,
      open: true
    });
  };

  const handleAddProjectParticipantsSave = async (values: IAddProjectParticipantsForm) => {
    try {
      //TODO: update to follow new api changes
      const response = await biohubApi.projectParticipants.addProjectParticipants(
        projectContext.projectId,
        values.participants
      );

      if (!response) {
        openErrorDialog({
          dialogTitle: ProjectParticipantsI18N.addParticipantsErrorTitle,
          dialogText: ProjectParticipantsI18N.addParticipantsErrorText
        });
        return;
      }

      props.refresh();
    } catch (error) {
      openErrorDialog({
        dialogTitle: ProjectParticipantsI18N.addParticipantsErrorTitle,
        dialogText: ProjectParticipantsI18N.addParticipantsErrorText,
        dialogError: (error as APIError).message
      });
    }
  };

  return (
    <Paper square elevation={0}>
      <Container maxWidth="xl">
        <Box py={4}>
          <Box mt={-1} ml={-0.5} mb={1}>
            <Button
              component={Link}
              to={`/admin/projects/${projectContext.projectId}`}
              color="primary"
              startIcon={<Icon path={mdiArrowLeft} size={0.9} />}>
              <strong>Back to Project</strong>
            </Button>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Box flex="1 1 auto" className={classes.projectTitleContainer}>
              <Typography variant="h1" className={classes.projectTitle}>
                Manage Project Team
              </Typography>
            </Box>
            <Box flex="0 0 auto" className={classes.titleActions}>
              <Box ml={4}>
                <Button
                  color="primary"
                  variant="contained"
                  data-testid="invite-project-users-button"
                  aria-label={'Add Team Members'}
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  onClick={() => setOpenAddParticipantsDialog(true)}>
                  Add Team Members
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      <EditDialog
        dialogTitle={'Add Team Members'}
        open={openAddParticipantsDialog}
        dialogSaveButtonLabel={'Add'}
        component={{
          element: (
            <AddProjectParticipantsForm
              project_roles={
                codes.project_roles?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
            />
          ),
          initialValues: AddProjectParticipantsFormInitialValues,
          validationSchema: AddProjectParticipantsFormYupSchema
        }}
        onCancel={() => setOpenAddParticipantsDialog(false)}
        onSave={(values) => {
          handleAddProjectParticipantsSave(values);
          setOpenAddParticipantsDialog(false);
          dialogContext.setSnackbar({
            open: true,
            snackbarMessage: (
              <Typography variant="body2" component="div">
                {values.participants.length} team {values.participants.length > 1 ? 'members' : 'member'} added.
              </Typography>
            )
          });
        }}
      />
    </Paper>
  );
};

export default ProjectParticipantsHeader;
