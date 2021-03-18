import { Grid, TextField } from '@material-ui/core';
import { DATE_LIMIT } from 'constants/dateFormats';
import React from 'react';

interface IProjectDetailsFormProps {
  values: any;
  handleChange: Function;
  errors: any;
  touched: any;
  startRequired: boolean;
  endRequired: boolean;
}

/**
 * Start/end date fields - commonly used throughout forms
 *
 */
const StartEndDateFields: React.FC<IProjectDetailsFormProps> = (props: any) => {
  const { values, handleChange, errors, touched, startRequired, endRequired } = props;

  return (
    <Grid container item xs={12} spacing={3}>
      <Grid item>
        <TextField
          id="start_date"
          name="start_date"
          label="Start Date"
          variant="outlined"
          required={startRequired}
          value={values.start_date}
          type="date"
          inputProps={{ min: DATE_LIMIT.min, max: DATE_LIMIT.max }}
          onChange={handleChange}
          error={touched.start_date && Boolean(errors.start_date)}
          helperText={errors.start_date}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
      <Grid item>
        <TextField
          id="end_date"
          name="end_date"
          label="End Date"
          variant="outlined"
          required={endRequired}
          value={values.end_date}
          type="date"
          inputProps={{ min: DATE_LIMIT.min, max: DATE_LIMIT.max }}
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
