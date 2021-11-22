import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { mdiDotsVertical, mdiMenuDown, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CustomMenuButton, CustomMenuIconButton } from 'components/toolbar/ActionToolbars';
import { DeleteSystemUserI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetUserResponse } from 'interfaces/useUserApi.interface';
import React, { useContext, useState } from 'react';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';

const useStyles = makeStyles((theme: Theme) => ({
  activeUserTable: {
    tableLayout: 'fixed',
    '& .MuiTableCell-root': {
      verticalAlign: 'middle'
    }
  }
}));

export interface IActiveUsersListProps {
  activeUsers: IGetUserResponse[];
  codes: IGetAllCodeSetsResponse;
  getUsers: (forceFetch: boolean) => void;
}

/**
 * Table to display a list of active users.
 *
 * @param {*} props
 * @return {*}
 */
const ActiveUsersList: React.FC<IActiveUsersListProps> = (props) => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();
  const { activeUsers, codes } = props;

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const dialogContext = useContext(DialogContext);

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
      dialogTitle: 'Remove user?',
      dialogContent: (
        <>
          <Typography variant="body2" component="div">
            Removing <strong>{row.user_identifier}</strong> will revoke their access to this application and all related
            projects.
          </Typography>
          <Typography variant="body2" component="div">
            Are you sure you want to proceed?
          </Typography>
        </>
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
      await biohubApi.user.deleteSystemUser(user.id);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              User <strong>{user.user_identifier}</strong> removed.
            </Typography>
          </>
        ),
        open: true
      });

      props.getUsers(true);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
    }
  };

  const handleChangeUserPermissionsClick = (row: IGetUserResponse, newRoleName: any) => {
    console.log('system changed to ', newRoleName);

    dialogContext.setYesNoDialog({
      dialogTitle: 'Change User Role?',
      dialogContent: (
        <>
          <Typography color="textPrimary">Change user <strong>{row.user_identifier}'s</strong> role to <strong>{newRoleName}</strong>?</Typography>
        </>
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
        changeSystemUserRole(row);
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const changeSystemUserRole = async (user: IGetUserResponse) => {
    if (!user?.id) {
      return;
    }
    try {
      //await biohubApi.user.deleteSystemUser(user.id);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              User <strong>{user.user_identifier}</strong>'s role change to [new role].
            </Typography>
          </>
        ),
        open: true
      });

      props.getUsers(true);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
    }
  };

  return (
    <>
      <Paper>
        <Box p={2}>
          <Typography variant="h2">Active Users ({activeUsers?.length || 0})</Typography>
        </Box>
        <TableContainer>
          <Table className={classes.activeUserTable}>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>System Permission</TableCell>
                <TableCell width="100px" align="center">Actions</TableCell>
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
                    <TableCell>{row.user_identifier || 'Not Applicable'}</TableCell>
                    <TableCell>
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
                              menuOnClick: () => handleChangeUserPermissionsClick(row, item.name)
                            };
                          })
                        }
                        buttonEndIcon={<Icon path={mdiMenuDown} size={1} />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <CustomMenuIconButton
                        buttonTitle="Actions"
                        buttonIcon={<Icon path={mdiDotsVertical} size={0.875} />}
                        menuItems={[
                          {
                            menuIcon: <Icon path={mdiTrashCanOutline} size={0.875} />,
                            menuLabel: 'Remove User',
                            menuOnClick: () => handleRemoveUserClick(row)
                          }
                        ]}
                      />
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
    </>
  );
};

export default ActiveUsersList;
