import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetFundingSourceResponse } from 'interfaces/useFundingSourceApi.interface';
import { useCallback } from 'react';
import { getFormattedDateRangeString } from 'utils/Utils';

export interface IFundingSourceDetailsProps {
  fundingSource: IGetFundingSourceResponse['funding_source'];
}

const FundingSourceDetails = (props: IFundingSourceDetailsProps) => {
  const EffectiveDate = useCallback(() => {
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
          <span>Start Date: </span>
          {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, props.fundingSource.start_date)}
        </>
      );
    }

    return null;
  }, [props.fundingSource.end_date, props.fundingSource.start_date]);

  return (
    <Box component="section">
      <Typography variant="body1" color="textSecondary" data-testid="funding_source_description">
        {props.fundingSource.description}
      </Typography>
      <Box
        mt={3}
        mb={0}
        component="dl"
        sx={{
          '& dt': {
            flex: '0 0 15rem'
          },
          '& dd': {
            flex: '1 1 auto'
          }
        }}>
        <Box display="flex">
          <Typography component="dt" color="textSecondary">
            Effective Dates
          </Typography>
          <Typography component="dd" data-testid="funding_source_timeline">
            <EffectiveDate />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default FundingSourceDetails;
