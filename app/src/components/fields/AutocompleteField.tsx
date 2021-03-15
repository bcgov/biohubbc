import { TextField } from '@material-ui/core';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { useFormikContext } from 'formik';
import React from 'react';

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

  return (
    <Autocomplete
      freeSolo
      autoSelect
      includeInputInList
      clearOnBlur
      blurOnSelect
      handleHomeEndKeys
      id={props.id}
      data-testid={props.id}
      value={props.value}
      options={props.options}
      getOptionLabel={(option) => option}
      filterOptions={createFilterOptions({ limit: props.filterLimit })}
      onChange={(event, option) => {
        setFieldValue(props.id, option);
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
        />
      )}
    />
  );
};

export default AutocompleteField;
