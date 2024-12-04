import { mdiClockOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TIME_FORMAT } from 'constants/dateTimeFormats';
import { default as dayjs } from 'dayjs';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';

interface ITimeFieldProps {
  label: string;
  name: string;
  id: string;
  required: boolean;
}

export const TimeField = <FormikPropsType extends ITimeFieldProps>(props: ITimeFieldProps) => {
  const { values, errors, touched, setFieldValue } = useFormikContext<FormikPropsType>();
  const { label, name, id, required } = props;

  const rawTimeValue = get(values, name);
  const formattedTimeValue =
    (rawTimeValue &&
      dayjs(rawTimeValue, TIME_FORMAT.LongTimeFormat24Hour).isValid() &&
      dayjs(rawTimeValue, TIME_FORMAT.LongTimeFormat24Hour)) ||
    null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        sx={{
          '& .MuiOutlinedInput-root': {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0
          }
        }}
        slots={{
          openPickerIcon: () => <Icon path={mdiClockOutline} size={1} />
        }}
        slotProps={{
          textField: {
            id: id,
            name: name,
            required: required,
            variant: 'outlined',
            error: get(touched, name) && Boolean(get(errors, name)),
            helperText: get(touched, name) && get(errors, name),
            inputProps: {
              'data-testid': id,
              'aria-label': 'Time (optional)'
            },
            InputLabelProps: {
              shrink: true
            },
            fullWidth: true
          }
        }}
        label={label}
        format={TIME_FORMAT.LongTimeFormat24Hour}
        value={formattedTimeValue}
        onChange={(value: dayjs.Dayjs | null) => {
          if (!value || !dayjs(value).isValid()) {
            // Check if the value is null or invalid, and if so, clear the field.
            setFieldValue(name, null);
            return;
          }

          setFieldValue(name, dayjs(value).format(TIME_FORMAT.LongTimeFormat24Hour));
        }}
        views={['hours', 'minutes', 'seconds']}
        timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
        ampm={false}
      />
    </LocalizationProvider>
  );
};
