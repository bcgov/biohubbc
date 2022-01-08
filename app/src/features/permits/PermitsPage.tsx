import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { IGetPermitsListResponse } from 'interfaces/usePermitApi.interface';

/**
 * Page to display a list of permits.
 *
 * @return {*}
 */
const PermitsPage: React.FC = () => {
  const history = useHistory();
  const restorationTrackerApi = useRestorationTrackerApi();

  const [permits, setPermits] = useState<IGetPermitsListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const permitCount = permits.length;

  const navigateToCreatePermitsPage = () => {
    history.push('/admin/permits/create');
  };

  useEffect(() => {
    const getPermits = async () => {
      const permitsResponse = await restorationTrackerApi.permit.getPermitsList();

      setPermits(() => {
        setIsLoading(false);
        return permitsResponse;
      });
    };

    if (isLoading) {
      getPermits();
    }
  }, [restorationTrackerApi, isLoading]);

  const getPermitsTableData = () => {
    const hasPermits = permits?.length > 0;

    if (!hasPermits) {
      return (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Contact Agency</TableCell>
              <TableCell>Associated Project</TableCell>
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
                <TableCell>Number</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Contact Agency</TableCell>
                <TableCell>Associated Project</TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="permit-table">
              {permits?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    {row.number}
                  </TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.coordinator_agency}</TableCell>
                  <TableCell>{row.project_name || 'No Associated Project'}</TableCell>
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
          <Typography variant="h1">Permits</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => navigateToCreatePermitsPage()}>
            Create Non-Sampling Permits
          </Button>
        </Box>
        <Paper>
          <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
            <Typography variant="h4" component="h3">
              {permitCount} {permitCount !== 1 ? 'Permits' : 'Permit'} found
            </Typography>
          </Box>
          <Divider></Divider>
          {getPermitsTableData()}
        </Paper>
      </Container>
    </Box>
  );
};

export default PermitsPage;
