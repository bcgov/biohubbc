import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { ThemeProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
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

const useStyles = makeStyles((theme: Theme) => ({
  menu: {
    paper: {
      minWidth: '72ch !important',
      maxWidth: '72ch !important',
      maxHeight: 500
    }
  },
  menuItem: {
    root: {
      whiteSpace: 'break-spaces',
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
    }
  },
  listItemText: {
    primary: {
      fontSize: '14px',
      fontWeight: 700
    },
    secondary: {
      marginTop: theme.spacing(0.5)
    }
  },
  inputLabel: {
    root: {
      paddingRight: '20px'
    }
  }
}));

// TODO
const SelectWithSubtextField: React.FC<ISelectWithSubtextField> = (props) => {
  const { values, touched, errors, handleChange } = useFormikContext<ISelectWithSubtextFieldOption>();
  const classes = useStyles();

  return (
    <FormControl
      fullWidth
      variant="outlined"
      required={props.required}
      error={get(touched, props.name) && Boolean(get(errors, props.name))}
      style={{ width: '100%' }}>
      <InputLabel id={`${props.name}-label`} className={classes.inputLabel}>{props.label}</InputLabel>
      <Select
        name={props.name}
        labelId={`${props.name}-label`}
        label={props.label}
        value={get(values, props.name)}
        onChange={handleChange}
        displayEmpty
        inputProps={{ id: props.id, 'aria-label': props.label }}
        renderValue={(value) => {
          // convert the selected `value` back into its matching `label`
          const code = props.options.find((item) => item.value === value);
          return <>{code?.label}</>;
        }}
        MenuProps={{
          className: classes.menu,
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left'
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left'
          }
        }}>
        {props.options.map((item) => (
          <MenuItem className={classes.menuItem} key={item.value} value={item.value}>
            <ListItemText className={classes.listItemText} primary={item.label} secondary={item.subText} />
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{get(touched, props.name) && get(errors, props.name)}</FormHelperText>
    </FormControl>
  );
};

export default SelectWithSubtextField;
