import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import { ChangeEvent, useMemo } from 'react';
export interface ICustomTextField {
  /**
   * Label for the text field
   *
   * @type {string}
   * @memberof ICustomTextField
   */
  label: string;
  /**
   * Placeholder for the text field
   *
   * @type {string}
   * @memberof ICustomTextField
   */
  placeholder?: string;
  /**
   * Name of the text field, typically this is used to identify the field in the formik context.
   *
   * @type {string}
   * @memberof ICustomTextField
   */
  name: string;
  /**
   * Optional maxLength for the text field.
   *
   * @type {number}
   * @memberof ICustomTextField
   */
  maxLength?: number;
  /**
   * Optional help text to be displayed in a tooltip
   *
   * @type {string}
   * @memberof ICustomTextField
   */
  helpText?: string;
  /**
   * Optional onChange event handler for the text field
   *
   * Note: If provided this will override the default `onChange` handler from formik
   *
   * @type {(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | undefined) => void}
   * @memberof ICustomTextField
   */
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /*
   * TODO: Needed fix: Add correct hardcoded type
   * Note: TextFieldProps causes build compile issue
   * https://github.com/mui/material-ui/issues/30038
   */
  other?: any;
}

const CustomTextField = (props: React.PropsWithChildren<ICustomTextField>) => {
  const { touched, errors, values, handleChange, handleBlur } = useFormikContext<any>();

  const { name, label, other, placeholder, helpText } = props;

  // Used to avoid the tooltip adornment overlapping with MUI's default number control adornment
  const isNumber = useMemo(() => other?.type === 'number', [other]);

  return (
    <TextField
      name={name}
      label={label}
      id={name}
      placeholder={placeholder}
      inputProps={{
        'data-testid': name,
        maxLength: props.maxLength || undefined
      }}
      InputProps={{
        endAdornment: helpText && (
          <InputAdornment position="start">
            <HelpButtonTooltip content={helpText} />
          </InputAdornment>
        )
      }}
      onChange={(event) => {
        // Call the optional onChange prop if it exists
        if (props.onChange) {
          props.onChange(event);
          return;
        }

        handleChange(event);
      }}
      onBlur={handleBlur}
      variant="outlined"
      value={get(values, name) ?? ''}
      fullWidth={true}
      error={get(touched, name) && Boolean(get(errors, name))}
      helperText={get(touched, name) && get(errors, name)}
      sx={{
        '& .MuiInputAdornment-root': {
          mr: isNumber ? 3 : 0,
          height: '100%',
          alignSelf: 'flex-start',
          position: 'absolute',
          top: 12,
          right: 12
        },
        ...other?.sx
      }}
      {...other}
    />
  );
};

export default CustomTextField;
