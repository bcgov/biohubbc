import { mdiChevronDown, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { IErrorDialogProps } from '../../../components/dialog/ErrorDialog';
import { IYesNoDialogProps } from '../../../components/dialog/YesNoDialog';
import { CustomMenuButton } from '../../../components/toolbar/ActionToolbars';
import { ProjectParticipantsI18N, SystemUserI18N } from '../../../constants/i18n';
import { DialogContext } from '../../../contexts/dialogContext';
import { APIError } from '../../../hooks/api/useAxios';
import { useBiohubApi } from '../../../hooks/useBioHubApi';
import { CodeSet, IGetAllCodeSetsResponse } from '../../../interfaces/useCodesApi.interface';
import { IGetUserProjectsListResponse } from '../../../interfaces/useProjectApi.interface';
import { ISystemUser } from '../../../interfaces/useUserApi.interface';

export interface IProjectDetailsProps {
  userDetails: ISystemUser;
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

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);
  const [assignedProjects, setAssignedProjects] = useState<IGetUserProjectsListResponse[]>();

  const handleGetUserProjects = useCallback(
    async (systemUserId: number) => {
      const userProjectsListResponse = await biohubApi.user.getProjectList(systemUserId);
      setAssignedProjects(userProjectsListResponse);
    },
    [biohubApi.project]
  );

  const refresh = () => handleGetUserProjects(userDetails.system_user_id);

  useEffect(() => {
    if (assignedProjects) {
      return;
    }

    handleGetUserProjects(userDetails.system_user_id);
  }, [userDetails.system_user_id, assignedProjects, handleGetUserProjects]);

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

  const handleRemoveProjectParticipant = async (projectId: number, projectParticipationId: number) => {
    try {
      const response = await biohubApi.projectParticipants.removeProjectParticipant(projectId, projectParticipationId);

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

      handleGetUserProjects(userDetails.system_user_id);
    } catch (error) {
      openErrorDialog({
        dialogTitle: SystemUserI18N.removeUserErrorTitle,
        dialogText: SystemUserI18N.removeUserErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError).errors
      });
    }
  };

  const defaultErrorDialogProps: Partial<IErrorDialogProps> = useMemo(
    () => ({
      onClose: () => dialogContext.setErrorDialog({ open: false }),
      onOk: () => dialogContext.setErrorDialog({ open: false })
    }),
    [dialogContext]
  );

  const defaultYesNoDialogProps: Partial<IYesNoDialogProps> = useMemo(
    () => ({
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      onNo: () => dialogContext.setYesNoDialog({ open: false })
    }),
    [dialogContext]
  );

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
    <Paper>
      <Toolbar>
        <Typography data-testid="projects_header" variant="h4" component="h2">
          Assigned Projects &zwnj;
          <Typography component="span" variant="inherit" color="textSecondary">
            ({assignedProjects?.length})
          </Typography>
        </Typography>
      </Toolbar>
      <Divider></Divider>
      <Box p={2}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Project Role</TableCell>
              <TableCell width={80} align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody data-testid="resources-table">
            {assignedProjects.length > 0 &&
              assignedProjects?.map((row) => (
                <TableRow key={row.project_id}>
                  <TableCell scope="row">
                    <Link component={RouterLink} to={`/admin/projects/${row.project_id}/details`} aria-current="page">
                      {row.project_name}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <Box my={-1}>
                      <ChangeProjectRoleMenu
                        row={row}
                        user_identifier={props.userDetails.user_identifier}
                        projectRoleCodes={codes.project_roles}
                        refresh={refresh}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box my={-1}>
                      <IconButton
                        title="Remove user from project"
                        data-testid={'remove-project-participant-button'}
                        onClick={() =>
                          openYesNoDialog({
                            dialogTitle: SystemUserI18N.removeUserFromProject,
                            dialogContent: (
                              <Typography variant="body1" color="textSecondary">
                                Removing user <strong>{userDetails.user_identifier}</strong> will revoke their access to
                                this project. Are you sure you want to proceed?
                              </Typography>
                            ),
                            yesButtonProps: { color: 'error' },
                            yesButtonLabel: 'Remove',
                            noButtonLabel: 'Cancel',
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
  const biohubApi = useBiohubApi();

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
      dialogTitle: 'Change project role?',
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
      const status = await biohubApi.projectParticipants.updateProjectParticipantRole(
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

  return (
    <CustomMenuButton
      buttonLabel={row.project_role_permissions[0]}
      buttonTitle={'Change Project Role'}
      buttonProps={{ variant: 'outlined', size: 'small' }}
      menuItems={projectRoleCodes.map((roleCode) => {
        return {
          menuLabel: roleCode.name,
          menuOnClick: () => handleChangeUserPermissionsClick(row, roleCode.name, roleCode.id)
        };
      })}
      buttonEndIcon={<Icon path={mdiChevronDown} size={0.8} />}
    />
  );
};
