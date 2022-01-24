import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React from 'react';
export interface ICustomTextField {
  label: string;
  name: string;
  other?: TextFieldProps;
}

const CustomTextField: React.FC<ICustomTextField> = (props) => {
  const { touched, errors, values, handleChange } = useFormikContext<any>();

  const { name, label, other } = props;

  return (
    <TextField
      name={name}
      label={label}
      id={name}
      onChange={handleChange}
      variant="outlined"
      value={get(values, name)}
      fullWidth={true}
      error={get(touched, name) && Boolean(get(errors, name))}
      helperText={get(touched, name) && get(errors, name)}
      {...other}
    />
  );
};

export default CustomTextField;
