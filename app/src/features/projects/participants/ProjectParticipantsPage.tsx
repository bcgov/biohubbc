import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { mdiMenuDown, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import { CustomMenuButton } from 'components/toolbar/ActionToolbars';
import { ProjectParticipantsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { CodeSet, IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectForViewResponse,
  IGetProjectParticipantsResponseArrayItem
} from 'interfaces/useProjectApi.interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ProjectParticipantsHeader from './ProjectParticipantsHeader';

const useStyles = makeStyles((theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

const ProjectParticipantsPage: React.FC = () => {
  const urlParams = useParams();
  const dialogContext = useContext(DialogContext);
  const biohubApi = useBiohubApi();

  const classes = useStyles();

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);

  const [projectParticipants, setProjectParticipants] = useState<IGetProjectParticipantsResponseArrayItem[] | null>(
    null
  );

  const projectId = urlParams['id'];

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await biohubApi.project.getProjectForView(urlParams['id']);

    if (!projectWithDetailsResponse) {
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [biohubApi.project, urlParams]);

  useEffect(() => {
    if (isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(false);
    }
  }, [isLoadingProject, projectWithDetails, getProject]);

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await biohubApi.codes.getAllCodeSets();

      if (!codesResponse) {
        return;
      }

      setCodes(codesResponse);
    };

    if (isLoadingCodes && !codes) {
      getCodes();
      setIsLoadingCodes(false);
    }
  }, [urlParams, biohubApi.codes, isLoadingCodes, codes]);

  const getProjectParticipants = async () => {
    try {
      const response = await biohubApi.project.getProjectParticipants(projectId);

      if (!response) {
        openErrorDialog({
          dialogTitle: ProjectParticipantsI18N.getParticipantsErrorTitle,
          dialogText: ProjectParticipantsI18N.getParticipantsErrorText
        });
        setProjectParticipants([]);
        return;
      }

      setProjectParticipants(response.participants);
    } catch (error) {
      openErrorDialog({
        dialogTitle: ProjectParticipantsI18N.getParticipantsErrorTitle,
        dialogText: ProjectParticipantsI18N.getParticipantsErrorText,
        dialogError: (error as APIError).message
      });
      setProjectParticipants([]);
      return;
    }
  };

  useEffect(() => {
    if (projectParticipants) {
      return;
    }

    getProjectParticipants();
  }, [biohubApi, projectId, getProjectParticipants]);

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

  const defaultYesNoDialogProps: Partial<IYesNoDialogProps> = {
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false })
  };

  const openYesNoDialog = (yesNoDialogProps?: Partial<IYesNoDialogProps>) => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      ...yesNoDialogProps,
      open: true
    });
  };

  const handleRemoveProjectParticipant = async (projectParticipationId: number) => {
    try {
      const response = await biohubApi.project.removeProjectParticipant(projectId, projectParticipationId);

      if (!response) {
        openErrorDialog({
          dialogTitle: ProjectParticipantsI18N.removeParticipantErrorTitle,
          dialogText: ProjectParticipantsI18N.removeParticipantErrorText
        });
        return;
      }

      getProjectParticipants();
    } catch (error) {
      openErrorDialog({
        dialogTitle: ProjectParticipantsI18N.removeParticipantErrorTitle,
        dialogText: ProjectParticipantsI18N.removeParticipantErrorText,
        dialogError: (error as APIError).message
      });
    }
  };

  const hasProjectParticipants = !!(projectParticipants && projectParticipants.length);

  if (!codes || !projectParticipants || !projectWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <ProjectParticipantsHeader
        projectWithDetails={projectWithDetails}
        codes={codes}
        refresh={getProjectParticipants}
      />

      <Container maxWidth="xl">
        <Box my={3}>
          <Paper>
            <Toolbar>
              <Typography variant="h3" color="inherit">
                Project Participants
              </Typography>
            </Toolbar>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Project Role</TableCell>
                  <TableCell width="130px" align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hasProjectParticipants &&
                  projectParticipants?.map((row) => (
                    <TableRow key={row.project_participation_id}>
                      <TableCell component="th" scope="row">
                        {row.user_identifier}
                      </TableCell>
                      {/* <TableCell>{codes.project_roles.find((item) => item.id === row.project_role_id)?.name}</TableCell> */}
                      <TableCell>
                        <ChangeProjectRoleMenu
                          row={row}
                          projectRoleCodes={codes.project_roles}
                          refresh={getProjectParticipants}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          title="Remove Project Participant"
                          color="primary"
                          variant="text"
                          className={classes.actionButton}
                          startIcon={<Icon path={mdiTrashCanOutline} size={0.875} />}
                          data-testid={'remove-project-participant-button'}
                          onClick={() =>
                            openYesNoDialog({
                              dialogTitle: ProjectParticipantsI18N.removeParticipantTitle,
                              dialogText: `Removing user ${row.user_identifier} will revoke their access to this project. Are you sure you want to proceed?`,
                              onYes: () => {
                                handleRemoveProjectParticipant(row.project_participation_id);
                                dialogContext.setYesNoDialog({ open: false });
                                dialogContext.setSnackbar({
                                  open: true,
                                  snackbarMessage: (
                                    <Typography variant="body2" component="div">
                                      User <strong>{row.user_identifier}</strong> removed.
                                    </Typography>
                                  )
                                });
                              }
                            })
                          }>
                          <strong>Remove</strong>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                {!hasProjectParticipants && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Box display="flex" justifyContent="center">
                        No Results
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default ProjectParticipantsPage;

export interface IChangeProjectRoleMenuProps {
  row: IGetProjectParticipantsResponseArrayItem;
  projectRoleCodes: CodeSet;
  refresh: () => void;
}

const ChangeProjectRoleMenu: React.FC<IChangeProjectRoleMenuProps> = (props) => {
  const { row, projectRoleCodes, refresh } = props;

  const dialogContext = useContext(DialogContext);
  const biohubApi = useBiohubApi();

  const defaultErrorDialogProps = {
    dialogTitle: ProjectParticipantsI18N.updateParticipantRoleErrorTitle,
    dialogText: ProjectParticipantsI18N.updateParticipantRoleErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
  };

  const handleChangeUserPermissionsClick = (row: IGetProjectParticipantsResponseArrayItem, newRole: string) => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Change Project Role?',
      dialogContent: (
        <>
          <Typography color="textPrimary">
            Change user <strong>{row.user_identifier}</strong>'s role to <strong>{newRole}</strong>?
          </Typography>
        </>
      ),
      yesButtonLabel: 'Change Role',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'primary' },
      open: true,
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onYes: () => {
        changeProjectParticipantRole(row, newRole);
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const changeProjectParticipantRole = async (row: IGetProjectParticipantsResponseArrayItem, newRole: string) => {
    if (!row?.project_participation_id) {
      return;
    }
    try {
      const status = await biohubApi.project.updateProjectParticipantRole(
        row.project_id,
        row.project_participation_id,
        newRole
      );

      if (!status) {
        showErrorDialog();
        return;
      }

      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <Typography variant="body2" component="div">
            User <strong>{row.user_identifier}</strong>'s role changed to {newRole}.
          </Typography>
        )
      });

      refresh();
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogErrorDetails: apiError.errors, open: true });
    }
  };

  const currentProjectRoleName = projectRoleCodes.find((item) => item.id === row.project_role_id)?.name;

  return (
    <CustomMenuButton
      buttonLabel={currentProjectRoleName}
      buttonTitle={'Change Project Role'}
      buttonProps={{ variant: 'text' }}
      menuItems={projectRoleCodes.map((roleCode) => {
        return {
          menuLabel: roleCode.name,
          menuOnClick: () => handleChangeUserPermissionsClick(row, roleCode.name)
        };
      })}
      buttonEndIcon={<Icon path={mdiMenuDown} size={1} />}
    />
  );
};
