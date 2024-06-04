import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IMortalityWithSupplementaryData } from 'features/surveys/animals/profile/mortality/AnimalMortalityContainer';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
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

  const critterbaseApi = useCritterbaseApi();

  const mortalityCodesDataLoader = useDataLoader(() => critterbaseApi.mortality.getCauseOfDeathOptions());

  useEffect(() => {
    mortalityCodesDataLoader.load();
  }, []);

  const mortalityTimestamp = mortality.mortality_timestamp;
  const mortalityComment = mortality.mortality_comment;

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
              Mortality time
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {getFormattedDate(DATE_FORMAT.MediumDateTimeFormat, mortalityTimestamp)}
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
