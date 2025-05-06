import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { ICaptureWithSupplementaryData } from 'features/surveys/animals/profile/captures/AnimalCaptureContainer';
import { combineDateTime, shouldShowTime } from 'utils/datetime';
import { getFormattedDate } from 'utils/Utils';

interface IReleaseDetailsProps {
  capture: ICaptureWithSupplementaryData;
}

/**
 * Component for displaying animal capture 'release' details.
 *
 * @param {IReleaseDetailsProps} props
 * @return {*}
 */
export const ReleaseDetails = (props: IReleaseDetailsProps) => {
  const { capture } = props;

  const releaseDate = capture.release_date;
  const releaseTime = capture.release_time;
  const releaseLocation = capture.release_location;
  const releaseComment = capture.release_comment;

  return (
    <Stack gap={2}>
      <Stack direction="row" spacing={3}>
        {releaseDate && (
          <Box>
            <Typography
              color="textSecondary"
              fontWeight={700}
              fontSize="0.75rem"
              sx={{ textTransform: 'uppercase', mb: 0.5 }}>
              Release date
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {(() => {
                const dateTime = combineDateTime(releaseDate, releaseTime);
                const dateStr = getFormattedDate(DATE_FORMAT.MediumDateFormat, dateTime);
                const timeStr = dayjs(dateTime).format('HH:mm:ss');
                return shouldShowTime(timeStr)
                  ? `${dateStr} ${getFormattedDate(DATE_FORMAT.TimeFormat, dateTime)}`
                  : dateStr;
              })()}
            </Typography>
          </Box>
        )}

        {releaseLocation && (
          <Box>
            <Typography
              color="textSecondary"
              fontWeight={700}
              fontSize="0.75rem"
              sx={{ textTransform: 'uppercase', mb: 0.5 }}>
              Release location
            </Typography>
            {releaseLocation && (
              <Typography color="textSecondary" variant="body2">
                {releaseLocation.latitude},&nbsp;{releaseLocation.longitude}
              </Typography>
            )}
          </Box>
        )}
      </Stack>

      {releaseComment && (
        <Box>
          <Typography
            color="textSecondary"
            fontWeight={700}
            fontSize="0.75rem"
            sx={{ textTransform: 'uppercase', mb: 0.5 }}>
            Release comment
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {releaseComment || 'None'}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};
