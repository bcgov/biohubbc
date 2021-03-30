import { TextField } from '@material-ui/core';
import React from 'react';
import NumberFormat from 'react-number-format';

export interface IDollarAmountFieldProps {
  required?: boolean;
  id: string;
  label: string;
  name: string;
  value: number;
  handleChange: any;
  touched: any;
  errors: any;
}

interface NumberFormatCustomProps {
  inputRef: (instance: NumberFormat | null) => void;
  onChange: (event: { target: { name: string; value: number } }) => void;
  name: string;
}

function NumberFormatCustom(props: NumberFormatCustomProps) {
  const { inputRef, onChange, ...other } = props;
  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: parseInt(values.value)
          }
        });
      }}
      thousandSeparator
      prefix="$"
      decimalScale={0}
    />
  );
}

const DollarAmountField: React.FC<IDollarAmountFieldProps> = (props) => {
  const { required, id, name, label, value, handleChange, touched, errors } = props;

  return (
    <TextField
      fullWidth
      required={required}
      id={id}
      name={name}
      label={label}
      variant="outlined"
      value={value}
      onChange={handleChange}
      error={touched[id] && Boolean(errors[id])}
      helperText={errors[id]}
      InputLabelProps={{
        shrink: true
      }}
      InputProps={{
        inputComponent: NumberFormatCustom as any
      }}
    />
  );
};

export default DollarAmountField;
