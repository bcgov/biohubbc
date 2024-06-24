import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ICaptureWithSupplementaryData } from 'features/surveys/animals/profile/captures/AnimalCaptureContainer';
import { combineDateTime } from 'utils/datetime';
import { getFormattedDate } from 'utils/Utils';

interface ICaptureDetailsProps {
  capture: ICaptureWithSupplementaryData;
}

/**
 * Component for displaying animal capture 'capture' details.
 *
 * @param {ICaptureDetailsProps} props
 * @return {*}
 */
export const CaptureDetails = (props: ICaptureDetailsProps) => {
  const { capture } = props;

  const captureDate = capture.capture_date;
  const captureTime = capture.capture_time;
  const captureLocation = capture.capture_location;
  const captureComment = capture.capture_comment;

  if (!captureDate && (!captureLocation.latitude || !captureLocation.longitude) && !captureComment) {
    return null;
  }

  return (
    <Stack gap={2}>
      <Stack direction="row" spacing={3}>
        <Box>
          <Typography
            color="textSecondary"
            fontWeight={700}
            fontSize="0.75rem"
            sx={{ textTransform: 'uppercase', mb: 0.5 }}>
            Capture date
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {getFormattedDate(DATE_FORMAT.MediumDateTimeFormat, combineDateTime(captureDate, captureTime))}
          </Typography>
        </Box>

        <Box>
          <Typography
            color="textSecondary"
            fontWeight={700}
            fontSize="0.75rem"
            sx={{ textTransform: 'uppercase', mb: 0.5 }}>
            Capture location
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {captureLocation.latitude},&nbsp;{captureLocation.longitude}
          </Typography>
        </Box>
      </Stack>

      {captureComment && (
        <Box>
          <Typography
            color="textSecondary"
            fontWeight={700}
            fontSize="0.75rem"
            sx={{ textTransform: 'uppercase', mb: 0.5 }}>
            Capture comment
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {captureComment || 'None'}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};
