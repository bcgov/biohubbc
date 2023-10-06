import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';

export type IDollarAmountFieldProps = TextFieldProps & {
  required?: boolean;
  id: string;
  label: string;
  name: string;
};

interface NumberFormatCustomProps {
  onChange: (event: { target: { name: string; value: number } }) => void;
  name: string;
}

const NumberFormatCustom = React.forwardRef<NumberFormatProps, NumberFormatCustomProps>(function NumericFormatCustom(
  props,
  ref
) {
  const { onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: parseInt(values.value)
          }
        });
      }}
      thousandSeparator
      decimalScale={0}
    />
  );
});

const DollarAmountField: React.FC<IDollarAmountFieldProps> = (props) => {
  const { values, handleChange, touched, errors } = useFormikContext<IDollarAmountFieldProps>();

  const { name, ...rest } = props;

  return (
    <TextField
      {...rest}
      name={name}
      variant="outlined"
      value={get(values, name)}
      onChange={handleChange}
      error={get(touched, name) && Boolean(get(errors, name))}
      helperText={get(touched, name) && (get(errors, name) as string)}
      InputProps={{
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
        inputComponent: NumberFormatCustom as any
      }}
      inputProps={{ 'data-testid': name }}
    />
  );
};

export default DollarAmountField;
