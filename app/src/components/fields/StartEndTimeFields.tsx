import { mdiClockOutline, mdiClockPlusOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Grid from '@mui/material/Grid';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { TIME_FORMAT } from 'constants/dateTimeFormats';
import get from 'lodash-es/get';
import moment from 'moment';
import React from 'react';

interface IStartEndTimeFieldsProps {
  formikProps: any;
  startName: string;
  endName: string;
  startRequired: boolean;
  endRequired: boolean;
  startTimeHelperText?: string;
  endTimeHelperText?: string;
}

const TimeStartIcon = () => {
  return <Icon path={mdiClockOutline} size={1} />;
};

const TimeEndIcon = () => {
  return <Icon path={mdiClockPlusOutline} size={1} />;
};

/**
 * Start/end Time fields - commonly used throughout forms
 *
 */
const StartEndTimeFields: React.FC<IStartEndTimeFieldsProps> = (props) => {
  const {
    formikProps: { values, errors, touched, setFieldValue },
    startName,
    endName,
    startRequired,
    endRequired,
    startTimeHelperText,
    endTimeHelperText
  } = props;

  const rawStartTimeValue = get(values, startName);
  const rawEndTimeValue = get(values, endName);

  const formattedStartTimeValue =
    (rawStartTimeValue &&
      moment(rawStartTimeValue, TIME_FORMAT.ShortTimeFormatAmPm).isValid() &&
      moment(rawStartTimeValue, TIME_FORMAT.ShortTimeFormatAmPm)) ||
    null;

  const formattedEndTimeValue =
    (rawEndTimeValue &&
      moment(rawEndTimeValue, TIME_FORMAT.ShortTimeFormatAmPm).isValid() &&
      moment(rawEndTimeValue, TIME_FORMAT.ShortTimeFormatAmPm)) ||
    null;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Grid container item spacing={3}>
        <Grid item xs={6}>
          <TimePicker
            slots={{
              openPickerIcon: TimeStartIcon
            }}
            slotProps={{
              textField: {
                id: 'start_time',
                name: startName,
                required: startRequired,
                variant: 'outlined',
                error: get(touched, startName) && Boolean(get(errors, startName)),
                helperText: (get(touched, startName) && get(errors, startName)) || startTimeHelperText,
                inputProps: {
                  'data-testid': 'start_time'
                },
                InputLabelProps: {
                  shrink: true
                },
                fullWidth: true
              }
            }}
            label="Start Time"
            format={TIME_FORMAT.ShortTimeFormatAmPm}
            value={formattedStartTimeValue}
            onChange={(value) => {
              if (!value || String(value.creationData().input) === 'Invalid Time') {
                // The creation input value will be 'Invalid Time' when the Time field is cleared (empty), and will
                // contain an actual Time string value if the field is not empty but is invalid.
                setFieldValue(startName, null);
                return;
              }

              setFieldValue(startName, moment(value).format(TIME_FORMAT.ShortTimeFormatAmPm));
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TimePicker
            slots={{
              openPickerIcon: TimeEndIcon
            }}
            slotProps={{
              textField: {
                id: 'end_time',
                name: endName,
                required: endRequired,
                variant: 'outlined',
                error: get(touched, endName) && Boolean(get(errors, endName)),
                helperText: (get(touched, endName) && get(errors, endName)) || endTimeHelperText,
                inputProps: {
                  'data-testid': 'end_time'
                },
                InputLabelProps: {
                  shrink: true
                },
                fullWidth: true
              }
            }}
            label="End Time"
            format={TIME_FORMAT.ShortTimeFormatAmPm}
            value={formattedEndTimeValue}
            onChange={(value: moment.Moment | null) => {
              if (!value || String(value.creationData().input) === 'Invalid Time') {
                // The creation input value will be 'Invalid Time' when the Time field is cleared (empty), and will
                // contain an actual Time string value if the field is not empty but is invalid.
                setFieldValue(endName, null);
                return;
              }

              setFieldValue(endName, moment(value).format(TIME_FORMAT.ShortTimeFormatAmPm));
            }}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default StartEndTimeFields;
