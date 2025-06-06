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
import { SyntheticEvent } from 'react';
import yup from 'utils/YupSchema';

export const DeploymentStartFormInitialValues: yup.InferType<typeof DeploymentStartFormYupSchema> = {
  attachment_start_date: null as unknown as string,
  attachment_start_time: null,
  critterbase_start_capture_id: null as unknown as string
};

export const DeploymentStartFormYupSchema = yup.object({
  attachment_start_date: yup.string().nullable().required('Start date is required'),
  attachment_start_time: yup.string().nullable().default(null),

  critterbase_start_capture_id: yup.string().nullable().required('You must select the initial capture event')
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
        <HelpButtonStack helpText="Capture events must be created on your animal profile prior to populating in this list.">
          <AutocompleteField
            name="critterbase_start_capture_id"
            id="critterbase_start_capture_id"
            label={'Initial capture event'}
            options={captures.map((capture) => ({
              value: capture.capture_id,
              label: capture.capture_time
                ? dayjs(`${capture.capture_date} ${capture.capture_time}`).format(DATE_FORMAT.LongDateTimeFormat)
                : dayjs(`${capture.capture_date}`).format(DATE_FORMAT.MediumDateFormat)
            }))}
            onChange={(_: SyntheticEvent<Element, Event>, value: IAutocompleteFieldOption<string> | null) => {
              // Get date of the capture to set attachment_start_date
              if (value) {
                const timestamp = dayjs(value.label);
                const date = timestamp.format(DATE_FORMAT.ShortDateFormat);
                const time = timestamp.format('HH:mm:ss');

                setFieldValue('attachment_start_date', date);
                setFieldValue('critterbase_start_capture_id', value.value);
                // Set capture time if it exists on the selected capture
                if (time) {
                  setFieldValue('attachment_start_time', time);
                }
              }
            }}
            required
          />
        </HelpButtonStack>
      </Grid>
      <Grid item xs={12}>
        <HelpButtonStack helpText="Optional: ammend the date and time to truncate the data range.">
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
