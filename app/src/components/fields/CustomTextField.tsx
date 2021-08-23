import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import { useFormikContext } from 'formik';
import React from 'react';

export interface ICustomTextField {
  label: string;
  name: string;
  other?: TextFieldProps;
}

const CustomTextField: React.FC<ICustomTextField> = (props) => {
  const { touched, errors, values, handleChange } = useFormikContext<object>();
  const { name, label, other } = props;

  return (
    <TextField
      name={name}
      label={label}
      id={name}
      onChange={handleChange}
      variant="outlined"
      value={values[name]}
      fullWidth={true}
      error={touched[name] && Boolean(errors[name])}
      helperText={touched[name] && errors[name]}
      {...other}
    />
  );
};

export default CustomTextField;
