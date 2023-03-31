import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ProjectViewObject } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { getFormattedAmount, getFormattedDateRangeString } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  fundingSourceMeta: {}
}));

export interface IProjectFundingProps {
  projectForViewData: ProjectViewObject;
}

/**
 * Funding source content for a project.
 *
 * @param {IProjectFundingProps} props
 * @return {*}
 */
const FundingSource = (props: IProjectFundingProps) => {
  const classes = useStyles();
  const {
    projectForViewData: { funding }
  } = props;

  const hasFundingSources = funding.fundingSources && funding.fundingSources.length > 0;

  return (
    <>
      <List disablePadding>
        {hasFundingSources &&
          funding.fundingSources.map((item: any) => (
            <ListItem disableGutters divider key={item.id}>
              <Box flex="1 1 auto">
                <Box pb={1.25}>
                  <Typography component="span">
                    {item.agency_name}
                    {item.investment_action_category_name !== 'Not Applicable' && (
                      <Typography component="span">&nbsp;({item.investment_action_category_name})</Typography>
                    )}
                  </Typography>
                </Box>
                <Box component="dl" m={0} className={classes.fundingSourceMeta}>
                  <Grid container spacing={1}>
                    <Grid item sm={6}>
                      <Typography component="dt" variant="subtitle2" color="textSecondary">
                        Project ID
                      </Typography>
                      <Typography component="dd">{item.agency_project_id || 'No Agency Project ID'}</Typography>
                    </Grid>
                    <Grid item sm={6}>
                      <Typography component="dt" variant="subtitle2" color="textSecondary">
                        Timeline
                      </Typography>
                      <Typography component="dd">
                        {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, item.start_date, item.end_date)}
                      </Typography>
                    </Grid>
                    <Grid item sm={12}>
                      <Typography component="dt" variant="subtitle2" color="textSecondary">
                        Funding Amount
                      </Typography>
                      <Typography component="dd">{getFormattedAmount(item.funding_amount)}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </ListItem>
          ))}

        {!hasFundingSources && (
          <ListItem disableGutters>
            <Typography>No Funding Sources</Typography>
          </ListItem>
        )}
      </List>
    </>
  );
};

export default FundingSource;
