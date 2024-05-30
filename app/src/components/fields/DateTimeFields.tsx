import Icon from '@mdi/react';
import Grid from '@mui/material/Grid';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DATE_FORMAT, DATE_LIMIT, TIME_FORMAT } from 'constants/dateTimeFormats';
import { default as dayjs } from 'dayjs';
import { FormikContextType } from 'formik';
import get from 'lodash-es/get';

interface IDateTimeFieldsProps<FormikPropsType> {
  date: {
    dateLabel: string;
    dateName: string;
    dateId: string;
    dateRequired: boolean;
    dateIcon: string;
  };
  time: {
    timeLabel: string;
    timeName: string;
    timeId: string;
    timeRequired: boolean;
    timeIcon: string;
  };
  formikProps: FormikContextType<FormikPropsType>;
}

export const DateTimeFields = <FormikPropsType,>(props: IDateTimeFieldsProps<FormikPropsType>) => {
  const {
    formikProps: { values, errors, touched, setFieldValue },
    date: { dateLabel, dateName, dateId, dateRequired, dateIcon },
    time: { timeLabel, timeName, timeId, timeRequired, timeIcon }
  } = props;

  const DateIcon = () => {
    return <Icon path={dateIcon} size={1} />;
  };

  const TimeIcon = () => {
    return <Icon path={timeIcon} size={1} />;
  };

  const rawDateValue = get(values, dateName);
  const formattedDateValue =
    (rawDateValue &&
      dayjs(rawDateValue, DATE_FORMAT.ShortDateFormat).isValid() &&
      dayjs(rawDateValue, DATE_FORMAT.ShortDateFormat)) ||
    null;

  const rawTimeValue = get(values, timeName);
  const formattedTimeValue =
    (rawTimeValue &&
      dayjs(rawTimeValue, TIME_FORMAT.LongTimeFormat24Hour).isValid() &&
      dayjs(rawTimeValue, TIME_FORMAT.LongTimeFormat24Hour)) ||
    null;

  console.log('11---------------------');
  console.log('error', get(touched, dateName) && Boolean(get(errors, dateName)));
  console.log('text', get(touched, dateName) && get(errors, dateName));
  console.log('33---------------------');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container>
        <Grid item xs={6}>
          <DatePicker
            sx={{
              '& .MuiOutlinedInput-root': {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0
              }
            }}
            slots={{
              openPickerIcon: DateIcon
            }}
            slotProps={{
              textField: {
                id: dateId,
                name: dateName,
                required: dateRequired,
                variant: 'outlined',
                error: get(touched, dateName) && Boolean(get(errors, dateName)),
                helperText: get(touched, dateName) && get(errors, dateName),
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
            minDate={dayjs(DATE_LIMIT.min)}
            maxDate={dayjs(DATE_LIMIT.max)}
            value={formattedDateValue}
            onChange={(value) => {
              if (!value || value === 'Invalid Date') {
                // The creation input value will be 'Invalid Date' when the date field is cleared (empty), and will
                // contain an actual date string value if the field is not empty but is invalid.
                setFieldValue(dateName, null);
                return;
              }

              setFieldValue(dateName, dayjs(value).format(DATE_FORMAT.ShortDateFormat));
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TimePicker
            sx={{
              '& .MuiOutlinedInput-root': {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0
              }
            }}
            slots={{
              openPickerIcon: TimeIcon
            }}
            slotProps={{
              textField: {
                id: timeId,
                name: timeName,
                required: timeRequired,
                variant: 'outlined',
                error: get(touched, timeName) && Boolean(get(errors, timeName)),
                helperText: get(touched, timeName) && get(errors, timeName),
                inputProps: {
                  'data-testid': timeId,
                  'aria-label': 'Time (optional)'
                },
                InputLabelProps: {
                  shrink: true
                },
                fullWidth: true
              }
            }}
            label={timeLabel}
            format={TIME_FORMAT.LongTimeFormat24Hour}
            value={formattedTimeValue}
            onChange={(value: dayjs.Dayjs | null) => {
              if (!value || !dayjs(value).isValid()) {
                // Check if the value is null or invalid, and if so, clear the field.
                setFieldValue(timeName, null);
                return;
              }

              setFieldValue(timeName, dayjs(value).format(TIME_FORMAT.LongTimeFormat24Hour));
            }}
            views={['hours', 'minutes', 'seconds']}
            timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
            ampm={false}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};
