import { FormControl, FormHelperText, InputLabel, Select, SelectProps } from '@mui/material';
import { useFormikContext } from 'formik';
import { get } from 'lodash-es';
import { ReactNode } from 'react';
import { ICbSelectSharedProps } from './CbSelectField';

interface CbSelectWrapperProps extends ICbSelectSharedProps {
  children?: ReactNode;
  onChange?: SelectProps['onChange'];
  value?: SelectProps['value'];
}

/**
 *
 * Wrapper for cb selects to handle all errors / onChange / onBlur
 *
 * @return {*}
 *
 **/

export const CbSelectWrapper = ({ children, name, label, controlProps, onChange, value }: CbSelectWrapperProps) => {
  const { values, touched, errors, handleBlur, handleChange } = useFormikContext();
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
