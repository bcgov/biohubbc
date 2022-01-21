import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { useFormikContext } from 'formik';
import { get } from 'lodash-es';
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
  const { touched, errors, setFieldValue, values } = useFormikContext<any>();

  const { id, label, name, options, required, filterLimit } = props;

  return (
    <Autocomplete
      freeSolo
      autoSelect
      includeInputInList
      clearOnBlur
      blurOnSelect
      handleHomeEndKeys
      id={id}
      data-testid={id}
      value={get(values, name)}
      options={options}
      getOptionLabel={(option) => option}
      filterOptions={createFilterOptions({ limit: filterLimit })}
      onChange={(event, option) => {
        setFieldValue(name, option);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          required={required}
          label={label}
          variant="outlined"
          fullWidth
          error={get(touched, name) && Boolean(get(errors, name))}
          helperText={get(touched, name) && get(errors, name)}
        />
      )}
    />
  );
};

export default AutocompleteFreeSoloField;
