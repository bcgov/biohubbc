import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiArrowLeft, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import React, { useCallback, useContext } from 'react';
import { useHistory } from 'react-router';
import { IErrorDialogProps } from '../../../components/dialog/ErrorDialog';
import { IYesNoDialogProps } from '../../../components/dialog/YesNoDialog';
import { SystemUserI18N } from '../../../constants/i18n';
import { DialogContext } from '../../../contexts/dialogContext';
import { APIError } from '../../../hooks/api/useAxios';
import { useBiohubApi } from '../../../hooks/useBioHubApi';
import { IGetUserResponse } from '../../../interfaces/useUserApi.interface';

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
  userDetails: IGetUserResponse;
}

const UsersDetailHeader: React.FC<IUsersHeaderProps> = (props) => {
  const { userDetails } = props;
  const classes = useStyles();
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps: Partial<IErrorDialogProps> = {
    onClose: () => dialogContext.hideDialog()
  };

  const defaultYesNoDialogProps: Partial<IYesNoDialogProps> = {
    onClose: () => dialogContext.hideDialog(),
    onNo: () => dialogContext.hideDialog()
  };

  const openYesNoDialog = (yesNoDialogProps?: Partial<IYesNoDialogProps>) => {
    dialogContext.showYesNoDialog({
      ...defaultYesNoDialogProps,
      ...yesNoDialogProps,
      
    });
  };

  const openErrorDialog = useCallback(
    (errorDialogProps?: Partial<IErrorDialogProps>) => {
      dialogContext.showErrorDialog({
        ...defaultErrorDialogProps,
        ...errorDialogProps,
        
      });
    },
    [defaultErrorDialogProps, dialogContext]
  );

  const deActivateSystemUser = async (user: IGetUserResponse) => {
    if (!user?.id) {
      return;
    }
    try {
      await biohubApi.user.deleteSystemUser(user.id);

      dialogContext.showSnackbar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              User <strong>{user.user_identifier}</strong> removed from application.
            </Typography>
          </>
        )
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
                startIcon={<Icon path={mdiTrashCanOutline} size={0.8} />}
                data-testid={'remove-user-button'}
                onClick={() =>
                  openYesNoDialog({
                    dialogTitle: SystemUserI18N.removeSystemUserTitle,
                    dialogContent: (
                      <>
                        <Typography variant="body1" color="textPrimary">
                          Removing this user <strong>{userDetails.user_identifier}</strong> will revoke their access to
                          all projects.
                        </Typography>
                        <Typography variant="body1" color="textPrimary">
                          Are you sure you want to proceed?
                        </Typography>
                      </>
                    ),
                    yesButtonProps: { color: 'secondary' },
                    onYes: () => {
                      deActivateSystemUser(userDetails);
                      dialogContext.hideDialog();
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
