import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetFundingSourcesResponse } from 'interfaces/useFundingSourceApi.interface';
import { getFormattedDateRangeString } from 'utils/Utils';

export interface IFundingSourceDetailsProps {
  fundingSource: IGetFundingSourcesResponse;
}

const FundingSourceDetails = (props: IFundingSourceDetailsProps) => {
  const EffectiveDate = () => {
    if (!props.fundingSource.end_date && !props.fundingSource.start_date) {
      return <>{'Not specified'}</>;
    }

    if (props.fundingSource.end_date && props.fundingSource.start_date) {
      return (
        <>
          {getFormattedDateRangeString(
            DATE_FORMAT.ShortMediumDateFormat,
            props.fundingSource.start_date,
            props.fundingSource.end_date
          )}
        </>
      );
    }

    if (props.fundingSource.start_date) {
      return (
        <>
          <span>Start Date:</span>
          {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, props.fundingSource.start_date)}
        </>
      );
    }

    return null;
  };

  console.log(props.fundingSource);

  return (
    <Box component="section">
      <Box component="dl" mb={4}>
        <Typography component="dd" data-testid="funding_source_description">
          {props.fundingSource.description}
        </Typography>
      </Box>
      <Box>
        <Grid container spacing={1}>
          <Grid item sm={12}>
            <Typography component="dt" color="textSecondary" variant="subtitle2">
              Total Amount
            </Typography>
            <Typography component="dd" data-testid="funding_source_total_amount">
              {props.fundingSource.survey_reference_amount_total}
            </Typography>
          </Grid>
          <Grid item sm={6}>
            <Typography component="dt" color="textSecondary" variant="subtitle2">
              Timeline
            </Typography>
            <Typography component="dd" data-testid="funding_source_timeline">
              <EffectiveDate />
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default FundingSourceDetails;
