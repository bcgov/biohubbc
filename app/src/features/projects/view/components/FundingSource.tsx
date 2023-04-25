import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import assert from 'assert';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ProjectContext } from 'contexts/projectContext';
import React, { useContext } from 'react';
import { getFormattedAmount, getFormattedDateRangeString } from 'utils/Utils';

/**
 * Funding source content for a project.
 *
 * @return {*}
 */
const FundingSource = () => {
  const projectContext = useContext(ProjectContext);

  // Project data must be loaded by a parent before this component is rendered
  assert(projectContext.projectDataLoader.data);

  const projectData = projectContext.projectDataLoader.data.projectData;

  const hasFundingSources = projectData.funding.fundingSources && projectData.funding.fundingSources.length > 0;

  return (
    <>
      <List disablePadding>
        {hasFundingSources &&
          projectData.funding.fundingSources.map((item: any) => (
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
                <Box component="dl" m={0}>
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
