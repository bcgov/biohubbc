import { mdiCalendar } from '@mdi/js';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import CustomTextField from 'components/fields/CustomTextField';
import { DateTimeFields } from 'components/fields/DateTimeFields';
import { useFormikContext } from 'formik';
import { ICreateEditCaptureRequest } from 'interfaces/useCritterApi.interface';

/**
 * Returns the controls for general information fields relating to the capture on the animal capture form
 *
 * @returns
 */
export const CaptureGeneralInformationForm = () => {
  const formikProps = useFormikContext<ICreateEditCaptureRequest>();

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
                date={{
                  dateLabel: 'Capture date',
                  dateName: 'capture.capture_date',
                  dateId: 'capture.capture_date',
                  dateRequired: true,
                  dateIcon: mdiCalendar
                }}
                time={{
                  timeLabel: 'Capture time',
                  timeName: 'capture.capture_time',
                  timeId: 'capture.capture_time',
                  timeRequired: false,
                  timeIcon: mdiCalendar
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="capture.capture_comment"
              label="Capture comments"
              maxLength={1000}
              other={{ multiline: true, rows: 4, required: true }}
            />
          </Grid>
          <Grid item xs={12} mt={2}>
            <Typography component="legend" variant="h5" mb={1}>
              Release information (optional)
            </Typography>
            <Box mt={3}>
              <DateTimeFields
                formikProps={formikProps}
                date={{
                  dateLabel: 'Release date',
                  dateName: 'capture.release_date',
                  dateId: 'capture.release_date',
                  dateRequired: false,
                  dateIcon: mdiCalendar
                }}
                time={{
                  timeLabel: 'Release time',
                  timeName: 'capture.release_time',
                  timeId: 'capture.release_time',
                  timeRequired: false,
                  timeIcon: mdiCalendar
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="capture.release_comment"
              label="Release comments"
              maxLength={1000}
              other={{ multiline: true, rows: 4 }}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
