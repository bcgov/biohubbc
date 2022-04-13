import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React from 'react';
import appTheme from 'themes/appTheme';

export interface ISelectWithSubtextFieldOption {
  value: string | number;
  label: string;
  subText?: string;
}

export interface ISelectWithSubtextField {
  id: string;
  name: string;
  label: string;
  options: ISelectWithSubtextFieldOption[];
  required?: boolean;
}

const selectWithSubtextTheme = createMuiTheme({
  ...appTheme,
  overrides: {
    ...(appTheme?.overrides || {}),
    MuiMenu: {
      paper: {
        maxWidth: 500,
        maxHeight: 500
      }
    },
    MuiMenuItem: {
      root: {
        whiteSpace: 'break-spaces',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
      }
    },
    MuiListItemText: {
      primary: {
        fontWeight: 700
      }
    },
    MuiTypography: {
      body1: {
        '& + p': {
          marginTop: 0
        }
      }
    }
  }
});

const SelectWithSubtextField: React.FC<ISelectWithSubtextField> = (props) => {
  const { values, touched, errors, handleChange } = useFormikContext<ISelectWithSubtextFieldOption>();

  return (
    <ThemeProvider theme={selectWithSubtextTheme}>
      <FormControl fullWidth variant="outlined" required={props.required} style={{ width: '100%' }}>
        <InputLabel id={`${props.name}-label`}>{props.label}</InputLabel>
        <Select
          id={props.id}
          name={props.name}
          labelId={`${props.name}-label`}
          label={props.label}
          value={get(values, props.name)}
          labelWidth={300}
          onChange={handleChange}
          error={get(touched, props.name) && Boolean(get(errors, props.name))}
          displayEmpty
          inputProps={{ 'aria-label': props.label }}
          renderValue={(value) => {
            // convert the selected `value` back into its matching `label`
            const code = props.options.find((item) => item.value === value);
            return <>{code?.label}</>;
          }}>
          {props.options.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              <ListItemText primary={item.label} secondary={item.subText} />
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{get(touched, props.name) && get(errors, props.name)}</FormHelperText>
      </FormControl>
    </ThemeProvider>
  );
};

export default SelectWithSubtextField;
