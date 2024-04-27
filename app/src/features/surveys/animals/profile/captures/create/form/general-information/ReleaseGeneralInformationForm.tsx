import { mdiCalendar } from '@mdi/js';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import { DateTimeFields } from 'components/fields/DateTimeFields';
import { useFormikContext } from 'formik';
import { ICreateCaptureRequest } from 'interfaces/useCritterApi.interface';

const ReleaseGeneralInformationForm = () => {
  const formikProps = useFormikContext<ICreateCaptureRequest>();

  return (
    <>
      <Box component="fieldset">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography component="legend" variant="h5" mb={1}>
              Release (optional)
            </Typography>
            <Box mt={3}>
              <DateTimeFields
                formikProps={formikProps}
                parentName="capture"
                date={{
                  dateLabel: 'Date',
                  dateName: 'capture.release_timestamp',
                  dateId: 'capture.release_timestamp',
                  dateRequired: true,
                  dateHelperText: '',
                  dateIcon: mdiCalendar
                }}
                time={{
                  timeLabel: 'Time',
                  timeName: 'capture.release_timestamp',
                  timeId: 'capture.release_timestamp',
                  timeRequired: true,
                  timeHelperText: '',
                  timeIcon: mdiCalendar
                }}
              />
            </Box>
          </Grid>
          {/* <Grid item xs={12}>
            <CustomTextField
              name="description"
              label="Description"
              maxLength={1000}
              other={{ multiline: true, rows: 4 }}
            />
          </Grid> */}
        </Grid>
      </Box>
    </>
  );
};

export default ReleaseGeneralInformationForm;
