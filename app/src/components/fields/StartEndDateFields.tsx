import { mdiCalendarEnd, mdiCalendarStart } from '@mdi/js';
import Icon from '@mdi/react';
import Grid from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import { default as dayjs } from 'dayjs';
import get from 'lodash-es/get';
import React from 'react';

interface IStartEndDateFieldsProps {
  formikProps: any;
  startName: string;
  endName: string;
  startRequired: boolean;
  endRequired: boolean;
  startDateHelperText?: string;
  endDateHelperText?: string;
}

const CalendarStartIcon = () => {
  return <Icon path={mdiCalendarStart} size={1} />;
};

const CalendarEndIcon = () => {
  return <Icon path={mdiCalendarEnd} size={1} />;
};

/**
 * Start/end date fields - commonly used throughout forms
 *
 */
const StartEndDateFields: React.FC<IStartEndDateFieldsProps> = (props) => {
  const {
    formikProps: { values, errors, touched, setFieldValue },
    startName,
    endName,
    startRequired,
    endRequired,
    startDateHelperText,
    endDateHelperText
  } = props;

  const rawStartDateValue = get(values, startName);
  const rawEndDateValue = get(values, endName);

  const formattedStartDateValue =
    (rawStartDateValue &&
      dayjs(rawStartDateValue, DATE_FORMAT.ShortDateFormat).isValid() &&
      dayjs(rawStartDateValue, DATE_FORMAT.ShortDateFormat)) ||
    null;

  const formattedEndDateValue =
    (rawEndDateValue &&
      dayjs(rawEndDateValue, DATE_FORMAT.ShortDateFormat).isValid() &&
      dayjs(rawEndDateValue, DATE_FORMAT.ShortDateFormat)) ||
    null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container item spacing={3}>
        <Grid item xs={6}>
          <DatePicker
            slots={{
              openPickerIcon: CalendarStartIcon
            }}
            slotProps={{
              textField: {
                id: 'start_date',
                name: startName,
                required: startRequired,
                variant: 'outlined',
                error: get(touched, startName) && Boolean(get(errors, startName)),
                helperText: (get(touched, startName) && get(errors, startName)) || startDateHelperText,
                inputProps: {
                  'data-testid': 'start_date'
                },
                InputLabelProps: {
                  shrink: true
                },
                fullWidth: true
              }
            }}
            label="Start Date"
            format={DATE_FORMAT.ShortDateFormat}
            minDate={dayjs(DATE_LIMIT.min)}
            maxDate={dayjs(DATE_LIMIT.max)}
            value={formattedStartDateValue}
            onChange={(value) => {
              if (!value || String(value) === 'Invalid Date') {
                // The creation input value will be 'Invalid Date' when the date field is cleared (empty), and will
                // contain an actual date string value if the field is not empty but is invalid.
                setFieldValue(startName, null);
                return;
              }

              setFieldValue(startName, dayjs(value).format(DATE_FORMAT.ShortDateFormat));
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <DatePicker
            slots={{
              openPickerIcon: CalendarEndIcon
            }}
            slotProps={{
              textField: {
                id: 'end_date',
                name: endName,
                required: endRequired,
                variant: 'outlined',
                error: get(touched, endName) && Boolean(get(errors, endName)),
                helperText: (get(touched, endName) && get(errors, endName)) || endDateHelperText,
                inputProps: {
                  'data-testid': 'end_date'
                },
                InputLabelProps: {
                  shrink: true
                },
                fullWidth: true
              }
            }}
            label="End Date"
            format={DATE_FORMAT.ShortDateFormat}
            minDate={dayjs(DATE_LIMIT.min)}
            maxDate={dayjs(DATE_LIMIT.max)}
            value={formattedEndDateValue}
            onChange={(value: dayjs.Dayjs | null) => {
              if (!value || String(value) === 'Invalid Date') {
                // The creation input value will be 'Invalid Date' when the date field is cleared (empty), and will
                // contain an actual date string value if the field is not empty but is invalid.
                setFieldValue(endName, null);
                return;
              }

              setFieldValue(endName, dayjs(value).format(DATE_FORMAT.ShortDateFormat));
            }}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default StartEndDateFields;
