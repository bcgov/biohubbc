import { TextFieldProps } from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import moment from 'moment';
import React from 'react';

interface IDateProps {
  name: string;
  label: string;
  required?: boolean;
  helperText?: string;
  other?: TextFieldProps;
}

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

  const formattedDateValue = (rawDateValue && moment(rawDateValue).isValid() && moment(rawDateValue)) || null;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        slotProps={{
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
        minDate={moment(DATE_LIMIT.min)}
        maxDate={moment(DATE_LIMIT.max)}
        value={formattedDateValue}
        onChange={(value) => {
          setFieldValue(name, moment(value).format(DATE_FORMAT.ShortDateFormat));
        }}
      />
    </LocalizationProvider>
  );
};

export default SingleDateField;
