import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';
import { getFormattedAmount, getFormattedDateRangeString } from 'utils/Utils';

/**
 * Funding source content for a project.
 *
 * @return {*}
 */
const SurveyFundingSources = () => {
  const surveyContext = useContext(SurveyContext);
  const surveyForViewData = surveyContext.surveyDataLoader.data;

  if (!surveyForViewData) {
    return <></>;
  }

  const { surveyData: { funding_sources } } = surveyForViewData;

  return (
    <>
      <List disablePadding>
        {funding_sources.length > 0 ? (
          <>
            {funding_sources.map((item) => (
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
          </>
        ) : (
          <ListItem disableGutters>
            <Typography>No Funding Sources</Typography>
          </ListItem>
        )}
      </List>
    </>
  );
};

export default SurveyFundingSources;
