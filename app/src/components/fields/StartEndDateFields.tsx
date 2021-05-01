import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { DATE_LIMIT } from 'constants/dateFormats';
import React from 'react';

interface IStartEndDateFieldsProps {
  formikProps: any;
  startRequired: boolean;
  endRequired: boolean;
}

/**
 * Start/end date fields - commonly used throughout forms
 *
 */
const StartEndDateFields: React.FC<IStartEndDateFieldsProps> = (props) => {
  const {
    formikProps: { values, handleChange, errors, touched },
    startRequired,
    endRequired
  } = props;

  return (
    <Grid container item spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          id="start_date"
          name="start_date"
          label="Start Date"
          variant="outlined"
          required={startRequired}
          value={values.start_date}
          type="date"
          inputProps={{ min: DATE_LIMIT.min, max: DATE_LIMIT.max, 'data-testid': 'start-date' }}
          onChange={handleChange}
          error={touched.start_date && Boolean(errors.start_date)}
          helperText={touched.start_date && errors.start_date}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          id="end_date"
          name="end_date"
          label="End Date"
          variant="outlined"
          required={endRequired}
          value={values.end_date}
          type="date"
          inputProps={{ min: DATE_LIMIT.min, max: DATE_LIMIT.max, 'data-testid': 'end-date' }}
          onChange={handleChange}
          error={touched.end_date && Boolean(errors.end_date)}
          helperText={errors.end_date}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
    </Grid>
  );
};

export default StartEndDateFields;
