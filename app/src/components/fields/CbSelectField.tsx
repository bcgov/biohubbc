import { FormControl, FormControlProps, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useFormikContext } from 'formik';
import { ICbRouteKey, ICbSelectRows } from 'hooks/cb_api/useLookupApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import get from 'lodash-es/get';
import React, { useEffect } from 'react';

export interface ICbSelectField {
  name: string;
  label: string;
  id: string;
  route: ICbRouteKey;
  taxon_id?: string;
  controlProps?: FormControlProps;
  handleChangeSideEffect?: (value: string, label: string) => void;
}

interface ICbSelectOption {
  value: string | number;
  label: string;
}

const CbSelectField: React.FC<ICbSelectField> = (props) => {
  const { name, label, taxon_id, route, handleChangeSideEffect } = props;

  const api = useCritterbaseApi();
  const { data, load, refresh, isReady } = useDataLoader(async () => api.lookup.getSelectOptions(route, taxon_id));
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

  useEffect(refresh, [taxon_id]);
  useEffect(handleInRange, [isReady]);

  const innerChangeHandler = (e: SelectChangeEvent<any>) => {
    handleChange(e);
    if (handleChangeSideEffect) {
      const item = data?.find((a) => typeof a !== 'string' && a.id === e.target.value);
      handleChangeSideEffect(e.target.value, (item as ICbSelectRows).value);
    }
  };

  return (
    <FormControl variant="outlined" fullWidth {...props.controlProps} error={Boolean(err)}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        name={name}
        labelId="cb_select"
        label={label}
        value={isValueInRange() ? val : ''}
        onChange={innerChangeHandler}
        onBlur={handleBlur}
        displayEmpty
        inputProps={{ 'aria-label': 'Permit Type' }}>
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
