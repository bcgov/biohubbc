import { Container, IconButton, Toolbar } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { mdiMenuDown, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { IErrorDialogProps } from '../../../components/dialog/ErrorDialog';
import { IYesNoDialogProps } from '../../../components/dialog/YesNoDialog';
import { CustomMenuButton } from '../../../components/toolbar/ActionToolbars';
import { ProjectParticipantsI18N, SystemUserI18N } from '../../../constants/i18n';
import { DialogContext } from '../../../contexts/dialogContext';
import { APIError } from '../../../hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { CodeSet, IGetAllCodeSetsResponse } from '../../../interfaces/useCodesApi.interface';
import { IGetUserProjectsListResponse } from '../../../interfaces/useProjectApi.interface';
import { IGetUserResponse } from '../../../interfaces/useUserApi.interface';

const useStyles = makeStyles((theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  projectMembersToolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  projectMembersTable: {
    tableLayout: 'fixed',
    '& td': {
      verticalAlign: 'middle'
    }
  }
}));

export interface IProjectDetailsProps {
  userDetails: IGetUserResponse;
}

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const UsersDetailProjects: React.FC<IProjectDetailsProps> = (props) => {
  const { userDetails } = props;
  const urlParams = useParams();
  const restorationTrackerApi = useRestorationTrackerApi();
  const dialogContext = useContext(DialogContext);
  const history = useHistory();
  const classes = useStyles();

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);
  const [assignedProjects, setAssignedProjects] = useState<IGetUserProjectsListResponse[]>();

  const handleGetUserProjects = useCallback(
    async (userId: number) => {
      const userProjectsListResponse = await restorationTrackerApi.project.getAllUserProjectsForView(userId);
      setAssignedProjects(userProjectsListResponse);
    },
    [restorationTrackerApi.project]
  );

  const refresh = () => handleGetUserProjects(userDetails.id);

  useEffect(() => {
    if (assignedProjects) {
      return;
    }

    handleGetUserProjects(userDetails.id);
  }, [userDetails.id, assignedProjects, handleGetUserProjects]);

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await restorationTrackerApi.codes.getAllCodeSets();

      if (!codesResponse) {
        return;
      }

      setCodes(codesResponse);
    };

    if (isLoadingCodes && !codes) {
      getCodes();
      setIsLoadingCodes(false);
    }
  }, [urlParams, restorationTrackerApi.codes, isLoadingCodes, codes]);

  const handleRemoveProjectParticipant = async (projectId: number, projectParticipationId: number) => {
    try {
      const response = await restorationTrackerApi.project.removeProjectParticipant(projectId, projectParticipationId);

      if (!response) {
        openErrorDialog({
          dialogTitle: SystemUserI18N.removeUserErrorTitle,
          dialogText: SystemUserI18N.removeUserErrorText
        });
        return;
      }

      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <Typography variant="body2" component="div">
            User <strong>{userDetails.user_identifier}</strong> removed from project.
          </Typography>
        )
      });

      handleGetUserProjects(userDetails.id);
    } catch (error) {
      openErrorDialog({
        dialogTitle: SystemUserI18N.removeUserErrorTitle,
        dialogText: SystemUserI18N.removeUserErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError).errors
      });
    }
  };

  const defaultErrorDialogProps: Partial<IErrorDialogProps> = {
    onClose: () => dialogContext.setErrorDialog({ open: false }),
    onOk: () => dialogContext.setErrorDialog({ open: false })
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

  const openErrorDialog = useCallback(
    (errorDialogProps?: Partial<IErrorDialogProps>) => {
      dialogContext.setErrorDialog({
        ...defaultErrorDialogProps,
        ...errorDialogProps,
        open: true
      });
    },
    [defaultErrorDialogProps, dialogContext]
  );

  if (!codes || !assignedProjects) {
    return <CircularProgress data-testid="project-loading" className="pageProgress" size={40} />;
  }

  return (
    <Container maxWidth="xl">
      <Box pt={3}>
        <Paper>
          <Toolbar className={classes.projectMembersToolbar}>
            <Typography data-testid="projects_header" variant="h2">
              Assigned Projects ({assignedProjects?.length})
            </Typography>
          </Toolbar>
          <Box>
            <Table className={classes.projectMembersTable}>
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Project Role</TableCell>
                  <TableCell width="100px" align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody data-testid="resources-table">
                {assignedProjects.length > 0 &&
                  assignedProjects?.map((row) => (
                    <TableRow key={row.project_id}>
                      <TableCell scope="row">
                        <Link
                          color="primary"
                          onClick={() => history.push(`/admin/projects/${row.project_id}/details`)}
                          aria-current="page">
                          <Typography variant="body2">
                            <strong>{row.name}</strong>
                          </Typography>
                        </Link>
                      </TableCell>

                      <TableCell>
                        <Box m={-1}>
                          <ChangeProjectRoleMenu
                            row={row}
                            user_identifier={props.userDetails.user_identifier}
                            projectRoleCodes={codes.project_roles}
                            refresh={refresh}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box m={-1}>
                          <IconButton
                            title="Remove Project Participant"
                            data-testid={'remove-project-participant-button'}
                            onClick={() =>
                              openYesNoDialog({
                                dialogTitle: SystemUserI18N.removeUserFromProject,
                                dialogContent: (
                                  <>
                                    <Typography variant="body1" color="textPrimary">
                                      Removing user <strong>{userDetails.user_identifier}</strong> will revoke their
                                      access to the project.
                                    </Typography>
                                    <Typography variant="body1" color="textPrimary">
                                      Are you sure you want to proceed?
                                    </Typography>
                                  </>
                                ),
                                yesButtonProps: { color: 'secondary' },
                                onYes: () => {
                                  handleRemoveProjectParticipant(row.project_id, row.project_participation_id);
                                  dialogContext.setYesNoDialog({ open: false });
                                }
                              })
                            }>
                            <Icon path={mdiTrashCanOutline} size={1} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {!assignedProjects.length && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Box display="flex" justifyContent="center">
                        No Projects
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
  );
};

export default UsersDetailProjects;

export interface IChangeProjectRoleMenuProps {
  row: IGetUserProjectsListResponse;
  user_identifier: string;
  projectRoleCodes: CodeSet;
  refresh: () => void;
}

const ChangeProjectRoleMenu: React.FC<IChangeProjectRoleMenuProps> = (props) => {
  const { row, user_identifier, projectRoleCodes, refresh } = props;

  const dialogContext = useContext(DialogContext);
  const restorationTrackerApi = useRestorationTrackerApi();

  const errorDialogProps = {
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

  const displayErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...errorDialogProps, ...textDialogProps, open: true });
  };

  const handleChangeUserPermissionsClick = (item: IGetUserProjectsListResponse, newRole: string, newRoleId: number) => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Change Project Role?',
      dialogContent: (
        <>
          <Typography color="textPrimary">
            Change user <strong>{user_identifier}</strong>'s role to <strong>{newRole}</strong>?
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
        changeProjectParticipantRole(item, newRole, newRoleId);
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const changeProjectParticipantRole = async (
    item: IGetUserProjectsListResponse,
    newRole: string,
    newRoleId: number
  ) => {
    if (!item?.project_participation_id) {
      return;
    }

    try {
      const status = await restorationTrackerApi.project.updateProjectParticipantRole(
        item.project_id,
        item.project_participation_id,
        newRoleId
      );

      if (!status) {
        displayErrorDialog();
        return;
      }

      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <Typography variant="body2" component="div">
            User <strong>{user_identifier}</strong>'s role changed to <strong>{newRole}</strong>.
          </Typography>
        )
      });

      refresh();
    } catch (error) {
      displayErrorDialog({
        dialogTitle: SystemUserI18N.updateProjectLeadRoleErrorTitle,
        dialogText: SystemUserI18N.updateProjectLeadRoleErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError).errors
      });
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
          menuOnClick: () => handleChangeUserPermissionsClick(row, roleCode.name, roleCode.id)
        };
      })}
      buttonEndIcon={<Icon path={mdiMenuDown} size={1} />}
    />
  );
};
