import { MenuItem, TextField } from '@material-ui/core';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { useFormikContext } from 'formik';
import React from 'react';

// export interface IAutocompleteFieldOption {
//   label: string;
// }

export interface IAutocompleteField {
  id: string;
  label: string;
  name: string;
  value: string;
  options: string[];
  required?: boolean;
  filterLimit?: number;
}

const AutocompleteField: React.FC<IAutocompleteField> = (props) => {
  const { touched, errors, setFieldValue } = useFormikContext<string>();

  const handleGetOptionSelected = (option: string, value: string): boolean => {
    if (!option || !value) {
      return false;
    }

    return option === value;
  };

  return (
    <Autocomplete
      freeSolo
      includeInputInList
      clearOnBlur
      blurOnSelect
      handleHomeEndKeys
      id={props.id}
      value={props.value}
      options={props.options}
      getOptionLabel={(option) => option}
      getOptionSelected={handleGetOptionSelected}
      filterOptions={createFilterOptions({ limit: props.filterLimit })}
      onChange={(event, option) => {
        setFieldValue(props.id, option);
      }}
      renderOption={(option, { selected }) => {
        return (
          <>
            <MenuItem style={{ marginRight: 8 }} value={option} selected={selected} />
            {option}
          </>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          required={props.required}
          label={props.label}
          variant="outlined"
          fullWidth
          error={touched[props.id] && Boolean(errors[props.id])}
          helperText={errors[props.id]}
          placeholder={'Begin typing to filter results...'}
          InputLabelProps={{
            shrink: true
          }}
          onChange={(event) => {
            setFieldValue(props.id, event.target.value);
          }}
        />
      )}
    />
  );
};

export default AutocompleteField;
