import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { getFormattedDate } from 'utils/Utils';
import { ICapturesWithSupplementaryData } from '../AnimalCaptureContainer';
import MarkingCard from '../create/form/markings/MarkingCard';

interface ICaptureCardDetails {
  capture: ICapturesWithSupplementaryData;
}

/**
 * Details displayed with the accordion component displaying an animal capture
 * @param props
 * @returns
 */
const CaptureCardDetails = (props: ICaptureCardDetails) => {
  const { capture } = props;

  const measurements = [...capture.measurements.quantitative, ...capture.measurements.qualitative];

  return (
    <Stack gap={3} sx={{ '& .MuiTypography-body2': { fontSize: '0.9rem' } }}>
      <Stack direction="row" spacing={3}>
        <Box>
          <Typography
            color="textSecondary"
            fontWeight={700}
            fontSize="0.75rem"
            sx={{ textTransform: 'uppercase', mb: 0.5 }}>
            Release time
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {getFormattedDate(DATE_FORMAT.MediumDateTimeFormat, capture.release_timestamp ?? capture.capture_timestamp)}
          </Typography>
        </Box>

        <Box>
          <Typography
            color="textSecondary"
            fontWeight={700}
            fontSize="0.75rem"
            sx={{ textTransform: 'uppercase', mb: 0.5 }}>
            Release location
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {capture.capture_location.longitude},&nbsp;{capture.capture_location.latitude}
          </Typography>
        </Box>
      </Stack>

      {capture.capture_comment && (
        <Box maxWidth="50%">
          <Typography
            color="textSecondary"
            fontWeight={700}
            fontSize="0.75rem"
            sx={{ textTransform: 'uppercase', mb: 0.5 }}>
            Capture comment
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {capture.capture_comment}
          </Typography>
        </Box>
      )}

      {capture.release_comment && (
        <Box maxWidth="50%">
          <Typography
            color="textSecondary"
            fontWeight={700}
            fontSize="0.75rem"
            sx={{ textTransform: 'uppercase', mb: 0.5 }}>
            Release comment
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {capture.release_comment}
          </Typography>
        </Box>
      )}

      {capture.markings.length > 0 && (
        <Box>
          <Typography color="textSecondary" fontWeight={700} fontSize="0.75rem" sx={{ textTransform: 'uppercase' }}>
            Markings
          </Typography>
          <Box maxHeight="600px" sx={{ overflowY: 'auto', pr: 1, pb: 1 }}>
            {capture.markings.map((marking) => (
              <Box mt={1}>
                <MarkingCard
                  editable={false}
                  key={marking.marking_id}
                  identifier={marking.identifier}
                  marking_type_label={marking.marking_type}
                  primary_colour_label={marking.primary_colour ?? ''}
                  secondary_colour_label={marking.secondary_colour ?? ''}
                  marking_body_location_label={marking.body_location}
                  comment={marking.comment}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {capture.measurements.qualitative.length ||
        (capture.measurements.quantitative.length > 0 && (
          <Box>
            <Typography color="textSecondary" fontWeight={700} fontSize="0.75rem" sx={{ textTransform: 'uppercase' }}>
              Measurements
            </Typography>
            <Box maxHeight="300px" sx={{ overflow: 'auto', pr: 1, pb: 1 }}>
              {measurements.map((measurement) => (
                <Paper sx={{ px: 3, py: 2, bgcolor: grey[100], mt: 1 }}>
                  <Typography fontWeight={700}>
                    {measurement.measurement_name}: <Typography component="span">{measurement.value}</Typography>
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        ))}
    </Stack>
  );
};

export default CaptureCardDetails;
