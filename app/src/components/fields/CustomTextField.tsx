import TextField from '@mui/material/TextField';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
export interface ICustomTextField {
  label: string;
  name: string;
  maxLength?: number;
  /*
   * Needed fix: Add correct hardcoded type
   * Note: TextFieldProps causes build compile issue
   * https://github.com/mui/material-ui/issues/30038
   */
  other?: any;
}

const CustomTextField = (props: React.PropsWithChildren<ICustomTextField>) => {
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
      helperText={get(touched, name) && get(errors, name)}
      {...other}
    />
  );
};

export default CustomTextField;
