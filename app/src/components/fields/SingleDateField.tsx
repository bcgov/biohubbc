import { mdiCalendar } from '@mdi/js';
import Icon from '@mdi/react';
import { TextFieldProps } from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import { default as dayjs } from 'dayjs';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React from 'react';

interface IDateProps {
  name: string;
  label: string;
  required?: boolean;
  helperText?: string;
  other?: TextFieldProps;
}

const CalendarIcon = () => {
  return <Icon path={mdiCalendar} size={1} />;
};

/**
 * Single date field
 *
 * Note: using formik context. So must be wrapped with formik provider.
 *
 * @param {IDateProps}
 * @return {*}
 *
 **/
const SingleDateField: React.FC<IDateProps> = (props) => {
  const { setFieldValue, values, handleBlur, touched, errors } = useFormikContext();
  const { name, other, helperText, required, label } = props;

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
          openPickerIcon: CalendarIcon
        }}
        slotProps={{
          openPickerButton: { id: props.name },
          inputAdornment: {
            id: props.name,
            onBlur: handleBlur
          },
          textField: {
            id: 'date_field',
            name,
            required: Boolean(required),
            variant: 'outlined',
            error: get(touched, name) && Boolean(get(errors, name)),
            helperText: (get(touched, name) && get(errors, name)) || helperText,
            onBlur: handleBlur,
            inputProps: {
              'data-testid': 'date_field'
            },
            InputLabelProps: {
              shrink: true
            },
            fullWidth: true,
            ...other
          }
        }}
        label={label}
        format={DATE_FORMAT.ShortDateFormat}
        minDate={dayjs(DATE_LIMIT.min)}
        maxDate={dayjs(DATE_LIMIT.max)}
        value={formattedDateValue}
        onChange={(value) => {
          other?.onChange?.(value);

          const date = dayjs(value);

          if (date.isValid()) {
            // If value is null or valid, set the field value accordingly
            setFieldValue(name, date.format(DATE_FORMAT.ShortDateFormat));
          } else {
            // If value is invalid, set the field value to null
            setFieldValue(name, '');
          }
        }}
      />
    </LocalizationProvider>
  );
};

export default SingleDateField;
