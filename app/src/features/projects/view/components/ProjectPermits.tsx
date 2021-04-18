import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { mdiPencilOutline, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import clsx from 'clsx';

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

export interface IProjectPermitsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
}

/**
 * Permits content for a project.
 *
 * @return {*}
 */
const ProjectPermits: React.FC<IProjectPermitsProps> = (props) => {
  const {
    projectForViewData: { permit }
  } = props;

  const classes = useStyles();

  const hasPermits = permit.permits && permit.permits.length > 0;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h3">Permits</Typography>
        <Button
          variant="outlined"
          color="primary"
          title="Add Permit"
          aria-label="Add Permit"
          startIcon={<Icon path={mdiPlus} size={1} />}>
          Add Permit
        </Button>
      </Box>

      {hasPermits &&
        permit.permits.map((item: any, index: number) => (
          <TableContainer key={item.permit_number}>
            <Table className={classes.table} aria-label="permits-list-table">
              <TableHead>
                <TableRow>
                  <TableCell className={classes.heading}>Permit Number</TableCell>
                  <TableCell className={classes.heading}>Sampling Conducted</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">
                    {item.permit_number}
                  </TableCell>
                  <TableCell>{item.sampling_conducted ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="right" className={clsx(index === 0 && classes.tableCellBorderTop)}>
                    <Button
                      className="editButtonSmall"
                      title="Edit Permit"
                      aria-label="Edit Permit"
                      startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
                      EDIT
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ))}
    </Box>
  );
};

export default ProjectPermits;
