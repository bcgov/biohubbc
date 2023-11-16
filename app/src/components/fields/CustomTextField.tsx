import TextField from '@mui/material/TextField';
import { FormikContextType, useFormikContext } from 'formik';
import get from 'lodash-es/get';
export interface ICustomTextField {
  label: string;
  name: string;
  other?: any; //TODO: change to correct hard coded props. TextFieldProps causing issue
  //Additionally add a handlBlur if touced properties not updating correclty.
  handleBlur?: FormikContextType<any>['handleBlur'];

  maxLength?: number;
}

const CustomTextField: React.FC<React.PropsWithChildren<ICustomTextField>> = (props) => {
  const { touched, errors, values, handleChange } = useFormikContext<any>();

  const { name, label, other, handleBlur } = props;

  return (
    <TextField
      name={name}
      label={label}
      id={name}
      inputProps={{ 'data-testid': name, maxLength: props.maxLength || undefined }} // targets the internal input rather than the react component
      onChange={handleChange}
      onBlur={handleBlur}
      variant="outlined"
      value={get(values, name)}
      fullWidth={true}
      error={get(touched, name) && Boolean(get(errors, name))}
      helperText={get(touched, name) && (get(errors, name) as string)}
      {...other}
    />
  );
};

export default CustomTextField;
