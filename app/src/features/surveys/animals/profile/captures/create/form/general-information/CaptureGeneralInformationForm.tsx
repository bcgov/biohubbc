import { mdiCalendar } from '@mdi/js';
import Grid from '@mui/material/Grid';
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
            <Box mt={2}>
              <DateTimeFields
                formikProps={formikProps}
                parentName="capture"
                date={{
                  dateLabel: 'Date',
                  dateName: 'capture.capture_timestamp',
                  dateId: 'capture.capture_timestamp',
                  dateRequired: true,
                  dateHelperText: '',
                  dateIcon: mdiCalendar
                }}
                time={{
                  timeLabel: 'Time',
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
              label="Description"
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
