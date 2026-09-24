import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import HelpButtonStack from 'components/buttons/HelpButtonStack';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import SingleDateField from 'components/fields/SingleDateField';
import { TimeField } from 'components/fields/TimeField';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { useFormikContext } from 'formik';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';
import { ICreateAnimalDeployment } from 'interfaces/useTelemetryApi.interface';
import { formatDateTime, hasRealTime } from 'utils/datetime';
import yup from 'utils/YupSchema';

export const DeploymentStartFormInitialValues: yup.InferType<typeof DeploymentStartFormYupSchema> = {
  attachment_start_date: null as unknown as string,
  attachment_start_time: null,
  critterbase_start_capture_id: ''
};

export const DeploymentStartFormYupSchema = yup.object({
  attachment_start_date: yup.string().nullable().required('Start date is required'),
  attachment_start_time: yup.string().nullable().default(null),

  critterbase_start_capture_id: yup.string().required('You must select the initial capture event')
});

interface IDeploymentStartFormProps {
  captures: ICaptureResponse[];
}

/**
 * Deployment form - start of deployment form.
 *
 * @param {IDeploymentStartFormProps} props
 * @return {*}
 */
export const DeploymentStartForm = (props: IDeploymentStartFormProps) => {
  const { captures } = props;

  const formikProps = useFormikContext<ICreateAnimalDeployment>();

  const { values, setFieldValue } = formikProps;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <HelpButtonStack helpText="The capture event when a device was deployed must be created before adding the deployment.">
          <AutocompleteField
            name="critterbase_start_capture_id"
            id="critterbase_start_capture_id"
            label={'Initial capture event'}
            options={captures.map((capture) => {
              const formattedLabel = formatDateTime(capture.capture_date, capture.capture_time);
              return {
                value: capture.capture_id,
                label: formattedLabel
              };
            })}
            onChange={(_, value: IAutocompleteFieldOption<string> | null) => {
              if (value) {
                // Timestamp is the label
                const timestamp = value.label;

                setFieldValue('critterbase_start_capture_id', value.value);
                setFieldValue('attachment_start_date', dayjs(timestamp).format(DATE_FORMAT.ShortDateFormat));

                const isRealTime = hasRealTime(value.value);
                setFieldValue('attachment_start_time', isRealTime ? dayjs(timestamp).format('HH:mm:ss') : null);
                return;
              }

              // Reset both fields if no value is selected
              setFieldValue('critterbase_start_capture_id', null);
              setFieldValue('attachment_start_date', null);
              setFieldValue('attachment_start_time', null);
            }}
            required
          />
        </HelpButtonStack>
      </Grid>
      <Grid item xs={12}>
        <HelpButtonStack helpText="The start date can be used to truncate the data to a custom date range (e.g., filter out the first day).">
          <Box sx={{ width: '100%' }} display="flex">
            <SingleDateField
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0
                }
              }}
              id="attachment_start_date"
              name="attachment_start_date"
              label="Start date"
              required={values.attachment_start_time !== null}
            />
            <TimeField id="attachment_start_time" name="attachment_start_time" label="Start time" required={false} />
          </Box>
        </HelpButtonStack>
      </Grid>
    </Grid>
  );
};
