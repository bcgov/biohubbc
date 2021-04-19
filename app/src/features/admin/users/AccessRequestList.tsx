import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { DATE_FORMAT } from 'constants/dateFormats';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import React, { useEffect, useState } from 'react';
import { getFormattedDate } from 'utils/Utils';

/**
 * Page to display a list of user access.
 *
 * @return {*}
 */
const AccessRequestList: React.FC = () => {
  const biohubApi = useBiohubApi();

  const [accessRequests, setAccessRequests] = useState<IGetAccessRequestsListResponse[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getAccessRequests = async () => {
      const accessRequestResponse = await biohubApi.admin.getAccessRequests();

      setAccessRequests(() => {
        setIsLoading(false);
        return accessRequestResponse;
      });
    };

    if (!isLoading) {
      return;
    }

    getAccessRequests();
  }, [biohubApi, isLoading]);

  return (
    <Paper>
      <Box p={2}>
        <Typography variant="h2">Access Requests ({accessRequests?.length || 0})</Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Regional Offices</TableCell>
              <TableCell>Request Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody data-testid="project-table">
            {!accessRequests?.length && (
              <TableRow data-testid={'access-request-row-0'}>
                <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                  No Access Requests
                </TableCell>
              </TableRow>
            )}
            {accessRequests?.map((row, index) => (
              <TableRow data-testid={`access-request-row-${index}`} key={1 || row.id}>
                <TableCell>{'awda' || row.name}</TableCell>
                <TableCell>{'awda' || row.username}</TableCell>
                <TableCell>{'awda' || row.company}</TableCell>
                <TableCell>{'awda' || row.regionalOffices}</TableCell>
                <TableCell>{'awda' || getFormattedDate(DATE_FORMAT.MediumDateFormat2, row.requestDate)}</TableCell>
                <TableCell>{'awda' || row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default AccessRequestList;
