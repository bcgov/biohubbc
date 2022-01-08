import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
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
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
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
  },
  teamMembersToolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  teamMembersTable: {
    tableLayout: 'fixed',
    '& td': {
      verticalAlign: 'middle'
    }
  }
}));

const ProjectParticipantsPage: React.FC = () => {
  const urlParams = useParams();
  const dialogContext = useContext(DialogContext);
  const restorationTrackerApi = useRestorationTrackerApi();

  const classes = useStyles();

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);

  const [projectParticipants, setProjectParticipants] = useState<IGetProjectParticipantsResponseArrayItem[] | null>(
    null
  );

  const projectId = urlParams['id'];

  const defaultErrorDialogProps: Partial<IErrorDialogProps> = {
    onClose: () => dialogContext.setErrorDialog({ open: false }),
    onOk: () => dialogContext.setErrorDialog({ open: false })
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

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await restorationTrackerApi.project.getProjectForView(urlParams['id']);

    if (!projectWithDetailsResponse) {
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [restorationTrackerApi.project, urlParams]);

  useEffect(() => {
    if (isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(false);
    }
  }, [isLoadingProject, projectWithDetails, getProject]);

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

  const getProjectParticipants = useCallback(async () => {
    try {
      const response = await restorationTrackerApi.project.getProjectParticipants(projectId);

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
  }, [restorationTrackerApi.project, openErrorDialog, projectId]);

  useEffect(() => {
    if (projectParticipants) {
      return;
    }

    getProjectParticipants();
  }, [restorationTrackerApi, projectId, projectParticipants, getProjectParticipants]);

  const handleRemoveProjectParticipant = async (projectParticipationId: number) => {
    try {
      const response = await restorationTrackerApi.project.removeProjectParticipant(projectId, projectParticipationId);

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
            <Toolbar className={classes.teamMembersToolbar}>
              <Typography variant="h2" color="inherit">
                Team Members
              </Typography>
            </Toolbar>

            <Table className={classes.teamMembersTable}>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Project Role</TableCell>
                  <TableCell width="100px" align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hasProjectParticipants &&
                  projectParticipants?.map((row) => (
                    <TableRow key={row.project_participation_id}>
                      <TableCell scope="row">
                        <strong>{row.user_identifier}</strong>
                      </TableCell>
                      <TableCell>
                        <Box m={-1}>
                          <ChangeProjectRoleMenu
                            row={row}
                            projectRoleCodes={codes.project_roles}
                            refresh={getProjectParticipants}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box m={-1}>
                          <IconButton
                            title="Remove Team Member"
                            data-testid={'remove-project-participant-button'}
                            onClick={() =>
                              openYesNoDialog({
                                dialogTitle: ProjectParticipantsI18N.removeParticipantTitle,
                                dialogContent: (
                                  <Typography variant="body1" component="div" color="textSecondary">
                                    Removing user <strong>{row.user_identifier}</strong> will revoke their access to
                                    project. Are you sure you want to proceed?
                                  </Typography>
                                ),
                                yesButtonProps: { color: 'secondary' },
                                onYes: () => {
                                  handleRemoveProjectParticipant(row.project_participation_id);
                                  dialogContext.setYesNoDialog({ open: false });
                                  dialogContext.setSnackbar({
                                    open: true,
                                    snackbarMessage: (
                                      <Typography variant="body2" component="div">
                                        User <strong>{row.user_identifier}</strong> removed from project.
                                      </Typography>
                                    )
                                  });
                                }
                              })
                            }>
                            <Icon path={mdiTrashCanOutline} size={1} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {!hasProjectParticipants && (
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
  const restorationTrackerApi = useRestorationTrackerApi();

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

  const handleChangeUserPermissionsClick = (
    item: IGetProjectParticipantsResponseArrayItem,
    newRole: string,
    newRoleId: number
  ) => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Change Project Role?',
      dialogContent: (
        <Typography variant="body1" color="textSecondary">
          Change user <strong>{item.user_identifier}</strong>'s role to <strong>{newRole}</strong>?
        </Typography>
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
    item: IGetProjectParticipantsResponseArrayItem,
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
        showErrorDialog();
        return;
      }

      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <Typography variant="body2" component="div">
            User <strong>{item.user_identifier}</strong>'s role changed to <strong>{newRole}</strong>.
          </Typography>
        )
      });

      refresh();
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogError: apiError.message, dialogErrorDetails: apiError.errors });
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
