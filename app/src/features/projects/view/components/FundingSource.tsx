import { Box, Grid, Button, Typography, Divider, IconButton } from '@material-ui/core';
import React, { Fragment } from 'react';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { makeStyles } from '@material-ui/core/styles';
import { DATE_FORMAT } from 'constants/dateFormats';
import { getFormattedDateRangeString, getFormattedAmount } from 'utils/Utils';
import { Edit } from '@material-ui/icons';

const useStyles = makeStyles({
  heading: {
    fontWeight: 'bold'
  },
  addButton: {
    border: '2px solid'
  },
  topBorder: {
    color: '#adb5bd',
    width: '100%'
  }
});

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Funding source content for a project.
 *
 * @return {*}
 */
const FundingSource: React.FC<IProjectDetailsProps> = (props) => {
  const {
    projectForViewData: { funding }
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
          <Fragment key={item.agency_id}>
            <Grid container item>
              <Divider className={classes.topBorder} />
            </Grid>
            <Grid container item spacing={3} xs={12} justify="space-between" alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography className={classes.heading}>{item.agency_name}</Typography>
                </Box>
              </Grid>
              <Grid item>
                <IconButton title="Edit General Information" aria-label="Edit General Information">
                  <Typography variant="caption">
                    <Edit fontSize="inherit" /> EDIT
                  </Typography>
                </IconButton>
              </Grid>
            </Grid>
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
                  <Typography variant="subtitle1">{getFormattedAmount(item.funding_amount)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box color="text.disabled">
                  <Typography variant="caption">Funding Dates</Typography>
                </Box>
                <Box>
                  <Typography style={{ wordBreak: 'break-all' }} variant="subtitle1">
                    {getFormattedDateRangeString(DATE_FORMAT.ShortDateFormatMonthFirst, item.start_date, item.end_date)}
                  </Typography>
                </Box>
              </Grid>
              {item.investment_action_category !== 'Not Applicable' && (
                <Grid item xs={12} sm={6} md={4}>
                  <Box color="text.disabled">
                    <Typography variant="caption">Investment Category</Typography>
                  </Box>
                  <Box>
                    <Typography style={{ wordBreak: 'break-all' }} variant="subtitle1">
                      {item.investment_action_category}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </>
  );
};

export default FundingSource;
