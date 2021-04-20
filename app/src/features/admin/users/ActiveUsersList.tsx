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
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetUserResponse } from 'interfaces/useUserApi.interface';
import React, { useState, useEffect } from 'react';

/**
 * Table to display a list of active users.
 *
 * @return {*}
 */
const ActiveUsersList: React.FC = () => {
  const biohubApi = useBiohubApi();

  const [activeUsers, setActiveUsers] = useState<IGetUserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const getActiveUsers = async () => {
      const activeUsersResponse = await biohubApi.user.getUsersList();

      console.log(activeUsersResponse);

      setActiveUsers(() => {
        setHasLoaded(true);
        setIsLoading(false);
        return activeUsersResponse;
      });
    };

    if (hasLoaded || isLoading) {
      return;
    }

    setIsLoading(true);

    getActiveUsers();
  }, [biohubApi, isLoading]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
};

export default ActiveUsersList;
