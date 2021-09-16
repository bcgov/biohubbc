import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { Fragment } from 'react';
import { getFormattedAmount, getFormattedDateRangeString } from 'utils/Utils';

export interface IPublicProjectFundingProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Funding source content for a public (published) project.
 *
 * @return {*}
 */
const PublicFundingSource: React.FC<IPublicProjectFundingProps> = (props) => {
  const {
    projectForViewData: { funding }
  } = props;

  const hasFundingSources = funding.fundingSources && funding.fundingSources.length > 0;

  return (
    <>
      <Box component="header" mb={2}>
        <Typography variant="h3">Funding Sources</Typography>
      </Box>

      {hasFundingSources &&
        funding.fundingSources.map((item: any, index: number) => (
          <Fragment key={item.id}>
            <Box mt={3}>
              <Divider />
              <Box my={2} height="2.25rem">
                <Typography variant="h4">{item.agency_name}</Typography>
              </Box>
              <dl>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography component="dt" variant="subtitle2" color="textSecondary">
                      Agency Project ID
                    </Typography>
                    <Typography component="dd" variant="body1">
                      {item.agency_project_id || 'No Agency Project ID'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography component="dt" variant="subtitle2" color="textSecondary">
                      Funding Amount
                    </Typography>
                    <Typography component="dd" variant="body1">
                      {getFormattedAmount(item.funding_amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography component="dt" variant="subtitle2" color="textSecondary">
                      Funding Dates
                    </Typography>
                    <Typography component="dd" variant="body1">
                      {getFormattedDateRangeString(
                        DATE_FORMAT.ShortDateFormatMonthFirst,
                        item.start_date,
                        item.end_date
                      )}
                    </Typography>
                  </Grid>
                  {item.investment_action_category_name !== 'Not Applicable' && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography component="dt" variant="subtitle2" color="textSecondary">
                        Investment Category
                      </Typography>
                      <Typography component="dd" variant="body1">
                        {item.investment_action_category_name}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </dl>
            </Box>
          </Fragment>
        ))}

      {!hasFundingSources && (
        <Box mt={2}>
          <Typography component="dd" variant="body1">
            No Funding Sources
          </Typography>
        </Box>
      )}
    </>
  );
};

export default PublicFundingSource;
