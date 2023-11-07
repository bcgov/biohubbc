import { mdiCalendarStart } from '@mdi/js';
import Icon from '@mdi/react';
import Grid from '@mui/material/Grid';
import { DatePicker, renderTimeViewClock, TimePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DATE_FORMAT, DATE_LIMIT, TIME_FORMAT } from 'constants/dateTimeFormats';
import get from 'lodash-es/get';
import moment from 'moment';
import React from 'react';

interface IDateTimeFieldsProps {
  date: {
    dateLabel: string;
    dateName: string;
    dateId: string;
    dateRequired: boolean;
    dateHelperText?: string;
  };
  time: {
    timeLabel: string;
    timeName: string;
    timeId: string;
    timeRequired: boolean;
    timeHelperText?: string;
  };
  formikProps: any;
}

const CalendarStartIcon = () => {
  return <Icon path={mdiCalendarStart} size={1} />;
};

export const DateTimeFields: React.FC<IDateTimeFieldsProps> = (props) => {
  const {
    formikProps: { values, errors, touched, setFieldValue },
    date: { dateName, dateId, dateRequired, dateHelperText, dateLabel },
    time: { timeLabel, timeName, timeId, timeRequired, timeHelperText }
  } = props;

  const rawDateValue = get(values, dateName);
  const formattedDateValue =
    (rawDateValue &&
      moment(rawDateValue, DATE_FORMAT.ShortDateFormat).isValid() &&
      moment(rawDateValue, DATE_FORMAT.ShortDateFormat)) ||
    null;

  const rawTimeValue = get(values, timeName);
  const formattedTimeValue =
    (rawTimeValue &&
      moment(rawTimeValue, TIME_FORMAT.ShortTimeFormatAmPm).isValid() &&
      moment(rawTimeValue, TIME_FORMAT.ShortTimeFormatAmPm)) ||
    null;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Grid container item spacing={3}>
        <Grid item xs={6}>
          <DatePicker
            slots={{
              openPickerIcon: dateIcon
            }}
            slotProps={{
              textField: {
                id: dateId,
                name: dateName,
                required: dateRequired,
                variant: 'outlined',
                error: get(touched, dateName) && Boolean(get(errors, dateName)),
                helperText: (get(touched, dateName) && get(errors, dateName)) || dateHelperText,
                inputProps: {
                  'data-testid': dateName
                },
                InputLabelProps: {
                  shrink: true
                },
                fullWidth: true
              }
            }}
            label={dateLabel}
            format={DATE_FORMAT.ShortDateFormat}
            minDate={moment(DATE_LIMIT.min)}
            maxDate={moment(DATE_LIMIT.max)}
            value={formattedDateValue}
            onChange={(value) => {
              if (!value || String(value.creationData().input) === 'Invalid Date') {
                // The creation input value will be 'Invalid Date' when the date field is cleared (empty), and will
                // contain an actual date string value if the field is not empty but is invalid.
                setFieldValue(dateName, null);
                return;
              }

              setFieldValue(dateName, moment(value).format(DATE_FORMAT.ShortDateFormat));
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TimePicker
            slots={{
              openPickerIcon: timeIcon
            }}
            slotProps={{
              textField: {
                id: timeId,
                name: timeName,
                required: timeRequired,
                variant: 'outlined',
                error: get(touched, timeName) && Boolean(get(errors, timeName)),
                helperText: (get(touched, timeName) && get(errors, timeName)) || timeHelperText,
                inputProps: {
                  'data-testid': timeId
                },
                InputLabelProps: {
                  shrink: true
                },
                fullWidth: true
              }
            }}
            label={timeLabel}
            format={TIME_FORMAT.ShortTimeFormatAmPm}
            value={formattedTimeValue}
            onChange={(value: moment.Moment | null) => {
              if (!value || String(value.creationData().input) === 'Invalid Time') {
                // The creation input value will be 'Invalid Time' when the Time field is cleared (empty), and will
                // contain an actual Time string value if the field is not empty but is invalid.
                setFieldValue(timeName, null);
                return;
              }

              setFieldValue(timeName, moment(value).format(TIME_FORMAT.ShortTimeFormatAmPm));
            }}
            viewRenderers={{
              hours: renderTimeViewClock,
              minutes: renderTimeViewClock,
              seconds: renderTimeViewClock
            }}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};
