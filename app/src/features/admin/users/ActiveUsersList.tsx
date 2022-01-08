import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { Grid } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import Toolbar from '@material-ui/core/Toolbar';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { mdiDotsVertical, mdiMenuDown, mdiTrashCanOutline, mdiPlus, mdiInformationOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CustomMenuButton, CustomMenuIconButton } from 'components/toolbar/ActionToolbars';
import { DeleteSystemUserI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetUserResponse } from 'interfaces/useUserApi.interface';
import { useHistory } from 'react-router';
import React, { useContext, useState } from 'react';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';
import EditDialog from 'components/dialog/EditDialog';
import AddSystemUsersForm, {
  AddSystemUsersFormInitialValues,
  AddSystemUsersFormYupSchema,
  IAddSystemUsersForm
} from './AddSystemUsersForm';

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    tableLayout: 'fixed',
    '& td': {
      verticalAlign: 'middle'
    }
  }
}));

export interface IActiveUsersListProps {
  activeUsers: IGetUserResponse[];
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Table to display a list of active users.
 *
 * @param {*} props
 * @return {*}
 */
const ActiveUsersList: React.FC<IActiveUsersListProps> = (props) => {
  const classes = useStyles();
  const restorationTrackerApi = useRestorationTrackerApi();
  const { activeUsers, codes } = props;
  const history = useHistory();

  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [page, setPage] = useState(0);
  const dialogContext = useContext(DialogContext);

  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);

  const defaultErrorDialogProps = {
    dialogTitle: DeleteSystemUserI18N.deleteErrorTitle,
    dialogText: DeleteSystemUserI18N.deleteErrorText,
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

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const handleRemoveUserClick = (row: IGetUserResponse) => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Remove User?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Removing user <strong>{row.user_identifier}</strong> will revoke their access to this application and all
          related projects. Are you sure you want to proceed?
        </Typography>
      ),
      yesButtonLabel: 'Remove User',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'secondary' },
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

  const deActivateSystemUser = async (user: IGetUserResponse) => {
    if (!user?.id) {
      return;
    }
    try {
      await restorationTrackerApi.user.deleteSystemUser(user.id);

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

      props.refresh();
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
    }
  };

  const handleChangeUserPermissionsClick = (row: IGetUserResponse, newRoleName: any, newRoleId: number) => {
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

  const changeSystemUserRole = async (user: IGetUserResponse, roleId: number, roleName: string) => {
    if (!user?.id) {
      return;
    }
    const roleIds = [roleId];

    try {
      await restorationTrackerApi.user.updateSystemUserRoles(user.id, roleIds);

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

      props.refresh();
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
    }
  };

  const handleAddSystemUsersSave = async (values: IAddSystemUsersForm) => {
    setOpenAddUserDialog(false);

    try {
      for (const systemUser of values.systemUsers) {
        await restorationTrackerApi.admin.addSystemUser(
          systemUser.userIdentifier,
          systemUser.identitySource,
          systemUser.system_role
        );
      }

      props.refresh();

      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <Typography variant="body2" component="div">
            {values.systemUsers.length} system {values.systemUsers.length > 1 ? 'users' : 'user'} added.
          </Typography>
        )
      });
    } catch (error) {
      dialogContext.setErrorDialog({
        ...defaultErrorDialogProps,
        open: true,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError).errors
      });
    }
  };

  return (
    <>
      <Paper>
        <Toolbar disableGutters>
          <Grid
            justify="space-between" // Add it here :)
            container
            alignItems="center">
            <Grid item>
              <Box px={2}>
                <Typography variant="h2">Active Users ({activeUsers?.length || 0})</Typography>
              </Box>
            </Grid>

            <Grid item>
              <Box my={1} mx={2}>
                <Button
                  color="primary"
                  variant="outlined"
                  disableElevation
                  data-testid="invite-system-users-button"
                  aria-label={'Add Users'}
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  onClick={() => setOpenAddUserDialog(true)}>
                  <strong>Add Users</strong>
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
        <TableContainer>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell width="100px" align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="active-users-table">
              {!activeUsers?.length && (
                <TableRow data-testid={'active-users-row-0'}>
                  <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                    No Active Users
                  </TableCell>
                </TableRow>
              )}
              {activeUsers.length > 0 &&
                activeUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow data-testid={`active-user-row-${index}`} key={row.id}>
                    <TableCell>
                      <strong>{row.user_identifier || 'Not Applicable'}</strong>
                    </TableCell>
                    <TableCell>
                      <Box m={-1}>
                        <CustomMenuButton
                          buttonLabel={row.role_names.join(', ') || 'Not Applicable'}
                          buttonTitle={'Change User Permissions'}
                          buttonProps={{ variant: 'text' }}
                          menuItems={codes.system_roles
                            .sort((item1, item2) => {
                              return item1.name.localeCompare(item2.name);
                            })
                            .map((item) => {
                              return {
                                menuLabel: item.name,
                                menuOnClick: () => handleChangeUserPermissionsClick(row, item.name, item.id)
                              };
                            })}
                          buttonEndIcon={<Icon path={mdiMenuDown} size={1} />}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box my={-1}>
                        <CustomMenuIconButton
                          buttonTitle="Actions"
                          buttonIcon={<Icon path={mdiDotsVertical} size={1} />}
                          menuItems={[
                            {
                              menuIcon: <Icon path={mdiInformationOutline} size={0.875} />,
                              menuLabel: 'View Users Details',
                              menuOnClick: () =>
                                history.push({
                                  pathname: `/admin/users/${row.id}`,
                                  state: row
                                })
                            },
                            {
                              menuIcon: <Icon path={mdiTrashCanOutline} size={0.875} />,
                              menuLabel: 'Remove User',
                              menuOnClick: () => handleRemoveUserClick(row)
                            }
                          ]}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        {activeUsers?.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 15, 20]}
            component="div"
            count={activeUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={(event: unknown, newPage: number) => handleChangePage(event, newPage, setPage)}
            onChangeRowsPerPage={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChangeRowsPerPage(event, setPage, setRowsPerPage)
            }
          />
        )}
      </Paper>

      <EditDialog
        dialogTitle={'Add Users'}
        open={openAddUserDialog}
        dialogSaveButtonLabel={'Add'}
        component={{
          element: (
            <AddSystemUsersForm
              system_roles={
                props.codes?.system_roles?.map((item) => {
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
