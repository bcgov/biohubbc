import FormControl, { FormControlProps } from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { FormikContextType, useFormikContext } from 'formik';
import useDataLoader from 'hooks/useDataLoader';
import get from 'lodash-es/get';
import React from 'react';

interface IAllTelemetrySelectField {
  name: string;
  label: string;
  id: string;
  fetchData: () => Promise<(string | number)[]>;
  controlProps?: FormControlProps;
  handleBlur?: FormikContextType<any>['handleBlur'];
  handleChange?: FormikContextType<any>['handleChange'];
}

interface ISelectOption {
  value: string | number;
  label: string;
}

const TelemetrySelectField: React.FC<IAllTelemetrySelectField> = (props) => {
  const bctwLookupLoader = useDataLoader(() => props.fetchData());
  const { values, touched, errors, handleChange, handleBlur } = useFormikContext<ISelectOption>();

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
        onChange={props.handleChange ?? handleChange}
        onBlur={props.handleBlur ?? handleBlur}>
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
