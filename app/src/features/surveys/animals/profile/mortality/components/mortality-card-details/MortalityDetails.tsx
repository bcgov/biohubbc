import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IMortalityWithSupplementaryData } from 'features/surveys/animals/profile/mortality/AnimalMortalityContainer';
import { getFormattedDate } from 'utils/Utils';

interface IMortalityDetailsProps {
  mortality: IMortalityWithSupplementaryData;
}

/**
 * Component for displaying animal mortality 'mortality' details.
 *
 * @param {IMortalityDetailsProps} props
 * @return {*}
 */
export const MortalityDetails = (props: IMortalityDetailsProps) => {
  const { mortality } = props;

  const mortalityTimestamp = mortality.mortality_timestamp;
  const mortalityComment = mortality.mortality_comment;

  if (!mortalityTimestamp && !mortalityComment) {
    return null;
  }

  return (
    <>
      {mortalityTimestamp && (
        <Box>
          <Typography
            color="textSecondary"
            fontWeight={700}
            fontSize="0.75rem"
            sx={{ textTransform: 'uppercase', mb: 0.5 }}>
            Mortality time
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {getFormattedDate(DATE_FORMAT.MediumDateTimeFormat, mortalityTimestamp)}
          </Typography>
        </Box>
      )}

      {mortalityComment && (
        <Box>
          <Typography
            color="textSecondary"
            fontWeight={700}
            fontSize="0.75rem"
            sx={{ textTransform: 'uppercase', mb: 0.5 }}>
            Mortality comment
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {mortalityComment}
          </Typography>
        </Box>
      )}
    </>
  );
};
