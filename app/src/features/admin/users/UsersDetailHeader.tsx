import { mdiArrowLeft, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useContext, useMemo } from 'react';
import { useHistory } from 'react-router';
import { IErrorDialogProps } from '../../../components/dialog/ErrorDialog';
import { IYesNoDialogProps } from '../../../components/dialog/YesNoDialog';
import { SystemUserI18N } from '../../../constants/i18n';
import { DialogContext } from '../../../contexts/dialogContext';
import { APIError } from '../../../hooks/api/useAxios';
import { useBiohubApi } from '../../../hooks/useBioHubApi';
import { ISystemUser } from '../../../interfaces/useUserApi.interface';

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

export interface IUsersHeaderProps {
  userDetails: ISystemUser;
}

const UsersDetailHeader: React.FC<IUsersHeaderProps> = (props) => {
  const { userDetails } = props;
  const classes = useStyles();
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);

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

  const deActivateSystemUser = async (user: ISystemUser) => {
    if (!user?.system_user_id) {
      return;
    }
    try {
      await biohubApi.user.deleteSystemUser(user.system_user_id);

      dialogContext.setSnackbar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              User <strong>{user.user_identifier}</strong> removed from application.
            </Typography>
          </>
        ),
        open: true
      });

      history.push('/admin/users');
    } catch (error) {
      openErrorDialog({
        dialogTitle: SystemUserI18N.removeUserErrorTitle,
        dialogText: SystemUserI18N.removeUserErrorText,
        dialogError: (error as APIError).message
      });
    }
  };

  return (
    <Paper square={true} elevation={0}>
      <Container maxWidth="xl">
        <Box py={4}>
          <Box mt={-1} ml={-0.5} mb={1}>
            <Button
              color="primary"
              startIcon={<Icon path={mdiArrowLeft} size={0.9} />}
              onClick={() => history.push(`/admin/users`)}>
              <strong>Back to Manage Users</strong>
            </Button>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Box flex="1 1 auto" className={classes.projectTitleContainer}>
              <Typography variant="h1" className={classes.projectTitle}>
                User: <span>{userDetails.user_identifier}</span>
              </Typography>
              <Box mt={0.75} display="flex" alignItems="center">
                <Typography
                  component="span"
                  variant="subtitle1"
                  color="textSecondary"
                  style={{ display: 'flex', alignItems: 'center' }}>
                  {userDetails.role_names[0]}
                </Typography>
              </Box>
            </Box>
            <Box flex="0 0 auto" className={classes.titleActions}>
              <Button
                title="Remove User"
                variant="outlined"
                startIcon={<Icon path={mdiTrashCanOutline} size={1} />}
                data-testid={'remove-user-button'}
                onClick={() =>
                  openYesNoDialog({
                    dialogTitle: SystemUserI18N.removeSystemUserTitle,
                    dialogContent: (
                      <Typography variant="body1" color="textSecondary">
                        Removing user <strong>{userDetails.user_identifier}</strong> will revoke their access to all
                        projects. Are you sure you want to proceed?
                      </Typography>
                    ),
                    yesButtonProps: { color: 'error' },
                    yesButtonLabel: 'Remove',
                    noButtonLabel: 'Cancel',
                    onYes: () => {
                      deActivateSystemUser(userDetails);
                      dialogContext.setYesNoDialog({ open: false });
                    }
                  })
                }>
                Remove User
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Paper>
  );
};

export default UsersDetailHeader;
