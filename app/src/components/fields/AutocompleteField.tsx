import { TextField, MenuItem } from '@material-ui/core';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { useFormikContext } from 'formik';
import React from 'react';

export interface IAutocompleteFieldOption {
  label: string;
}

export interface IAutocompleteField {
  id: string;
  name: string;
  label: string;
  variant: string;
  options: IAutocompleteFieldOption[];
  required?: boolean;
  filterLimit?: number;
}

const AutocompleteField: React.FC<IAutocompleteField> = (props) => {
  const { values, touched, errors, setFieldValue } = useFormikContext<IAutocompleteFieldOption>();

  const getExistingValue = (existingValues: any[]): IAutocompleteFieldOption[] => {
    if (!existingValues) {
      return [];
    }

    return props.options.filter((option) => existingValues.includes(option.label));
  };

  const handleGetOptionSelected = (option: IAutocompleteFieldOption, value: IAutocompleteFieldOption): boolean => {
    if (!option?.label || !value?.label) {
      return false;
    }

    return option.label === value.label;
  };

  return (
    <Autocomplete
      multiple
      autoHighlight={true}
      value={getExistingValue(values[props.id])}
      id={props.id}
      options={props.options}
      getOptionLabel={(option) => option.label}
      getOptionSelected={handleGetOptionSelected}
      filterOptions={createFilterOptions({ limit: props.filterLimit })}
      disableCloseOnSelect
      onChange={(event, option) => {
        setFieldValue(
          props.id,
          option.map((item) => item.label)
        );
      }}
      renderOption={(option, { selected }) => {
        //const disabled: any = props.options && props.options?.indexOf(option) !== -1;
        return <MenuItem value={option.label}>{option.label}</MenuItem>;
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
        />
      )}
    />
  );
};

export default AutocompleteField;
