import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { mdiMenuDown, mdiTrashCanOutline } from '@mdi/js';
import { makeStyles } from '@material-ui/core/styles';
import Icon from '@mdi/react';
import { IGetUserResponse } from '../../../interfaces/useUserApi.interface';
import {
  IGetUserProjectsListResponse,
  IGetProjectParticipantsResponse
} from '../../../interfaces/useProjectApi.interface';
import { IYesNoDialogProps } from '../../../components/dialog/YesNoDialog';
import { IErrorDialogProps } from '../../../components/dialog/ErrorDialog';
import { CustomMenuButton } from '../../../components/toolbar/ActionToolbars';
import { ProjectParticipantsI18N, SystemUserI18N } from '../../../constants/i18n';
import { APIError } from '../../../hooks/api/useAxios';
import { CodeSet, IGetAllCodeSetsResponse } from '../../../interfaces/useCodesApi.interface';

import { DialogContext } from '../../../contexts/dialogContext';
import { useBiohubApi } from '../../../hooks/useBioHubApi';
import { useHistory, useParams } from 'react-router';
import React, { useCallback, useEffect, useContext, useState } from 'react';

const useStyles = makeStyles(() => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
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
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);
  const uHistory = useHistory();
  const classes = useStyles();

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);

  const [assignedProjects, setAssignedProjects] = useState<IGetUserProjectsListResponse[]>();
  const handleGetUserProjects = async (userId: number) => {
    const apiCall = await biohubApi.project.getAllUserProjectsForView(userId);
    setAssignedProjects(apiCall);
  };

  const refresh = () => () => {
    handleGetUserProjects(userDetails.id);
  };

  useEffect(() => {
    handleGetUserProjects(userDetails.id);
  }, [props, userDetails.id]);

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

  const handleRemoveProjectParticipant = async (projectId: number, projectParticipationId: number) => {
    try {
      const response = await biohubApi.project.getProjectParticipants(projectId);

      const projectLeadAprroval = checkForProjectLead(response, projectParticipationId);

      if (projectLeadAprroval) {
        const response = await biohubApi.project.removeProjectParticipant(projectId, projectParticipationId);

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
      } else {
        openErrorDialog({
          dialogTitle: SystemUserI18N.deleteProjectLeadErrorTitle,
          dialogText: SystemUserI18N.deleteProjectLeadErrorText
        });
        return;
      }
    } catch (error) {
      openErrorDialog({
        dialogTitle: SystemUserI18N.removeUserErrorTitle,
        dialogText: SystemUserI18N.removeUserErrorText,
        dialogError: (error as APIError).message
      });
    }
  };

  const getProjectList = () => {
    if (!codes) {
      return <CircularProgress className="pageProgress" size={40} />;
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="40%" align="left">
                Project Name
              </TableCell>
              <TableCell width="40%" align="left">
                Project Role
              </TableCell>
              <TableCell width="20%" align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody data-testid="resources-table">
            {assignedProjects?.map((row) => (
              <TableRow key={row.project_id}>
                <TableCell>
                  <Box pt={1}>
                    <Link
                      color="primary"
                      onClick={() => uHistory.push(`/admin/projects/${row.project_id}/details`)}
                      aria-current="page">
                      <Typography variant="body2">{row.name}</Typography>
                    </Link>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box>
                    <ChangeProjectRoleMenu
                      row={row}
                      user_identifier={props.userDetails.user_identifier}
                      projectRoleCodes={codes.project_roles}
                      refresh={refresh()}
                    />
                  </Box>
                </TableCell>
                <TableCell width="10%" align="center">
                  <Button
                    title="Remove Project Participant"
                    color="primary"
                    variant="text"
                    className={classes.actionButton}
                    startIcon={<Icon path={mdiTrashCanOutline} size={0.875} />}
                    data-testid={'remove-project-participant-button'}
                    onClick={() =>
                      openYesNoDialog({
                        dialogTitle: SystemUserI18N.removeSystemUserTitle,
                        dialogContent: (
                          <>
                            <Typography variant="body1" color="textPrimary">
                              Removing user <strong>{userDetails.user_identifier}</strong> will revoke their access to
                              project.
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
                    <strong>Remove</strong>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <>
      <Box component={Paper} pt={3}>
        <Box mb={3} ml={3} display="flex" justifyContent="space-between">
          <Typography variant="h2">Assigned Projects: {userDetails.user_identifier}</Typography>
        </Box>
        <Box>{getProjectList()}</Box>
      </Box>
    </>
  );
};

export default UsersDetailProjects;

const checkForProjectLead = (
  projectParticipants: IGetProjectParticipantsResponse,
  projectParticipationId: number
): boolean => {
  for (const participant of projectParticipants.participants) {
    if (participant.project_participation_id !== projectParticipationId && participant.project_role_id === 1) {
      return true;
    }
  }
  return false;
};

export interface IChangeProjectRoleMenuProps {
  row: IGetUserProjectsListResponse;
  user_identifier: string;
  projectRoleCodes: CodeSet;
  refresh: () => void;
}

const ChangeProjectRoleMenu: React.FC<IChangeProjectRoleMenuProps> = (props) => {
  const { row, user_identifier, projectRoleCodes, refresh } = props;

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
      const response = await biohubApi.project.getProjectParticipants(row.project_id);

      const projectLeadAprroval = checkForProjectLead(response, row.project_participation_id);

      if (projectLeadAprroval) {
        const status = await biohubApi.project.updateProjectParticipantRole(
          item.project_id,
          item.project_participation_id,
          newRoleId
        );

        if (!status) {
          showErrorDialog();
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
      } else {
        showErrorDialog({
          dialogTitle: SystemUserI18N.updateProjectLeadRoleErrorTitle,
          dialogText: SystemUserI18N.updateProjectLeadRoleErrorText
        });
      }

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
          menuOnClick: () => handleChangeUserPermissionsClick(row, roleCode.name, roleCode.id)
        };
      })}
      buttonEndIcon={<Icon path={mdiMenuDown} size={1} />}
    />
  );
};
