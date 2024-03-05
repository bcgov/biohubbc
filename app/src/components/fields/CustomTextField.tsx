import TextField from '@mui/material/TextField';
import { FormikContextType, useFormikContext } from 'formik';
import get from 'lodash-es/get';
export interface ICustomTextField {
  label: string;
  name: string;
  /*
   * Needed fix: Add correct hardcoded type
   * Note: TextFieldProps causes build compile issue
   * https://github.com/mui/material-ui/issues/30038
   */
  other?: any;
  //Additionally add a handlBlur if touced properties not updating correclty.
  handleBlur?: FormikContextType<any>['handleBlur'];

  maxLength?: number;

  endAdornment?: any;
}

const CustomTextField: React.FC<React.PropsWithChildren<ICustomTextField>> = (props) => {
  const { touched, errors, values, handleChange, handleBlur } = useFormikContext<any>();

  const { name, label, other } = props;

  return (
    <TextField
      name={name}
      label={label}
      id={name}
      inputProps={{ 'data-testid': name, maxLength: props.maxLength || undefined }} // targets the internal input rather than the react component
      onChange={handleChange}
      onBlur={handleBlur}
      variant="outlined"
      value={get(values, name) ?? ''}
      fullWidth={true}
      error={get(touched, name) && Boolean(get(errors, name))}
      helperText={get(touched, name) && (get(errors, name) as string)}
      {...other}
    />
  );
};

export default CustomTextField;
