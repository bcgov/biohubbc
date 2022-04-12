import { ListItemText } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React from 'react';

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

const SelectWithSubtextField: React.FC<ISelectWithSubtextField> = (props) => {
  const { values, touched, errors, handleChange } = useFormikContext<ISelectWithSubtextFieldOption>();

  return (
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
  );
};

export default SelectWithSubtextField;
