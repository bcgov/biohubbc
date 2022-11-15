import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { getFormattedAmount, getFormattedDateRangeString } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  fundingSourceMeta: {}
}));

export interface IProjectFundingProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Funding source content for a project.
 *
 * @return {*}
 */
const FundingSource: React.FC<IProjectFundingProps> = (props) => {
  const classes = useStyles();
  const {
    projectForViewData: { funding }
  } = props;

  const hasFundingSources = funding.fundingSources && funding.fundingSources.length > 0;

  return (
    <>
      <List disablePadding>
        {hasFundingSources &&
          funding.fundingSources.map((item: any, index: number) => (
            <ListItem disableGutters divider key={item.id} style={{padding: 0}}>
              <Box flex="1 1 auto">
                <Box py={1}>
                  <Typography component="span">
                    {item.agency_name}
                    {item.investment_action_category_name !== 'Not Applicable' && (
                      <Typography component="span">&nbsp;({item.investment_action_category_name})</Typography>
                    )}
                  </Typography>
                </Box>
                <Box component="dl" m={0} className={classes.fundingSourceMeta}>
                  <Box display="flex">
                    <Typography component="dt" color="textSecondary">
                      Project ID
                    </Typography>
                    <Typography component="dd">{item.agency_project_id || 'No Agency Project ID'}</Typography>
                  </Box>
                  <Box display="flex">
                    <Typography component="dt" color="textSecondary">
                      Amount
                    </Typography>
                    <Typography component="dd">{getFormattedAmount(item.funding_amount)}</Typography>
                  </Box>
                  <Box display="flex">
                    <Typography component="dt" color="textSecondary">
                      Timeline
                    </Typography>
                    <Typography component="dd">
                      {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, item.start_date, item.end_date)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </ListItem>
          ))}

        {!hasFundingSources && (
          <ListItem>
            <Typography>No Funding Sources</Typography>
          </ListItem>
        )}
      </List>
    </>
  );
};

export default FundingSource;
