import TextField from '@material-ui/core/TextField';
import { useFormikContext } from 'formik';
import React from 'react';
import NumberFormat from 'react-number-format';

export interface IDollarAmountFieldProps {
  required?: boolean;
  id: string;
  label: string;
  name: string;
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
  const { values, handleChange, touched, errors } = useFormikContext<IDollarAmountFieldProps>();

  const { required, id, name, label } = props;

  return (
    <TextField
      fullWidth
      required={required}
      id={id}
      name={name}
      label={label}
      variant="outlined"
      value={values[name]}
      onChange={handleChange}
      error={touched[id] && Boolean(errors[id])}
      helperText={errors[id]}
      InputLabelProps={{
        shrink: true
      }}
      InputProps={{
        inputComponent: NumberFormatCustom as any
      }}
      inputProps={{ 'data-testid': name }}
    />
  );
};

export default DollarAmountField;
