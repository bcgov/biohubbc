import { mdiCalendar } from '@mdi/js';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import CustomTextField from 'components/fields/CustomTextField';
import { DateTimeFields } from 'components/fields/DateTimeFields';
import { useFormikContext } from 'formik';
import { ICreateCaptureRequest } from 'interfaces/useCritterApi.interface';

const CaptureGeneralInformationForm = () => {
  const formikProps = useFormikContext<ICreateCaptureRequest>();

  return (
    <>
      <Box component="fieldset">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography component="legend" variant="h5" mb={1}>
              Capture information
            </Typography>
            <Box mt={3}>
              <DateTimeFields
                formikProps={formikProps}
                parentName="capture"
                date={{
                  dateLabel: 'Capture date',
                  dateName: 'capture.capture_timestamp',
                  dateId: 'capture.capture_timestamp',
                  dateRequired: true,
                  dateHelperText: '',
                  dateIcon: mdiCalendar
                }}
                time={{
                  timeLabel: 'Capture time',
                  timeName: 'capture.capture_time',
                  timeId: 'capture.capture_time',
                  timeRequired: false,
                  timeHelperText: '',
                  timeIcon: mdiCalendar
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="capture.capture_comment"
              label="Description or comments about the capture"
              maxLength={1000}
              other={{ multiline: true, rows: 4 }}
            />
          </Grid>
          <Grid item xs={12} mt={2}>
            <Typography component="legend" variant="h5" mb={1}>
              Release information (optional)
            </Typography>
            <Box mt={3}>
              <DateTimeFields
                formikProps={formikProps}
                parentName="capture"
                date={{
                  dateLabel: 'Release date',
                  dateName: 'capture.release_timestamp',
                  dateId: 'capture.release_timestamp',
                  dateRequired: false,
                  dateHelperText: '',
                  dateIcon: mdiCalendar
                }}
                time={{
                  timeLabel: 'Release time',
                  timeName: 'capture.release_time',
                  timeId: 'capture.release_time',
                  timeRequired: false,
                  timeHelperText: '',
                  timeIcon: mdiCalendar
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="capture.release_comment"
              label="Description or comments about the release"
              maxLength={1000}
              other={{ multiline: true, rows: 4 }}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default CaptureGeneralInformationForm;
