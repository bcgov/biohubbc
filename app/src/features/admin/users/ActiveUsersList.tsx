import { mdiAccountDetailsOutline, mdiChevronDown, mdiDotsVertical, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import EditDialog from 'components/dialog/EditDialog';
import { CustomMenuButton, CustomMenuIconButton } from 'components/toolbar/ActionToolbars';
import { AddSystemUserI18N, DeleteSystemUserI18N, UpdateSystemUserI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import AddSystemUsersForm, {
  AddSystemUsersFormInitialValues,
  AddSystemUsersFormYupSchema,
  IAddSystemUsersForm
} from './AddSystemUsersForm';

export interface IActiveUsersListProps {
  activeUsers: ISystemUser[];
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

const pageSizeOptions = [10, 25, 50];

/**
 * Table to display a list of active users.
 *
 */
const ActiveUsersList = (props: IActiveUsersListProps) => {
  const { activeUsers, codes, refresh } = props;

  const authStateContext = useAuthStateContext();
  const biohubApi = useBiohubApi();
  const history = useHistory();

  const dialogContext = useContext(DialogContext);

  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);

  const activeUsersColumnDefs: GridColDef<ISystemUser>[] = [
    {
      field: 'user_identifier',
      headerName: 'Username',
      flex: 1,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Link
            sx={{ fontWeight: 700 }}
            underline="always"
            to={`/admin/users/${params.row.system_user_id}`}
            component={RouterLink}>
            {params.row.user_identifier || 'No identifier'}
          </Link>
        );
      }
    },
    {
      field: 'role_names',
      flex: 1,
      headerName: 'Role',
      disableColumnMenu: true,
      valueGetter: (params) => {
        return params.row.role_names[0];
      },
      renderCell: (params) => {
        return (
          <CustomMenuButton
            buttonLabel={params.value ?? 'Not Applicable'}
            buttonTitle={'Change User Permissions'}
            buttonProps={{ variant: 'outlined', size: 'small' }}
            menuItems={codes.system_roles
              .sort((item1, item2) => {
                return item1.name.localeCompare(item2.name);
              })
              .map((item) => {
                return {
                  menuLabel: item.name,
                  menuOnClick: () => handleChangeUserPermissionsClick(params.row, item.name, item.id)
                };
              })}
            buttonEndIcon={<Icon path={mdiChevronDown} size={1} />}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: '',
      type: 'actions',
      width: 70,
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      renderCell: (params) => {
        return (
          <CustomMenuIconButton
            buttonTitle="Actions"
            buttonIcon={<Icon path={mdiDotsVertical} size={1} />}
            menuItems={[
              {
                menuIcon: <Icon path={mdiAccountDetailsOutline} size={1} />,
                menuLabel: 'View Users Details',
                menuOnClick: () =>
                  history.push({
                    pathname: `/admin/users/${params.row.system_user_id}`,
                    state: params.row
                  })
              },
              {
                menuIcon: <Icon path={mdiTrashCanOutline} size={1} />,
                menuLabel: 'Remove User',
                menuOnClick: () => handleRemoveUserClick(params.row)
              }
            ]}
          />
        );
      }
    }
  ];

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const handleRemoveUserClick = (row: ISystemUser) => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Remove User?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Removing user <strong>{row.user_identifier}</strong> will revoke their access to this application and all
          related projects. Are you sure you want to proceed?
        </Typography>
      ),
      yesButtonLabel: 'Remove',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'error' },
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      open: true,
      onYes: () => {
        deActivateSystemUser(row);
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const deActivateSystemUser = async (user: ISystemUser) => {
    if (!user?.system_user_id) {
      return;
    }
    try {
      await biohubApi.user.deleteSystemUser(user.system_user_id);

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

      if (authStateContext.simsUserWrapper.systemUserId === user.system_user_id) {
        // User is deleting themselves
        authStateContext.simsUserWrapper.refresh();
      } else {
        // Refresh users list
        refresh();
      }
    } catch (error) {
      const apiError = error as APIError;

      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: DeleteSystemUserI18N.deleteUserErrorTitle,
        dialogText: DeleteSystemUserI18N.deleteUserErrorText,
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        }
      });
    }
  };

  const handleChangeUserPermissionsClick = (row: ISystemUser, newRoleName: any, newRoleId: number) => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Change User Role?',
      dialogContent: (
        <Typography variant="body1" color="textSecondary">
          Change user <strong>{row.user_identifier}</strong>'s role to <strong>{newRoleName}</strong>?
        </Typography>
      ),
      yesButtonLabel: 'Change Role',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'primary' },
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      open: true,
      onYes: () => {
        changeSystemUserRole(row, newRoleId, newRoleName);
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const changeSystemUserRole = async (user: ISystemUser, roleId: number, roleName: string) => {
    if (!user?.system_user_id) {
      return;
    }
    const roleIds = [roleId];

    try {
      await biohubApi.user.updateSystemUserRoles(user.system_user_id, roleIds);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              User <strong>{user.user_identifier}</strong>'s role has changed to <strong>{roleName}</strong>.
            </Typography>
          </>
        ),
        open: true
      });

      if (authStateContext.simsUserWrapper.systemUserId === user.system_user_id) {
        // User is changing their own role
        authStateContext.simsUserWrapper.refresh();
      } else {
        // Refresh users list
        refresh();
      }
    } catch (error) {
      const apiError = error as APIError;
      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: UpdateSystemUserI18N.updateUserErrorTitle,
        dialogText: UpdateSystemUserI18N.updateUserErrorText,
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        }
      });
    }
  };

  const handleAddSystemUsersSave = async (values: IAddSystemUsersForm) => {
    setOpenAddUserDialog(false);

    try {
      for (const systemUser of values.systemUsers) {
        await biohubApi.admin.addSystemUser(
          systemUser.userIdentifier,
          systemUser.identitySource,
          systemUser.displayName,
          systemUser.email,
          systemUser.systemRole
        );
      }

      // Refresh users list
      refresh();

      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <Typography variant="body2" component="div">
            {values.systemUsers.length} system {values.systemUsers.length > 1 ? 'users' : 'user'} added.
          </Typography>
        )
      });
    } catch (error) {
      const apiError = error as APIError;

      if (apiError.status === 400) {
        dialogContext.setErrorDialog({
          open: true,
          dialogTitle: 'User already exists',
          dialogText: 'One of the users you added already exists.',
          onClose: () => {
            dialogContext.setErrorDialog({ open: false });
          },
          onOk: () => {
            dialogContext.setErrorDialog({ open: false });
          }
        });
      } else {
        dialogContext.setErrorDialog({
          open: true,
          dialogTitle: AddSystemUserI18N.addUserErrorTitle,
          dialogText: AddSystemUserI18N.addUserErrorText,
          dialogError: apiError.message,
          dialogErrorDetails: apiError.errors,
          onClose: () => {
            dialogContext.setErrorDialog({ open: false });
          },
          onOk: () => {
            dialogContext.setErrorDialog({ open: false });
          }
        });
      }
    }
  };

  return (
    <>
      <Paper>
        <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h4" component="h2">
            Active Users{' '}
            <Typography
              component="span"
              variant="inherit"
              color="textSecondary"
              sx={{
                fontWeight: 400
              }}>
              ({Number(activeUsers?.length ?? 0).toLocaleString()})
            </Typography>
          </Typography>
          <Button
            color="primary"
            variant="contained"
            data-testid="invite-system-users-button"
            aria-label={'Add Users'}
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => setOpenAddUserDialog(true)}>
            Add Users
          </Button>
        </Toolbar>
        <Divider></Divider>
        <Box p={2}>
          <StyledDataGrid<ISystemUser>
            noRowsMessage="No Active Users"
            columns={activeUsersColumnDefs}
            rows={activeUsers}
            getRowId={(row) => row.system_user_id}
            pageSizeOptions={pageSizeOptions}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10
                }
              }
            }}
          />
        </Box>
      </Paper>

      <EditDialog
        dialogTitle={'Add Users'}
        open={openAddUserDialog}
        dialogSaveButtonLabel={'Add'}
        component={{
          element: (
            <AddSystemUsersForm
              systemRoles={
                codes?.system_roles?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
            />
          ),
          initialValues: AddSystemUsersFormInitialValues,
          validationSchema: AddSystemUsersFormYupSchema
        }}
        onCancel={() => setOpenAddUserDialog(false)}
        onSave={(values) => {
          handleAddSystemUsersSave(values);
          setOpenAddUserDialog(false);
        }}
      />
    </>
  );
};

export default ActiveUsersList;
