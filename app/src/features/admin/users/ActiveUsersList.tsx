import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { IGetUserResponse } from 'interfaces/useUserApi.interface';
import React, { useState } from 'react';
import { handleChangeRowsPerPage, handleChangePage } from 'utils/tablePaginationUtils';

export interface IActiveUsersListProps {
  activeUsers: IGetUserResponse[];
}

/**
 * Table to display a list of active users.
 *
 * @param {*} props
 * @return {*}
 */
const ActiveUsersList: React.FC<IActiveUsersListProps> = (props) => {
  const { activeUsers } = props;

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  return (
    <Paper>
      <Box p={2}>
        <Typography variant="h2">Active Users ({activeUsers?.length || 0})</Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Regional Offices</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Last Active</TableCell>
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
                  <TableCell></TableCell>
                  <TableCell>{row.user_identifier || 'Not Applicable'}</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>{row.role_names.join(', ') || 'Not Applicable'}</TableCell>
                  <TableCell></TableCell>
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
  );
};

export default ActiveUsersList;
