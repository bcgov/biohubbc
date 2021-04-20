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
import { DATE_FORMAT } from 'constants/dateFormats';
import React, { useState } from 'react';
import { getFormattedDate } from 'utils/Utils';

/**
 * Table to display a list of active users.
 *
 * @return {*}
 */
const ActiveUsersList: React.FC = () => {
  const activeUsers = [{
    id: 1,
    name: 'Jane Doe',
    username: 'IDIR/JDOE',
    company: 'Company A',
    regionalOffices: 'Office A, Office B',
    roles: 'System Administrator',
    create_date: '2020/04/04'
  }];

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

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
        <Typography variant="h2">Access Requests ({activeUsers?.length || 0})</Typography>
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
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!activeUsers?.length && (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                  No Active Users
                </TableCell>
              </TableRow>
            )}
            {activeUsers?.map((activeUser: any) => {
              return (
                <TableRow key={activeUser.id}>
                  <TableCell>{activeUser.name  || 'Not Applicable'}</TableCell>
                  <TableCell>{activeUser.username  || 'Not Applicable'}</TableCell>
                  <TableCell>{activeUser.company || 'Not Applicable'}</TableCell>
                  <TableCell>{activeUser.regionalOffices || 'Not Applicable'}</TableCell>
                  <TableCell>{activeUser.roles || 'Not Applicable'}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.MediumDateFormat, activeUser.create_date) || 'Not Applicable'}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              );
            })}
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
