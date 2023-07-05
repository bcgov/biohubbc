import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { getFormattedAmount, getFormattedDateRangeString } from 'utils/Utils';

export interface IFundingSource {
  id: number;
  agency_name?: string;
  investment_action_category_name?: string;
  funding_amount?: number;
  start_date?: string;
  end_date?: string;
  agency_project_id: string;
  first_nations_name?: string;
}

interface IFundingSourceProps {
  funding_sources: IFundingSource[];
}

/**
 * Funding source content for a project.
 *
 * @return {*}
 */
const FundingSource = (props: IFundingSourceProps) => {
  const hasFundingSources = props.funding_sources.length > 0;
  return (
    <>
      <List disablePadding>
        {hasFundingSources &&
          props.funding_sources.map((item: IFundingSource) => (
            <ListItem disableGutters divider key={item.id}>
              <Box flex="1 1 auto">
                <Box pb={1.25}>
                  <Typography component="span">
                    {item.agency_name ?? item.first_nations_name}
                    {item.investment_action_category_name &&
                      item.investment_action_category_name !== 'Not Applicable' && (
                        <Typography component="span">&nbsp;({item.investment_action_category_name})</Typography>
                      )}
                  </Typography>
                </Box>
                <Box component="dl" m={0}>
                  <Grid container spacing={1}>
                    <Grid item sm={6}>
                      <Typography component="dt" variant="subtitle2" color="textSecondary">
                        Project ID
                      </Typography>
                      <Typography component="dd">{item.agency_project_id || 'No Agency Project ID'}</Typography>
                    </Grid>
                    <Grid item sm={6}>
                      {item.start_date && item.end_date && (
                        <>
                          <Typography component="dt" variant="subtitle2" color="textSecondary">
                            Timeline
                          </Typography>
                          <Typography component="dd">
                            {getFormattedDateRangeString(
                              DATE_FORMAT.ShortMediumDateFormat,
                              item.start_date,
                              item.end_date
                            )}
                          </Typography>
                        </>
                      )}
                    </Grid>
                    <Grid item sm={12}>
                      {item.funding_amount && (
                        <>
                          <Typography component="dt" variant="subtitle2" color="textSecondary">
                            Funding Amount
                          </Typography>
                          <Typography component="dd">{getFormattedAmount(item.funding_amount)}</Typography>
                        </>
                      )}
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
