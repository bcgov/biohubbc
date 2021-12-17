import { Button } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import React, { useContext } from 'react';
import { useHistory } from 'react-router';
import { SystemUserI18N } from '../../../constants/i18n';
import { DialogContext } from '../../../contexts/dialogContext';
import { APIError } from '../../../hooks/api/useAxios';
import { useBiohubApi } from '../../../hooks/useBioHubApi';
import { IGetUserResponse } from '../../../interfaces/useUserApi.interface';
import { ICheckForProjectLead, IOpenErrorDialog, IOpenYesNoDialog, IShowSnackBar } from './UsersDetailPage';

const useStyles = makeStyles(() => ({
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  spacingRight: {
    paddingRight: '1rem'
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  projectTitle: {
    fontWeight: 400
  }
}));

export interface IUsersHeaderProps {
  userDetails: IGetUserResponse;
  showSnackBar: IShowSnackBar;
  openYesNoDialog: IOpenYesNoDialog;
  openErrorDialog: IOpenErrorDialog;
  checkForProjectLead: ICheckForProjectLead;
}

const UsersDetailHeader: React.FC<IUsersHeaderProps> = (props) => {
  const { userDetails, showSnackBar, openYesNoDialog, openErrorDialog, checkForProjectLead } = props;
  const classes = useStyles();
  const uHistory = useHistory();
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);

  const handleDeleteUser = async (userId: number) => {
    const apiCall = await biohubApi.project.getAllUserProjectsForView(userId);

    for (const project of apiCall) {
      const response = await biohubApi.project.getProjectParticipants(project.project_id);
      const projectLeadAprroval = checkForProjectLead(response, project.project_participation_id);

      if (!projectLeadAprroval) {
        openErrorDialog({
          dialogTitle: SystemUserI18N.deleteProjectLeadErrorTitle,
          dialogText: SystemUserI18N.deleteProjectLeadErrorText
        });
        return;
      }
    }
    deActivateSystemUser(userDetails);
  };

  const deActivateSystemUser = async (user: IGetUserResponse) => {
    if (!user?.id) {
      return;
    }
    try {
      await biohubApi.user.deleteSystemUser(user.id);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              User <strong>{user.user_identifier}</strong> removed from application.
            </Typography>
          </>
        ),
        open: true
      });

      uHistory.push('/admin/users');
    } catch (error) {
      const apiError = error as APIError;
      openErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
    }
  };

  return (
    <Paper square={true}>
      <Container maxWidth="xl">
        <Box pt={3} pb={2}>
          <Breadcrumbs>
            <Link
              color="primary"
              onClick={() => uHistory.push('/admin/users')}
              aria-current="page"
              className={classes.breadCrumbLink}>
              <Typography variant="body2">Manage Users</Typography>
            </Link>
            <Typography variant="body2">{userDetails.user_identifier}</Typography>
          </Breadcrumbs>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box pb={3}>
            <Box mb={1.5} display="flex">
              <Typography className={classes.spacingRight} variant="h1">
                User - <span className={classes.projectTitle}>{userDetails.user_identifier}</span>
              </Typography>
            </Box>
            <Box mb={0.75} display="flex" alignItems="center">
              <Typography component="span" variant="subtitle1" color="textSecondary">
                &nbsp;&nbsp;{userDetails.role_names[0]}
              </Typography>
            </Box>
          </Box>
          <Box ml={4} mb={4}>
            <Tooltip arrow color="secondary" title={'delete'}>
              <>
                <Button
                  title="Remove User"
                  color="primary"
                  variant="text"
                  className={classes.actionButton}
                  startIcon={<Icon path={mdiTrashCanOutline} size={0.875} />}
                  data-testid={'remove-user-button'}
                  onClick={() =>
                    openYesNoDialog({
                      dialogTitle: SystemUserI18N.removeSystemUserTitle,
                      dialogContent: (
                        <>
                          <Typography variant="body1" color="textPrimary">
                            Removing user <strong>{userDetails.user_identifier}</strong> will revoke their access to all
                            projects.
                          </Typography>
                          <Typography variant="body1" color="textPrimary">
                            Are you sure you want to proceed?
                          </Typography>
                        </>
                      ),
                      yesButtonProps: { color: 'secondary' },
                      onYes: () => {
                        handleDeleteUser(userDetails.id);
                        dialogContext.setYesNoDialog({ open: false });
                      }
                    })
                  }>
                  <strong>Remove User</strong>
                </Button>
              </>
            </Tooltip>
          </Box>
        </Box>
      </Container>
    </Paper>
  );
};

export default UsersDetailHeader;
