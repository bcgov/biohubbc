import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { ProjectParticipantsI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { IGetProjectParticipantsResponseArrayItem } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useContext, useEffect } from 'react';
import ProjectParticipantsHeader from './ProjectParticipantsHeader';
import ProjectParticipantsRoleMenu from './ProjectParticipantsRoleMenu';

const useStyles = makeStyles(() => ({
  teamMembersTable: {
    tableLayout: 'fixed',
    '& td': {
      verticalAlign: 'middle'
    }
  }
}));

const ProjectParticipantsPage: React.FC = () => {
  const classes = useStyles();

  const codesContext = useContext(CodesContext);
  const projectContext = useContext(ProjectContext);

  const dialogContext = useContext(DialogContext);

  const biohubApi = useBiohubApi();

  const projectParticipantsDataLoader = useDataLoader(() =>
    biohubApi.project.getProjectParticipants(projectContext.projectId)
  );

  useDataLoaderError(projectParticipantsDataLoader, (dataLoader) => {
    return {
      dialogTitle: ProjectParticipantsI18N.getParticipantsErrorTitle,
      dialogText: ProjectParticipantsI18N.getParticipantsErrorText,
      dialogError: (dataLoader.error as APIError).message
    };
  });

  useEffect(() => codesContext.codesDataLoader.load(), [codesContext.codesDataLoader]);

  useEffect(() => projectParticipantsDataLoader.load(), [projectParticipantsDataLoader]);

  const openErrorDialog = useCallback(
    (errorDialogProps?: Partial<IErrorDialogProps>) => {
      dialogContext.setErrorDialog({
        open: true,
        onClose: () => dialogContext.setErrorDialog({ open: false }),
        onOk: () => dialogContext.setErrorDialog({ open: false }),
        ...errorDialogProps
      });
    },
    [dialogContext]
  );

  const handleDialogRemoveParticipantOpen = (participant: IGetProjectParticipantsResponseArrayItem) => {
    dialogContext.setYesNoDialog({
      dialogTitle: ProjectParticipantsI18N.removeParticipantTitle,
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Removing user <strong>{participant.user_identifier}</strong> will revoke their access to project. Are you sure
          you want to proceed?
        </Typography>
      ),
      yesButtonProps: { color: 'secondary' },
      open: true,
      onYes: async () => {
        await handleRemoveProjectParticipant(participant.project_participation_id);
        dialogContext.setYesNoDialog({ open: false });
        dialogContext.setSnackbar({
          open: true,
          snackbarMessage: (
            <Typography variant="body2" component="div">
              User <strong>{participant.user_identifier}</strong> removed from project.
            </Typography>
          )
        });
      },
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      onNo: () => dialogContext.setYesNoDialog({ open: false })
    });
  };

  const handleRemoveProjectParticipant = async (projectParticipationId: number) => {
    try {
      const response = await biohubApi.project.removeProjectParticipant(
        projectContext.projectId,
        projectParticipationId
      );

      if (!response) {
        openErrorDialog({
          dialogTitle: ProjectParticipantsI18N.removeParticipantErrorTitle,
          dialogText: ProjectParticipantsI18N.removeParticipantErrorText
        });
        return;
      }

      projectParticipantsDataLoader.refresh();
    } catch (error) {
      openErrorDialog({
        dialogTitle: ProjectParticipantsI18N.removeParticipantErrorTitle,
        dialogText: ProjectParticipantsI18N.removeParticipantErrorText,
        dialogError: (error as APIError).message
      });
    }
  };

  if (!codesContext.codesDataLoader.data || !projectParticipantsDataLoader.hasLoaded) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const codes = codesContext.codesDataLoader.data;

  return (
    <>
      <ProjectParticipantsHeader refresh={projectParticipantsDataLoader.refresh} />

      <Container maxWidth="xl">
        <Box my={3}>
          <Paper elevation={0}>
            <Toolbar>
              <Typography component="h2" variant="h4" color="inherit">
                Team Members
              </Typography>
            </Toolbar>

            <Divider></Divider>

            <Box px={1}>
              <Table className={classes.teamMembersTable}>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Project Role</TableCell>
                    <TableCell width="150px" align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectParticipantsDataLoader?.data?.participants
                    ?.alphabetizeObjects('user_identifier')
                    ?.map((participant) => (
                      <TableRow key={participant.project_participation_id}>
                        <TableCell scope="row">{participant.user_identifier}</TableCell>
                        <TableCell scope="row">{participant.user_identity_source_id}</TableCell>
                        <TableCell>
                          <Box my={-1}>
                            <ProjectParticipantsRoleMenu
                              participant={participant}
                              projectRoleCodes={codes.project_roles}
                              refresh={projectParticipantsDataLoader.refresh}
                            />
                          </Box>
                        </TableCell>

                        <TableCell align="center">
                          <Box my={-1}>
                            <IconButton
                              title="Remove Team Member"
                              data-testid={'remove-project-participant-button'}
                              onClick={() => handleDialogRemoveParticipantOpen(participant)}>
                              <Icon path={mdiTrashCanOutline} size={1} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}

                  {!projectParticipantsDataLoader.data && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Box display="flex" justifyContent="center">
                          No Team Members
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default ProjectParticipantsPage;
