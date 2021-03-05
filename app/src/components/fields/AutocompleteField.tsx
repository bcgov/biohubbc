import { Checkbox, TextField } from '@material-ui/core';
import { CheckBox, CheckBoxOutlineBlank } from '@material-ui/icons';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { useFormikContext } from 'formik';
import React from 'react';

// export interface IAutocompleteFieldOption {
//   label: string;
// }

export interface IAutocompleteField {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
  filterLimit?: number;
}

const AutocompleteField: React.FC<IAutocompleteField> = (props) => {
  const { values, touched, errors, setFieldValue } = useFormikContext<string>();
scrollTo
  const getExistingValue = (existingValues: any[]): string[] => {
    if (!existingValues) {
      return [];
    }

    return props.options.filter((option) => existingValues.includes(option));
  };

  const handleGetOptionSelected = (
    option: string,
    value: string
  ): boolean => {
    if (!option || !value) {
      return false;
    }

    return option === value;
  };

  return (
    <Autocomplete
      multiple
      autoHighlight={true}
      value={getExistingValue(values[props.id])}
      id={props.id}
      options={props.options}
      getOptionLabel={(option) => option}
      getOptionSelected={handleGetOptionSelected}
      filterOptions={createFilterOptions({ limit: props.filterLimit })}
      disableCloseOnSelect
      onChange={(event, option) => {
        setFieldValue(
          props.id,
          option.map((item) => item)
        );
      }}
      renderOption={(option, { selected }) => {
        const disabled: any = props.options && props.options?.indexOf(option) !== -1;
        return (
          <>
            <Checkbox
              icon={<CheckBoxOutlineBlank fontSize="small" />}
              checkedIcon={<CheckBox fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected}
              disabled={disabled}
              value={option}
            />
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
        />
      )}
    />
  );
};

export default AutocompleteField;
