import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { ProjectParticipantsI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { IGetProjectParticipant } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useContext, useEffect } from 'react';
import { alphabetizeObjects, getFormattedIdentitySource } from 'utils/Utils';
import ProjectParticipantsHeader from './ProjectParticipantsHeader';
import ProjectParticipantsRoleMenu from './ProjectParticipantsRoleMenu';

const ProjectParticipantsPage: React.FC = () => {
  const codesContext = useContext(CodesContext);
  const projectContext = useContext(ProjectContext);

  const dialogContext = useContext(DialogContext);

  const biohubApi = useBiohubApi();

  const projectParticipantsDataLoader = useDataLoader(() =>
    biohubApi.projectParticipants.getProjectParticipants(projectContext.projectId)
  );

  useDataLoaderError(projectParticipantsDataLoader, (dataLoader) => {
    return {
      dialogTitle: ProjectParticipantsI18N.getParticipantsErrorTitle,
      dialogText: ProjectParticipantsI18N.getParticipantsErrorText,
      dialogError: (dataLoader.error as APIError).message
    };
  });

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  useEffect(() => {
    projectParticipantsDataLoader.load();
  }, [projectParticipantsDataLoader]);

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

  const handleDialogRemoveParticipantOpen = (participant: IGetProjectParticipant) => {
    dialogContext.setYesNoDialog({
      dialogTitle: ProjectParticipantsI18N.removeParticipantTitle,
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Removing user <strong>{participant.user_identifier}</strong> will revoke their access to this project. Are you
          sure you want to proceed?
        </Typography>
      ),
      yesButtonProps: { color: 'error' },
      yesButtonLabel: 'Remove',
      noButtonLabel: 'Cancel',
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
      const response = await biohubApi.projectParticipants.removeProjectParticipant(
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
          <Paper>
            <Toolbar>
              <Typography component="h2" variant="h3" color="inherit">
                Team Members
              </Typography>
            </Toolbar>

            <Divider></Divider>

            <Box px={1}>
              <Table sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Project Role</TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alphabetizeObjects(projectParticipantsDataLoader?.data ?? [], 'user_identifier').map(
                    (participant) => (
                      <TableRow key={participant.project_participation_id}>
                        <TableCell scope="row">{participant.user_identifier}</TableCell>
                        <TableCell scope="row">
                          {getFormattedIdentitySource(participant.identity_source as SYSTEM_IDENTITY_SOURCE)}
                        </TableCell>
                        <TableCell>
                          <Box my={-1}>
                            <ProjectParticipantsRoleMenu
                              participant={participant}
                              projectRoleCodes={codes.project_roles}
                              refresh={projectParticipantsDataLoader.refresh}
                            />
                          </Box>
                        </TableCell>

                        <TableCell align="right">
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
                    )
                  )}

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
