import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';
import { getFormattedDate } from 'utils/Utils';

interface ICaptureCardDetails {
  capture: ICaptureResponse;
}

/**
 * Details displayed with the accordion component displaying an animal capture
 * @param props
 * @returns
 */
const CaptureCardDetails = (props: ICaptureCardDetails) => {
  const { capture } = props;
  return (
    <Stack gap={3} sx={{ '& .MuiTypography-body2': { fontSize: '0.9rem' } }}>
      <Grid container spacing={3}>
        {capture.capture_comment && (
          <Grid item xs={12}>
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
          </Grid>
        )}
        <Grid item>
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
        </Grid>
        <Grid item>
          <Typography
            color="textSecondary"
            fontWeight={700}
            fontSize="0.75rem"
            sx={{ textTransform: 'uppercase', mb: 0.5 }}>
            Release location
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {capture.capture_location.longitude},&nbsp;
            {capture.capture_location.latitude}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography
            color="textSecondary"
            variant="body2"
            fontWeight={700}
            fontSize="0.75rem"
            flex="1 1 auto"
            sx={{ textTransform: 'uppercase', mb: 0.5 }}>
            Release comment
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {capture.release_comment}
          </Typography>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default CaptureCardDetails;