import { FormControl, FormControlProps, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { FormikContextType, useFormikContext } from 'formik';
import useDataLoader from 'hooks/useDataLoader';
import get from 'lodash-es/get';
import React from 'react';

interface ITelemetrySelectField {
  name: string;
  label: string;
  id: string;
  fetchData: () => Promise<(string | number)[]>;
  controlProps?: FormControlProps;
  handleBlur?: FormikContextType<any>['handleBlur'];
}

interface ISelectOption {
  value: string | number;
  label: string;
}

const TelemetrySelectField: React.FC<ITelemetrySelectField> = (props) => {
  const bctwLookupLoader = useDataLoader(() => props.fetchData());
  const { values, touched, errors, handleChange } = useFormikContext<ISelectOption>();

  const err = get(touched, props.name) && get(errors, props.name);

  if (!bctwLookupLoader.data) {
    bctwLookupLoader.load();
  }

  const value = bctwLookupLoader.hasLoaded && get(values, props.name) ? get(values, props.name) : '';

  return (
    <FormControl variant="outlined" fullWidth {...props.controlProps} error={!!err}>
      <InputLabel id={`${props.name}-label`}>{props.label}</InputLabel>
      <Select
        name={props.name}
        labelId="telemetry_select"
        label={props.label}
        value={value ?? ''}
        onChange={handleChange}
        onBlur={props.handleBlur}
        displayEmpty>
        {bctwLookupLoader.data?.map((bctwValue: string | number) => {
          return (
            <MenuItem key={String(bctwValue)} value={bctwValue}>
              {bctwValue}
            </MenuItem>
          );
        })}
      </Select>
      <FormHelperText>{err}</FormHelperText>
    </FormControl>
  );
};

export default TelemetrySelectField;
