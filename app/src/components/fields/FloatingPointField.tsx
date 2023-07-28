import TextField from '@mui/material/TextField';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React from 'react';
import NumberFormat from 'react-number-format';
// import NumberFormat from 'react-number-format';

export interface IFloatingPointField {
  required?: boolean;
  id: string;
  label: string;
  name: string;
  min?: number;
  max?: number;
}

interface NumberFormatCustomProps {
  inputRef: (instance: NumberFormat | null) => void;
  onChange: (event: { target: { name: string; value: number } }) => void;
  name: string;
  min?: number;
  max?: number;
}

function NumberFormatCustom(props: NumberFormatCustomProps) {
  const { inputRef, onChange, min, max, ...other } = props;
  return (
    <NumberFormat
      {...other}
      isAllowed={(values) => {
        const { floatValue } = values;
        if (floatValue === undefined) return true;
        return (min === undefined || floatValue >= min) && (max === undefined || floatValue <= max);
      }}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: parseFloat(values.value)
          }
        });
      }}
      decimalScale={7}
    />
  );
}

const FloatingPointField: React.FC<IFloatingPointField> = (props) => {
  const { values, handleChange, touched, errors } = useFormikContext<IFloatingPointField>();

  const { required, id, name, label, min, max } = props;

  return (
    <TextField
      fullWidth
      required={required}
      id={id}
      name={name}
      label={label}
      variant="outlined"
      value={get(values, name)}
      onChange={handleChange}
      error={get(touched, name) && Boolean(get(errors, name))}
      helperText={get(touched, name) && (get(errors, name) as string)}
      inputProps={{ 'data-testid': name, min: min, max: max }}
      InputProps={{
        inputComponent: NumberFormatCustom as any
      }}
    />
  );
};

export default FloatingPointField;
