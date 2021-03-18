import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Grid,
  Button,
  IconButton,
  Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import Icon from '@mdi/react';
import { mdiTrashCanOutline } from '@mdi/js';

const useStyles = makeStyles({
  table: {
    minWidth: 650
  },
  tableCellBorder: {
    borderTop: '1px solid rgba(224, 224, 224, 1)'
  },
  heading: {
    fontWeight: 'bold'
  },
  addButton: {
    border: '2px solid'
  }
});

export interface IIUCNClassificationProps {
  projectWithDetailsData: IProjectWithDetails;
}

/**
 * IUCN Classification content for a project.
 *
 * @return {*}
 */
const IUCNClassification: React.FC<IIUCNClassificationProps> = (props) => {
  const {
    projectWithDetailsData: { iucn }
  } = props;

  const classes = useStyles();

  return (
    <>
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">IUCN Classification</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              component="label"
              size="medium"
              color="primary"
              className={classes.addButton && classes.heading}>
              Add IUCN Classification
            </Button>
          </Grid>
        </Grid>
        <TableContainer>
          <Table className={classes.table} aria-label="iucn-classification-table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.heading}>Classification</TableCell>
                <TableCell className={classes.heading}>Sub-classification</TableCell>
                <TableCell className={classes.heading}>Sub-classification</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {iucn.classificationDetails.map((classificationDetail: any) => (
                <TableRow key={classificationDetail.classification}>
                  <TableCell>{classificationDetail.classification}</TableCell>
                  <TableCell>{classificationDetail.subClassification1}</TableCell>
                  <TableCell>{classificationDetail.subClassification2}</TableCell>
                  <TableCell className={classes.tableCellBorder}>
                    <IconButton color="primary" aria-label="delete">
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </>
  );
};

export default IUCNClassification;
