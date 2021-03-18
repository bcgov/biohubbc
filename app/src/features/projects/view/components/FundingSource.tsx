import { Box, Grid, Button, Typography } from '@material-ui/core';
import React from 'react';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  heading: {
    fontWeight: 'bold'
  },
  addButton: {
    border: '2px solid'
  }
});

export interface IProjectDetailsProps {
  projectWithDetailsData: IProjectWithDetails;
}

/**
 * Funding source content for a project.
 *
 * @return {*}
 */
const FundingSource: React.FC<IProjectDetailsProps> = (props) => {
  const {
    projectWithDetailsData: { funding }
  } = props;

  const classes = useStyles();

  return (
    <>
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Funding Sources</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              component="label"
              size="medium"
              color="primary"
              className={classes.addButton && classes.heading}>
              Add Funding Source
            </Button>
          </Grid>
        </Grid>
        {funding.fundingAgencies.map((item: any) => (
          <Grid container item spacing={3} xs={12}>
            <Grid item xs={12} sm={6} md={4}>
              <Box color="text.disabled">
                <Typography variant="caption">Agency Project ID</Typography>
              </Box>
              <Box>
                <Typography style={{ wordBreak: 'break-all' }} variant="subtitle1">
                  {item.agency_id}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box color="text.disabled">
                <Typography variant="caption">Funding Amount</Typography>
              </Box>
              <Box>
                <Typography style={{ wordBreak: 'break-all' }} variant="subtitle1">
                  {item.funding_amount}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default FundingSource;
