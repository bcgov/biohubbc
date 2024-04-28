import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';
import { getFormattedDate } from 'utils/Utils';

interface ICaptureCardDetails {
  capture: ICaptureResponse;
}

const CaptureCardDetails = (props: ICaptureCardDetails) => {
  const { capture } = props;
  return (
    <>
      <Stack gap={3}>
        <Grid container spacing={3} xs={8}>
          {capture.capture_comment && (
            <Grid item xs={12}>
              <Typography
                variant="body2"
                color="textSecondary"
                fontWeight={700}
                fontSize="0.75rem"
                sx={{ textTransform: 'uppercase', mb: 0.5 }}>
                Capture comment
              </Typography>
              <Typography color="textSecondary">{capture.capture_comment}</Typography>
            </Grid>
          )}
          <Grid item>
            <Typography
              variant="body2"
              color="textSecondary"
              fontWeight={700}
              fontSize="0.75rem"
              sx={{ textTransform: 'uppercase', mb: 0.5 }}>
              Release time
            </Typography>
            <Typography color="textSecondary">
              {getFormattedDate(DATE_FORMAT.MediumDateTimeFormat, capture.release_timestamp ?? '')}
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              variant="body2"
              color="textSecondary"
              fontWeight={700}
              fontSize="0.75rem"
              sx={{ textTransform: 'uppercase', mb: 0.5 }}>
              Release location
            </Typography>
            <Typography color="textSecondary">
              <Typography color="textSecondary">
                {capture.capture_location.longitude},&nbsp;
                {capture.capture_location.latitude}
              </Typography>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="body2"
              color="textSecondary"
              fontWeight={700}
              fontSize="0.75rem"
              flex="1 1 auto"
              sx={{ textTransform: 'uppercase', mb: 0.5 }}>
              Release comment
            </Typography>
            <Typography color="textSecondary">{capture.release_comment}</Typography>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};

export default CaptureCardDetails;
