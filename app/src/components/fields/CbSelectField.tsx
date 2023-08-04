import {
  FormControl,
  FormControlProps,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SelectProps
} from '@mui/material';
import { useFormikContext } from 'formik';
import { ICbRouteKey, ICbSelectRows } from 'hooks/cb_api/useLookupApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import get from 'lodash-es/get';
import React, { ReactNode, useEffect } from 'react';

interface ICbSelectSharedProps {
  name: string;
  label: string;
  controlProps?: FormControlProps;
}

export interface ICbSelectField extends ICbSelectSharedProps {
  id: string;
  route: ICbRouteKey;
  param?: string;
  query?: string;
  handleChangeSideEffect?: (value: string, label: string) => void;
}

interface ICbSelectOption {
  value: string | number;
  label: string;
}

const CbSelectField: React.FC<ICbSelectField> = (props) => {
  const { name, label, route, param, query, handleChangeSideEffect, controlProps } = props;

  const api = useCritterbaseApi();
  const { data, load, refresh, isReady } = useDataLoader(async () =>
    api.lookup.getSelectOptions<ICbSelectRows | string>({ route, param, query })
  );
  const { values, handleChange, setFieldValue, setFieldTouched } = useFormikContext<ICbSelectOption>();

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

  const innerChangeHandler = (e: SelectChangeEvent<any>) => {
    handleChange(e);
    if (handleChangeSideEffect) {
      const item = data?.find((a) => typeof a !== 'string' && a.id === e.target.value);
      handleChangeSideEffect(e.target.value, (item as ICbSelectRows).value);
    }
  };

  return (
    <FormikSelectWrapper
      name={name}
      label={label}
      controlProps={controlProps}
      onChange={innerChangeHandler}
      value={isValueInRange() ? val : ''}>
      {data?.map((a) => {
        const item = typeof a === 'string' ? { label: a, value: a } : { label: a.value, value: a.id };
        return (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        );
      })}
    </FormikSelectWrapper>
  );
};

interface FormikSelectWrapperProps extends ICbSelectSharedProps {
  children?: ReactNode;
  onChange?: SelectProps['onChange'];
  value?: SelectProps['value'];
}

export const FormikSelectWrapper = ({
  children,
  name,
  label,
  controlProps,
  onChange,
  value
}: FormikSelectWrapperProps) => {
  const { values, touched, errors, handleBlur, handleChange } = useFormikContext<ICbSelectOption>();
  const val = get(values, name) ?? '';
  const err = get(touched, name) && get(errors, name);
  return (
    <FormControl variant="outlined" fullWidth {...controlProps} error={Boolean(err)}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        name={name}
        labelId="cb-select-wrapper"
        value={value ?? val}
        onChange={onChange ?? handleChange}
        label={label}
        onBlur={handleBlur}
        displayEmpty>
        {children}
      </Select>
      <FormHelperText>{err}</FormHelperText>
    </FormControl>
  );
};

export default CbSelectField;
