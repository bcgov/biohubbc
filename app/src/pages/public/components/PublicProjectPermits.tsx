import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

const useStyles = makeStyles({
  table: {
    minWidth: 650
  },
  heading: {
    fontWeight: 'bold'
  },
  tableCellBorderTop: {
    borderTop: '1px solid rgba(224, 224, 224, 1)'
  }
});

export interface IPublicProjectPermitsProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Permits content for a public (published) project.
 *
 * @return {*}
 */
const PublicProjectPermits: React.FC<IPublicProjectPermitsProps> = (props) => {
  const {
    projectForViewData: { permit }
  } = props;

  const classes = useStyles();

  const hasPermits = permit.permits && permit.permits.length > 0;

  return (
    <Box>
      <Box mb={2} height="2rem">
        <Typography variant="h3">Project Permits</Typography>
      </Box>

      {hasPermits && (
        <TableContainer>
          <Table className={classes.table} aria-label="permits-list-table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.heading}>Permit Number</TableCell>
                <TableCell className={classes.heading}>Permit Type</TableCell>
              </TableRow>
            </TableHead>
            {permit.permits.map((item: any) => (
              <TableBody key={item.permit_number}>
                <TableRow>
                  <TableCell component="th" scope="row">
                    {item.permit_number}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {item.permit_type}
                  </TableCell>
                </TableRow>
              </TableBody>
            ))}
          </Table>
        </TableContainer>
      )}

      {!hasPermits && (
        <Box component="ul" className="listNoBullets">
          <Box component="li">
            <Typography component="dd" variant="body1">
              No Permits
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PublicProjectPermits;
