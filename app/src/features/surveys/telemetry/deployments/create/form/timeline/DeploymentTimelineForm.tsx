import { mdiCalendar } from '@mdi/js';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutocompleteField from 'components/fields/AutocompleteField';
import { DateTimeFields } from 'components/fields/DateTimeFields';
import { ICreateAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { useFormikContext } from 'formik';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';
import yup from 'utils/YupSchema';

export const DeviceDetailsInitialValues = {
  survey_details: {
    survey_name: '',
    start_date: '',
    end_date: '',
    progress_id: null,
    survey_types: [],
    revision_count: 0
  },
  species: {
    focal_species: [],
    ancillary_species: []
  },
  permit: {
    permits: []
  }
};

export const DeviceDetailsYupSchema = () => yup.object();

interface IDeploymentTimelineFormProps {
  captures: ICaptureResponse[];
}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const DeploymentTimelineForm = (props: IDeploymentTimelineFormProps) => {
  const formikProps = useFormikContext<ICreateAnimalDeployment>();
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography component="legend" variant="h5">
            Start of deployment
          </Typography>
          <Typography color="textSecondary" mb={3}>
            You must add the capture during which the device was deployed before adding the deployment.
          </Typography>
          <AutocompleteField
            name="start_capture_id"
            id="start_capture_id"
            label={'Initial capture event'}
            options={props.captures.map((capture) => ({
              value: capture.capture_id,
              label: capture.capture_date
            }))}
            required
          />
        </Grid>

        <Grid item xs={12} mt={3} flex="1 1 auto">
          <Typography component="legend" variant="h5">
            End of deployment (optional)
          </Typography>
          <Typography color="textSecondary" mb={3}>
            Select the capture when the device was removed, or enter an end date.
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={3} alignItems="center" width="100%">
            <AutocompleteField
              name="end_capture_id"
              id="end_capture_id"
              label={'End capture event'}
              options={props.captures.map((capture) => ({
                value: capture.capture_id,
                label: capture.capture_date
              }))}
              sx={{ width: '100%' }}
            />
            <Typography color="textSecondary" sx={{ width: 'auto' }}>
              &mdash;&nbsp;OR&nbsp;&mdash;
            </Typography>
            <Box sx={{ width: '100%' }}>
              <DateTimeFields
                formikProps={formikProps}
                date={{
                  dateLabel: 'Date',
                  dateName: 'attachment_end',
                  dateId: 'attachment_end',
                  dateRequired: false,
                  dateIcon: mdiCalendar
                }}
                time={{
                  timeLabel: 'Time',
                  timeName: 'attachment_end',
                  timeId: 'attachment_end',
                  timeRequired: false,
                  timeIcon: mdiCalendar
                }}
              />
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default DeploymentTimelineForm;
