import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import PageHeader from 'components/layout/PageHeader';
import { SystemUserI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import React, { useCallback, useContext, useMemo } from 'react';
import { useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export interface IUsersHeaderProps {
  userDetails: ISystemUser;
}

const UsersDetailHeader: React.FC<IUsersHeaderProps> = (props) => {
  const { userDetails } = props;
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
    <PageHeader
      breadCrumbJSX={
        <Breadcrumbs aria-label="breadcrumb" separator={'>'}>
          <Link component={RouterLink} underline="hover" to={`/admin/users`} aria-label="Back to Manage Users">
            Manage Users
          </Link>
          <Typography component="a" variant="inherit" color="textSecondary" aria-current="page">
            {userDetails.display_name}
          </Typography>
        </Breadcrumbs>
      }
      title={userDetails.display_name}
      subTitleJSX={
        <Typography component="span" color="textSecondary">
          {userDetails.role_names[0]}
        </Typography>
      }
      buttonJSX={
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
                  Removing user <strong>{userDetails.user_identifier}</strong> will revoke their access to all projects.
                  Are you sure you want to proceed?
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
      }
    />
  );
};

export default UsersDetailHeader;
