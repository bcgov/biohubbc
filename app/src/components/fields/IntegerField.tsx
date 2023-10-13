import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';

export type IIntegerFieldProps = TextFieldProps & {
  required?: boolean;
  label: string;
  name: string;
  min?: number;
  max?: number;
};

interface NumberFormatCustomProps {
  onChange: (event: { target: { name: string; value: number } }) => void;
  name: string;
  min?: number;
  max?: number;
}

const NumberFormatCustom = React.forwardRef<NumberFormatProps, NumberFormatCustomProps>(function NumericFormatCustom(
  props,
  ref
) {
  const { onChange, min = -2147483648, max = 2147483647, ...other } = props;

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
      decimalScale={0}
      isAllowed={(values) => {
        const intValue = parseInt(values.value);
        return values.value === '' || (intValue >= min && intValue <= max);
      }}
    />
  );
});

const IntegerField: React.FC<IIntegerFieldProps> = (props) => {
  const { values, handleChange, touched, errors } = useFormikContext<IIntegerFieldProps>();

  const { name, min, max, ...rest } = props;

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
        inputComponent: NumberFormatCustom as any
      }}
      inputProps={{ 'data-testid': name, min, max }}
      fullWidth={true}
    />
  );
};

export default IntegerField;
