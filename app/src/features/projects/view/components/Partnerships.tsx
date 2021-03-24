import {
  Grid,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import clsx from 'clsx';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

const useStyles = makeStyles({
  tableCellBorderBottom: {
    borderBottom: 'none'
  },
  tableHeading: {
    fontWeight: 'bold',
    borderBottom: 'none'
  }
});

export interface IPartnershipsProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Partnerships content for a project.
 *
 * @return {*}
 */
const Partnerships: React.FC<IPartnershipsProps> = (props) => {
  const {
    projectForViewData: {
      partnerships: { indigenous_partnerships, stakeholder_partnerships }
    }
  } = props;

  const classes = useStyles();

  return (
    <>
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Partnerships</Typography>
          </Grid>
          <Grid item>
            <IconButton title="Edit Species Information" aria-label="Edit Species Information">
              <Typography variant="caption">
                <Edit fontSize="inherit" /> EDIT
              </Typography>
            </IconButton>
          </Grid>
        </Grid>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs={12}>
            <TableContainer>
              <Table aria-label="indigenous-partnerships-table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeading}>Indigenous Partnerships</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {indigenous_partnerships?.map((indigenousPartnership: string, index: number) => {
                    return (
                      <TableRow key={index}>
                        <TableCell
                          className={clsx(
                            index === indigenous_partnerships.length - 1 && classes.tableCellBorderBottom
                          )}>
                          {indigenousPartnership}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12}>
            <TableContainer>
              <Table aria-label="stakeholder-partnerships-table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeading}>Stakeholder Partnerships</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stakeholder_partnerships?.map((stakeholderPartnership: string, index: number) => {
                    return (
                      <TableRow key={index}>
                        <TableCell
                          className={clsx(
                            index === stakeholder_partnerships.length - 1 && classes.tableCellBorderBottom
                          )}>
                          {stakeholderPartnership}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Partnerships;
