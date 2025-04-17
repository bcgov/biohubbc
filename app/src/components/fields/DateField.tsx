import { mdiCalendar } from '@mdi/js';
import { Icon } from '@mdi/react';
import { DatePicker, DatePickerProps, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import dayjs, { Dayjs } from 'dayjs';

interface IDateFieldProps extends Omit<DatePickerProps<Dayjs>, 'onChange' | 'value'> {
  label: string;
  required?: boolean;
  value: Dayjs | null;
  error?: boolean;
  helperText?: string;
  onChange: (value: Dayjs | null) => void;
}

export const DateField = (props: IDateFieldProps) => {
  const { label, required, value, error, helperText, onChange, ...rest } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        {...rest}
        label={label}
        value={value}
        onChange={(newValue) => {
          if (!newValue || !dayjs(newValue).isValid()) {
            onChange(null);
            return;
          }

          onChange(dayjs(newValue));
        }}
        format={DATE_FORMAT.ShortDateFormat}
        minDate={dayjs(DATE_LIMIT.min)}
        maxDate={dayjs(DATE_LIMIT.max)}
        slots={{
          openPickerIcon: () => <Icon path={mdiCalendar} size={1} />
        }}
        slotProps={{
          textField: {
            required,
            variant: 'outlined',
            fullWidth: true,
            error,
            helperText,
            inputProps: {
              'data-testid': name
            },
            InputLabelProps: {
              shrink: true
            }
          }
        }}
      />
    </LocalizationProvider>
  );
};
