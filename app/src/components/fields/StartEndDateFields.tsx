import Grid from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import get from 'lodash-es/get';
import moment from 'moment';
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
    (rawStartDateValue && moment(rawStartDateValue).isValid() && moment(rawStartDateValue)) || null;

  const formattedEndDateValue =
    (rawEndDateValue && moment(rawEndDateValue).isValid() && moment(rawEndDateValue)) || null;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Grid container item spacing={3}>
        <Grid item xs={12} md={6}>
          <DatePicker
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
                }
              }
            }}
            label="Start Date"
            format={DATE_FORMAT.ShortDateFormat}
            minDate={moment(DATE_LIMIT.min)}
            maxDate={moment(DATE_LIMIT.max)}
            value={formattedStartDateValue}
            onChange={(value) => {
              setFieldValue('start_date', moment(value).format(DATE_FORMAT.ShortDateFormat));
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DatePicker
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
                }
              }
            }}
            label="End Date"
            format={DATE_FORMAT.ShortDateFormat}
            minDate={moment(DATE_LIMIT.min)}
            maxDate={moment(DATE_LIMIT.max)}
            value={formattedEndDateValue}
            onChange={(value) => {
              setFieldValue('end_date', moment(value).format(DATE_FORMAT.ShortDateFormat));
            }}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default StartEndDateFields;
