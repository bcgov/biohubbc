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

export interface ISpeciesProps {
  projectForViewData: IGetProjectForViewResponse;
}

const useStyles = makeStyles({
  tableCellBorderBottom: {
    borderBottom: 'none'
  },
  tableHeading: {
    fontWeight: 'bold',
    borderBottom: 'none'
  }
});

/**
 * Species content for a project.
 *
 * @return {*}
 */
const Species: React.FC<ISpeciesProps> = (props) => {
  const {
    projectForViewData: {
      species: { focal_species, ancillary_species }
    }
  } = props;

  const classes = useStyles();

  return (
    <>
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Species</Typography>
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
          <Grid container item xs={12}>
            <TableContainer>
              <Table aria-label="focal-species-table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeading}>Focal Species</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {focal_species?.map((focalSpecies: string, index: number) => {
                    return (
                      <TableRow key={index}>
                        <TableCell
                          className={clsx(index === focal_species.length - 1 && classes.tableCellBorderBottom)}>
                          {focalSpecies}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid container item xs={12}>
            <TableContainer>
              <Table aria-label="ancillary-species-table">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeading}>Ancillary Species</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ancillary_species?.map((ancillarySpecies: string, index: number) => {
                    return (
                      <TableRow key={index}>
                        <TableCell
                          className={clsx(index === ancillary_species.length - 1 && classes.tableCellBorderBottom)}>
                          {ancillarySpecies}
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

export default Species;
