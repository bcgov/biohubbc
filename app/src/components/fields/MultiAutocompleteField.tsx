import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import CheckBox from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { useFormikContext } from 'formik';
import React from 'react';

export interface IMultiAutocompleteFieldOption {
  value: string | number;
  label: string;
}

export interface IMultiAutocompleteField {
  id: string;
  label: string;
  options: IMultiAutocompleteFieldOption[];
  required?: boolean;
  filterLimit?: number;
}

const MultiAutocompleteField: React.FC<IMultiAutocompleteField> = (props) => {
  const { values, touched, errors, setFieldValue } = useFormikContext<IMultiAutocompleteFieldOption>();

  const getExistingValue = (existingValues: any[]): IMultiAutocompleteFieldOption[] => {
    if (!existingValues) {
      return [];
    }

    return props.options.filter((option) => existingValues.includes(option.value));
  };

  const handleGetOptionSelected = (
    option: IMultiAutocompleteFieldOption,
    value: IMultiAutocompleteFieldOption
  ): boolean => {
    if (!option?.value || !value?.value) {
      return false;
    }

    return option.value === value.value;
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
          option.map((item) => item.value)
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
              value={option.value}
            />
            {option.label}
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

export default MultiAutocompleteField;
