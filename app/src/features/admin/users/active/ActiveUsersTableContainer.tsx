import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import EditDialog from 'components/dialog/EditDialog';
import { AddSystemUserI18N, DeleteSystemUserI18N, UpdateSystemUserI18N } from 'constants/i18n';
import { ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { useEffect, useMemo, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import AddSystemUsersForm, {
  AddSystemUsersFormInitialValues,
  AddSystemUsersFormYupSchema,
  IAddSystemUsersForm
} from '../add/AddSystemUsersForm';
import ActiveUsersFilterForm, { IActiveUserFilters } from './filters/ActiveUsersFilterForm';
import ActiveUsersTable from './table/ActiveUsersTable';

// Default pagination parameters
const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 10,
  sort: 'system_user_id',
  order: 'asc'
};

/**
 * Container for the table of active system users, with controls for updating user roles and deleting users
 *
 * @returns {*}
 */
const ActiveUsersTableContainer = () => {
  const biohubApi = useBiohubApi();

  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);

  const dialogContext = useDialogContext();
  const codesContext = useCodesContext();
  const authStateContext = useAuthStateContext();

  // Pagination and sorting state
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: initialPaginationParams.limit,
    page: initialPaginationParams.page
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: initialPaginationParams.sort, sort: initialPaginationParams.order }
  ]);

  const paginationSort = useMemo(() => {
    const sort = firstOrNull(sortModel);
    return {
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,
      page: paginationModel.page + 1
    };
  }, [paginationModel, sortModel]);

  // Load active users via data loader
  const activeUsersDataLoader = useDataLoader((filters: IActiveUserFilters, pagination: any) => {
    return biohubApi.user.getUsersList(filters, pagination);
  });

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  useEffect(() => {
    activeUsersDataLoader.refresh({}, paginationSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationSort]);

  // The total number of active users in the system
  const rowCount = activeUsersDataLoader.data?.pagination.total ?? 0;

  const handleRemoveUserClick = (user: ISystemUser) => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Remove User?',
      dialogContent: `Are you sure you want to remove ${user.display_name}?`,
      yesButtonLabel: 'Remove',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'error' },
      open: true,
      onYes: () => {
        removeUser(user);
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => dialogContext.setYesNoDialog({ open: false })
    });
  };

  const removeUser = async (user: ISystemUser) => {
    try {
      await biohubApi.user.deleteSystemUser(user.system_user_id);

      activeUsersDataLoader.refresh({}, paginationSort);

      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: `User ${user.display_name} removed successfully.`
      });
    } catch (error) {
      const apiError = error as APIError;
      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: DeleteSystemUserI18N.deleteUserErrorTitle,
        dialogText: DeleteSystemUserI18N.deleteUserErrorText,
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors,
        onOk: () => dialogContext.setErrorDialog({ open: false }),
        onClose: () => dialogContext.setErrorDialog({ open: false })
      });
    }
  };

  const handleAddSystemUsersSave = async (values: IAddSystemUsersForm) => {
    const systemUser = values.systemUser;
    setOpenAddUserDialog(false);

    try {
      await biohubApi.admin.addSystemUser(
        systemUser.userIdentifier,
        systemUser.identitySource,
        systemUser.displayName,
        systemUser.email,
        systemUser.systemRole
      );

      activeUsersDataLoader.refresh({}, paginationSort);

      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: `Successfully added ${systemUser.displayName}`
      });
    } catch (error) {
      const apiError = error as APIError;
      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: AddSystemUserI18N.addUserErrorTitle,
        dialogText: AddSystemUserI18N.addUserErrorText,
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors,
        onClose: () => dialogContext.setErrorDialog({ open: false })
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

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
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
          <Typography variant="body2" component="div">
            User <strong>{user.user_identifier}</strong>'s role has changed to <strong>{roleName}</strong>.
          </Typography>
        ),
        open: true
      });

      if (authStateContext.simsUserWrapper.systemUserId === user.system_user_id) {
        // User is changing their own role
        authStateContext.simsUserWrapper.refresh();
      } else {
        // Refresh users list
        activeUsersDataLoader.refresh({}, paginationSort);
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

  return (
    <>
      <Paper>
        <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h4" component="h2">
            Active Users&nbsp;
            <Typography
              component="span"
              variant="inherit"
              color="textSecondary"
              sx={{
                fontWeight: 400
              }}>
              ({rowCount})
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
        <Divider />
        <Box px={3} py={2}>
          <ActiveUsersFilterForm
            handleSubmit={(values: IActiveUserFilters) => {
              activeUsersDataLoader.refresh(values, paginationSort);
            }}
          />
        </Box>
        <Box>
          {/* Active Users Table */}
          <ActiveUsersTable
            activeUsers={activeUsersDataLoader.data?.users ?? []}
            systemRoles={codesContext.codesDataLoader.data?.system_roles ?? []}
            onRemoveUserClick={handleRemoveUserClick}
            handleChangeUserPermissionsClick={handleChangeUserPermissionsClick}
            pagination={paginationModel}
            setPagination={setPaginationModel}
            sortModel={sortModel}
            setSortModel={setSortModel}
            rowCount={rowCount}
          />
        </Box>
      </Paper>

      <EditDialog
        dialogTitle={'Add User'}
        open={openAddUserDialog}
        dialogSaveButtonLabel={'Add'}
        size="sm"
        component={{
          element: (
            <>
              <Typography color="textSecondary" mb={3}>
                This form creates a new user that will be linked to an IDIR/BCeID when an account with a matching
                username, email, and account type logs in.
              </Typography>
              <AddSystemUsersForm
                systemRoles={
                  codesContext.codesDataLoader.data?.system_roles?.map((item) => {
                    return { value: item.id, label: item.name };
                  }) ?? []
                }
              />
            </>
          ),
          initialValues: AddSystemUsersFormInitialValues,
          validationSchema: AddSystemUsersFormYupSchema,
          validateOnBlur: false
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

export default ActiveUsersTableContainer;
