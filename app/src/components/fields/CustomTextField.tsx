import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import { IProjectCoordinatorForm } from 'features/projects/components/ProjectCoordinatorForm';
import { useFormikContext } from 'formik';
import React from 'react';

export interface ICustomTextField {
  label: string;
  name: string;
  other?: TextFieldProps;
}

const CustomTextField: React.FC<ICustomTextField> = (props) => {
  const { touched, errors, values, handleChange } = useFormikContext<IProjectCoordinatorForm>();
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
      helperText={touched[props.name] && errors[props.name]}
      {...other}
    />
  );
};

export default CustomTextField;
