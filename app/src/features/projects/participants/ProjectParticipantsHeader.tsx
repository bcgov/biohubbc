import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiArrowLeft, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { ProjectParticipantsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
import { useHistory, useParams } from 'react-router';
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
  projectWithDetails: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Survey header for a single-survey view.
 *
 * @param {*} props
 * @return {*}
 */
const ProjectParticipantsHeader: React.FC<IProjectParticipantsHeaderProps> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const urlParams = useParams();
  const dialogContext = useContext(DialogContext);
  const biohubApi = useBiohubApi();

  const [openAddParticipantsDialog, setOpenAddParticipantsDialog] = useState(false);

  const projectId = urlParams['id'];

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
      const response = await biohubApi.project.addProjectParticipants(projectId, values.participants);

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
              color="primary"
              startIcon={<Icon path={mdiArrowLeft} size={0.9} />}
              onClick={() => history.push(`/admin/projects/${props.projectWithDetails.id}`)}>
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
                  <strong>Add Team Members</strong>
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
                props.codes?.project_roles?.map((item) => {
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
