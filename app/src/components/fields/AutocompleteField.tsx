import { CircularProgress } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import { SyntheticEvent } from 'react';

export interface IAutocompleteFieldOption<T extends string | number> {
  value: T;
  label: string;
}

export interface IAutocompleteField<T extends string | number> {
  id: string;
  label: string;
  name: string;
  options: IAutocompleteFieldOption<T>[];
  loading?: boolean;
  sx?: TextFieldProps['sx']; //https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/issues/271#issuecomment-1561891271
  required?: boolean;
  filterLimit?: number;
  optionFilter?: 'value' | 'label'; // used to filter existing/ set data for the AutocompleteField, defaults to value in getExistingValue function
  getOptionDisabled?: (option: IAutocompleteFieldOption<T>) => boolean;
  onChange?: (event: SyntheticEvent<Element, Event>, option: IAutocompleteFieldOption<T> | null) => void;
}

// To be used when you want an autocomplete field with no freesolo allowed but only one option can be selected

const AutocompleteField = <T extends string | number>(props: IAutocompleteField<T>) => {
  const { touched, errors, setFieldValue, values } = useFormikContext<IAutocompleteFieldOption<T>>();

  const getExistingValue = (existingValue: T): IAutocompleteFieldOption<T> => {
    const result = props.options.find((option) => existingValue === option[props.optionFilter ?? 'value']);
    if (!result) {
      return null as unknown as IAutocompleteFieldOption<T>;
    }

    return result;
  };

  const handleGetOptionSelected = (
    option: IAutocompleteFieldOption<T>,
    value: IAutocompleteFieldOption<T>
  ): boolean => {
    if (!option?.value || !value?.value) {
      return false;
    }

    return option.value === value.value;
  };

  return (
    <Autocomplete
      autoSelect
      clearOnBlur
      blurOnSelect
      handleHomeEndKeys
      id={props.id}
      data-testid={props.id}
      value={getExistingValue(get(values, props.name))}
      options={props.options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={handleGetOptionSelected}
      getOptionDisabled={props.getOptionDisabled}
      filterOptions={createFilterOptions({ limit: props.filterLimit })}
      sx={props.sx}
      loading={props.loading}
      onChange={(event, option) => {
        if (props.onChange) {
          props.onChange(event, option);
          return;
        }

        setFieldValue(props.name, option?.value);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          required={props.required}
          label={props.label}
          variant="outlined"
          fullWidth
          error={get(touched, props.name) && Boolean(get(errors, props.name))}
          helperText={get(touched, props.name) && get(errors, props.name)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {props.loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  );
};

export default AutocompleteField;
