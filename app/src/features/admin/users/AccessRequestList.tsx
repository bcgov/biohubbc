import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { DATE_FORMAT } from 'constants/dateFormats';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { GetAccessRequestListItem, IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import React, { useEffect, useState } from 'react';
import { getFormattedDate } from 'utils/Utils';

export enum administrativeActivityStatus {
  PENDING = 'pending',
  ACTIONED = 'actioned',
  REJECTED = 'rejected'
}

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    padding: '0px 8px',
    borderRadius: '4px',
    color: 'white'
  },
  chipPending: {
    backgroundColor: theme.palette.primary.light
  },
  chipActioned: {
    backgroundColor: theme.palette.success.light
  },
  chipRejected: {
    backgroundColor: theme.palette.error.light
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

/**
 * Page to display a list of user access.
 *
 * @return {*}
 */
const AccessRequestList: React.FC = () => {
  const classes = useStyles();

  const biohubApi = useBiohubApi();

  const [accessRequests, setAccessRequests] = useState<IGetAccessRequestsListResponse[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const getAccessRequests = async () => {
      const accessRequestResponse = await biohubApi.admin.getAccessRequests();

      setAccessRequests(() => {
        setHasLoaded(true);
        setIsLoading(false);
        return accessRequestResponse;
      });
    };

    if (hasLoaded || isLoading) {
      return;
    }

    setIsLoading(true);

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
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody data-testid="access-request-table">
            {!accessRequests?.length && (
              <TableRow data-testid={'access-request-row-0'}>
                <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                  No Access Requests
                </TableCell>
              </TableRow>
            )}
            {accessRequests?.map((row, index) => {
              const accessItem = new GetAccessRequestListItem(row);

              return (
                <TableRow data-testid={`access-request-row-${index}`} key={accessItem.id}>
                  <TableCell>{'Some User' || accessItem.name}</TableCell>
                  <TableCell>{'someuser' || accessItem.username}</TableCell>
                  <TableCell>{'Company' || accessItem.company}</TableCell>
                  <TableCell>{'Regional Office' || accessItem.regionalOffices}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.MediumDateFormat2, accessItem.create_date)}</TableCell>
                  <TableCell>
                    <Chip
                      className={clsx(
                        classes.chip,
                        (administrativeActivityStatus.ACTIONED === accessItem.status_name?.toLowerCase() &&
                          classes.chipActioned) ||
                          (administrativeActivityStatus.REJECTED === accessItem.status_name?.toLowerCase() &&
                            classes.chipRejected) ||
                          classes.chipPending
                      )}
                      label={accessItem.status_name}
                    />
                  </TableCell>

                  <TableCell>
                    <Button className={classes.actionButton} color="primary" variant="outlined">
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default AccessRequestList;
