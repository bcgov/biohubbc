import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { IMortalityWithSupplementaryData } from 'features/surveys/animals/profile/mortality/AnimalMortalityContainer';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useRef } from 'react';
import { hasRealTime } from 'utils/datetime';

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

  const critterbaseApi = useCritterbaseApi();

  const mortalityCodesDataLoader = useDataLoader(() => critterbaseApi.mortality.getCauseOfDeathOptions());

  const loadRef = useRef(mortalityCodesDataLoader.load);
  loadRef.current = mortalityCodesDataLoader.load;
  useEffect(() => {
    loadRef.current();
  }, []);

  const mortalityTimestamp = mortality.mortality_timestamp;
  const mortalityComment = mortality.mortality_comment;
  const isRealTime = hasRealTime(mortality.mortality_timestamp);

  if (!mortalityTimestamp && !mortalityComment) {
    return null;
  }

  return (
    <Stack gap={2}>
      <Stack direction="row" spacing={3}>
        {mortalityTimestamp && (
          <Box>
            <Typography
              color="textSecondary"
              fontWeight={700}
              fontSize="0.75rem"
              sx={{ textTransform: 'uppercase', mb: 0.5 }}>
              Mortality date
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {isRealTime
                ? dayjs(mortality.mortality_timestamp).format(DATE_FORMAT.MediumDateTimeFormat)
                : dayjs(mortality.mortality_timestamp).format(DATE_FORMAT.MediumDateFormat)}
            </Typography>
          </Box>
        )}

        {mortalityTimestamp && (
          <Box>
            <Typography
              color="textSecondary"
              fontWeight={700}
              fontSize="0.75rem"
              sx={{ textTransform: 'uppercase', mb: 0.5 }}>
              Suspected cause of death
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {
                mortalityCodesDataLoader.data?.find((option) => option.id === mortality.proximate_cause_of_death_id)
                  ?.value
              }
            </Typography>
          </Box>
        )}
      </Stack>

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
    </Stack>
  );
};
