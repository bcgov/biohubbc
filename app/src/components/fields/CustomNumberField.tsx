import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';

type BaseNumberFieldProps = {
  name: string;
  min?: number;
  max?: number;
  float?: boolean;
};

type INumberFieldProps = TextFieldProps & BaseNumberFieldProps & { required?: boolean; label: string };

type NumberFormatCustomProps = BaseNumberFieldProps & {
  onChange: (event: { target: { name: string; value: number } }) => void;
};

const NumberFormatCustom = React.forwardRef<NumberFormatProps, NumberFormatCustomProps>(function NumericFormatCustom(
  props,
  ref
) {
  const { onChange, min, max, float, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: float ? parseFloat(values.value) : parseInt(values.value)
          }
        });
      }}
      decimalScale={float ? 7 : 0}
      isAllowed={(values) => {
        const value = float ? parseFloat(values.value) : parseInt(values.value);
        return (
          values.value === '' ||
          (value >= (min ?? Number.MIN_SAFE_INTEGER) && value <= (max ?? Number.MAX_SAFE_INTEGER))
        );
      }}
    />
  );
});

const CustomNumberField: React.FC<INumberFieldProps> = (props) => {
  const { values, handleChange, touched, errors } = useFormikContext<INumberFieldProps>();

  const { name, min, max, float, ...rest } = props;

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

export default CustomNumberField;
