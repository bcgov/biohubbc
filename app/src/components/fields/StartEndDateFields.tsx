import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
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
    formikProps: { values, handleChange, errors, touched },
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
      moment(rawStartDateValue).isValid() &&
      moment(rawStartDateValue).format(DATE_FORMAT.ShortDateFormat)) ||
    '';

  const formattedEndDateValue =
    (rawEndDateValue &&
      moment(rawEndDateValue).isValid() &&
      moment(rawEndDateValue).format(DATE_FORMAT.ShortDateFormat)) ||
    '';

  return (
    <Grid container item spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          id="start_date"
          name={startName}
          label="Start Date"
          variant="outlined"
          required={startRequired}
          value={formattedStartDateValue}
          type="date"
          InputProps={{
            // Chrome min/max dates
            inputProps: { min: DATE_LIMIT.min, max: DATE_LIMIT.max, 'data-testid': 'start-date' }
          }}
          inputProps={{
            // Firefox min/max dates
            min: DATE_LIMIT.min,
            max: DATE_LIMIT.max,
            'data-testid': 'start-date'
          }}
          onChange={handleChange}
          error={get(touched, startName) && Boolean(get(errors, startName))}
          helperText={(get(touched, startName) && get(errors, startName)) || startDateHelperText}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          id="end_date"
          name={endName}
          label="End Date"
          variant="outlined"
          required={endRequired}
          value={formattedEndDateValue}
          type="date"
          InputProps={{
            // Chrome min/max dates
            inputProps: { min: DATE_LIMIT.min, max: DATE_LIMIT.max, 'data-testid': 'end-date' }
          }}
          inputProps={{
            // Firefox min/max dates
            min: DATE_LIMIT.min,
            max: DATE_LIMIT.max,
            'data-testid': 'end-date'
          }}
          onChange={handleChange}
          error={get(touched, endName) && Boolean(get(errors, endName))}
          helperText={(get(touched, endName) && get(errors, endName)) || endDateHelperText}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
    </Grid>
  );
};

export default StartEndDateFields;
