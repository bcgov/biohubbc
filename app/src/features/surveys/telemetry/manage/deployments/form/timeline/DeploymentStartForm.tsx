import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { DateField } from 'components/fields/DateField';
import { TimeField } from 'components/fields/TimeField';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { useFormikContext } from 'formik';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';
import { ICreateAnimalDeployment } from 'interfaces/useTelemetryApi.interface';
import { SyntheticEvent } from 'react';
import yup from 'utils/YupSchema';
import { shouldShowTime, formatCaptureLabel } from 'utils/datetime';

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
        <AutocompleteField
          name="critterbase_start_capture_id"
          id="critterbase_start_capture_id"
          label={'Initial capture event'}
          options={captures.map((capture) => {
            const showTime = shouldShowTime(capture.capture_time ?? undefined);
            const formattedLabel = formatCaptureLabel(capture.capture_date, capture.capture_time ?? undefined);
            // TODO: TECH DEBT: We currently assume that a time value of 00:00 (midnight) means the time is null/missing, and do not display it in dropdowns. However, a user could intentionally set 00:00 as a valid time. This logic should be revisited in the future to properly distinguish between a true null and a valid midnight time.
            return {
              value: capture.capture_id,
              label: formattedLabel,
              _rawTime: showTime && capture.capture_time ? capture.capture_time : null
            };
          })}
          onChange={(_: SyntheticEvent<Element, Event>, value: IAutocompleteFieldOption<string> | null) => {
            // Get date of the capture to set attachment_start_date
            if (value) {
              const timestamp = dayjs(value.label);
              const date = timestamp.format(DATE_FORMAT.ShortDateFormat);
              setFieldValue('attachment_start_date', date);
              setFieldValue('critterbase_start_capture_id', value.value);
              // Only set time if _rawTime is present (not midnight)
              if ((value as any)._rawTime) {
                const time = dayjs((value as any)._rawTime, ['HH:mm', 'HH:mm:ss', 'h:mm A']).format('HH:mm:ss');
                setFieldValue('attachment_start_time', time);
              } else {
                setFieldValue('attachment_start_time', null);
              }
            }
          }}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ width: '100%' }} display="flex">
          <DateField
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
      </Grid>
    </Grid>
  );
};
