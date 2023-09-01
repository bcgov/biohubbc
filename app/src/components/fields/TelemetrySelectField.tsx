import { FormControl, FormControlProps, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { useFormikContext } from 'formik';
import useDataLoader from 'hooks/useDataLoader';
import { TelemetryApiLookupFunctions } from 'hooks/useTelemetryApi';
import get from 'lodash-es/get';
import React from 'react';

interface ITelemetrySelectField {
  name: string;
  label: string;
  id: string;
  fetchData: TelemetryApiLookupFunctions;
  controlProps?: FormControlProps;
}

interface ISelectOption {
  value: string | number;
  label: string;
}

const TelemetrySelectField: React.FC<ITelemetrySelectField> = (props) => {
  const bctwLookupLoader = useDataLoader(() => props.fetchData());
  const { values, touched, errors, handleChange, handleBlur } = useFormikContext<ISelectOption>();

  const err = get(touched, props.name) && get(errors, props.name);

  if (!bctwLookupLoader.data) {
    bctwLookupLoader.load();
  }

  return (
    <FormControl variant="outlined" fullWidth {...props.controlProps} error={!!err}>
      <InputLabel id={`${props.name}-label`}>{props.label}</InputLabel>
      <Select
        name={props.name}
        labelId="telemetry_select"
        label={props.label}
        value={get(values, props.name) ?? ''}
        onChange={handleChange}
        onBlur={handleBlur}
        displayEmpty
        inputProps={{ 'aria-label': 'Permit Type' }}>
        {bctwLookupLoader.data?.map((a) => {
          return (
            <MenuItem key={a} value={a}>
              {a}
            </MenuItem>
          );
        })}
      </Select>
      <FormHelperText>{err}</FormHelperText>
    </FormControl>
  );
};

export default TelemetrySelectField;
