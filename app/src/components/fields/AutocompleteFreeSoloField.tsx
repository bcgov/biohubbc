import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { useFormikContext } from 'formik';
import React from 'react';

export interface IAutocompleteFreeSoloField {
  id: string;
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  filterLimit?: number;
}

const AutocompleteFreeSoloField: React.FC<IAutocompleteFreeSoloField> = (props) => {
  const { touched, errors, setFieldValue, values } = useFormikContext<string>();

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
      value={values[props.name]}
      options={props.options}
      getOptionLabel={(option) => option}
      filterOptions={createFilterOptions({ limit: props.filterLimit })}
      onChange={(event, option) => {
        setFieldValue(props.name, option);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          required={props.required}
          label={props.label}
          variant="outlined"
          fullWidth
          error={touched[props.name] && Boolean(errors[props.name])}
          helperText={touched[props.name] && errors[props.name]}
        />
      )}
    />
  );
};

export default AutocompleteFreeSoloField;
