import { FormControl, FormControlProps, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { useFormikContext } from 'formik';
import { ICbRouteKey } from 'hooks/cb_api/useLookupApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import get from 'lodash-es/get';
import React, { useEffect } from 'react';

export interface ICbSelectField {
  name: string;
  label: string;
  id: string;
  route: ICbRouteKey;
  param?: string;
  query?: string;
  controlProps?: FormControlProps;
}

interface ICbSelectOption {
  value: string | number;
  label: string;
}

const CbSelectField: React.FC<ICbSelectField> = (props) => {
  const { name, label, route, param, query } = props;

  const api = useCritterbaseApi();
  const { data, load, refresh, isReady } = useDataLoader(async () => api.lookup.getSelectOptions(route, param, query));
  const { values, touched, errors, handleChange, handleBlur, setFieldValue, setFieldTouched } =
    useFormikContext<ICbSelectOption>();

  const err = get(touched, name) && get(errors, name);
  const val = get(values, name) ?? '';

  if (!data) {
    load();
  }

  const isValueInRange = () => {
    if (val === '') {
      return true;
    }
    if (!data) {
      return false;
    }
    return data.some((d) => (typeof d === 'string' ? d === val : d.id === val));
  };

  const handleInRange = () => {
    if (!isValueInRange()) {
      setFieldValue(name, '');
      setFieldTouched(name);
    }
  };

  useEffect(refresh, [param, query]);
  useEffect(handleInRange, [isReady]);

  return (
    <FormControl variant="outlined" fullWidth {...props.controlProps} error={Boolean(err)}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        name={name}
        labelId="cb_select"
        label={label}
        value={isValueInRange() ? val : ''}
        onChange={handleChange}
        onBlur={handleBlur}
        displayEmpty>
        {data?.map((a) => {
          const item = typeof a === 'string' ? { label: a, value: a } : { label: a.value, value: a.id };
          return (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          );
        })}
      </Select>
      <FormHelperText>{err}</FormHelperText>
    </FormControl>
  );
};

export default CbSelectField;
