import { mdiCalendar } from '@mdi/js';
import { Icon } from '@mdi/react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { useFormikContext } from 'formik';
import { get } from 'lodash-es';

interface IDateFieldProps {
  label: string;
  name: string;
  id: string;
  required: boolean;
}

export const DateField = <FormikPropsType extends IDateFieldProps>(props: IDateFieldProps) => {
  const { values, errors, touched, setFieldValue } = useFormikContext<FormikPropsType>();
  const { label, name, id, required } = props;

  const rawDateValue = get(values, name);
  const formattedDateValue =
    (rawDateValue &&
      dayjs(rawDateValue, DATE_FORMAT.ShortDateFormat).isValid() &&
      dayjs(rawDateValue, DATE_FORMAT.ShortDateFormat)) ||
    null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        slots={{
          openPickerIcon: () => <Icon path={mdiCalendar} size={1} />
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
              'data-testid': name
            },
            InputLabelProps: {
              shrink: true
            },
            fullWidth: true
          }
        }}
        label={label}
        format={DATE_FORMAT.ShortDateFormat}
        minDate={dayjs(DATE_LIMIT.min)}
        maxDate={dayjs(DATE_LIMIT.max)}
        value={formattedDateValue}
        onChange={(value) => {
          if (!value || value === 'Invalid Date') {
            // The creation input value will be 'Invalid Date' when the date field is cleared (empty), and will
            // contain an actual date string value if the field is not empty but is invalid.
            setFieldValue(name, null);
            return;
          }

          setFieldValue(name, dayjs(value).format(DATE_FORMAT.ShortDateFormat));
        }}
      />
    </LocalizationProvider>
  );
};
