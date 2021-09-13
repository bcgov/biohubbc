import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
// import { mdiPlus } from '@mdi/js';
// import Icon from '@mdi/react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
//import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';

//, { useEffect, useState } from 'react';
//import { useHistory } from 'react-router';
//import { IGetResourcesListResponse } from 'interfaces/useResourcesApi.interface';

/**
 * Page to display a list of permits.
 *
 * @return {*}
 */
const ResourcesPage: React.FC = () => {
  const resources = [
    {
      id: '1',
      name: 'resource 1',
      link: 'link1'
    },
    {
      id: '2',
      name: 'resource 2',
      link: 'link2'
    }
  ];

  const getResourcesList = () => {
    const hasResources = resources.length > 0;

    if (!hasResources) {
      return (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Link</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6}>
                <Box display="flex" justifyContent="center">
                  No Results
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    } else {
      return (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Link</TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="resources-table">
              {resources?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row"></TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.link}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
  };

  /**
   * Displays permits list.
   */
  return (
    <Box my={4}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" justifyContent="space-between">
          <Typography variant="h1">Resources</Typography>
        </Box>
        <Paper>
          {/* <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
            <Typography variant="h4" component="h3">
              {permitCount} {permitCount !== 1 ? 'Permits' : 'Permit'} found
            </Typography>
          </Box> */}
          <Divider></Divider>
          {getResourcesList()}
        </Paper>
      </Container>
    </Box>
  );
};

export default ResourcesPage;
