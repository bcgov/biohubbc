import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import { Chip } from '@mui/material';
import Autocomplete, { AutocompleteInputChangeReason, createFilterOptions } from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import { useFormikContext } from 'formik';
import { useEffect, useState } from 'react';

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
  chipVisible?: boolean;
  handleSearchResults?: (input: string) => Promise<void>;
}

/**
 * Sorts a set of autocomplete options so that selected options become prepended to the start
 * of the options list. Because the Autocomplete component uses both the list of selected values
 * and the list of options in order to display selected autocomplete values, prepending selected
 * options to the start of the list ensures that they will be included when the selected options
 * are rendered.
 * @param selectedOptions The list of options that are selected by an Autocomplete.
 * @param remainingOptions The total list of options that are selectable by an Autocomplete.
 * @returns The total list of options selectable by an Autocomplete, with the selected options
 * prepended to the start of the list, without duplicates.
 */
export const sortAutocompleteOptions = (
  selectedOptions: IMultiAutocompleteFieldOption[],
  remainingOptions: IMultiAutocompleteFieldOption[]
) => {
  const selectedValues = selectedOptions.map((item) => item.value);

  return [...selectedOptions, ...remainingOptions.filter((item) => !selectedValues.includes(item.value))];
};

const MultiAutocompleteField: React.FC<IMultiAutocompleteField> = (props) => {
  const { getFieldMeta, setFieldValue } = useFormikContext();
  const { value, touched, error } = getFieldMeta<IMultiAutocompleteFieldOption[]>(props.id);

  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<IMultiAutocompleteFieldOption[]>(props.options || []); // store options if provided
  const [selectedOptions, setSelectedOptions] = useState<IMultiAutocompleteFieldOption[]>([]);

  useEffect(() => {
    setOptions(sortAutocompleteOptions(selectedOptions, props.options));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.options]);

  useEffect(() => {
    if (props.handleSearchResults) {
      props.handleSearchResults(inputValue);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const handleOnChange = (_event: React.ChangeEvent<any>, selectedOptions: IMultiAutocompleteFieldOption[]) => {
    setOptions(sortAutocompleteOptions(selectedOptions, options));
    setSelectedOptions(selectedOptions);
    setFieldValue(
      props.id,
      selectedOptions.map((item) => item)
    );
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

  const handleOnInputChange = (event: React.ChangeEvent<any>, value: string, reason: AutocompleteInputChangeReason) => {
    if (event && event.type === 'blur') {
      setInputValue('');
    } else if (reason !== 'reset') {
      setInputValue(value);
    }
  };

  const defaultChipDisplay = (option: any, renderProps: any, checkedStatus: any) => {
    return (
      <li key={option.value} {...renderProps}>
        <Checkbox
          icon={<CheckBoxOutlineBlank fontSize="small" />}
          checkedIcon={<CheckBox fontSize="small" color="primary" />}
          style={{ marginRight: 8 }}
          checked={checkedStatus}
          disabled={(options && options?.indexOf(option) !== -1) || false}
          value={option.value}
          color="default"
        />
        {option.label}
      </li>
    );
  };

  const existingValues: IMultiAutocompleteFieldOption[] =
    value && value.length > 0 ? options.filter((option) => value.includes(option)) : [];

  return (
    <Autocomplete
      multiple
      autoHighlight={true}
      value={existingValues}
      id={props.id}
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={handleGetOptionSelected}
      filterOptions={createFilterOptions({ limit: props.filterLimit })}
      disableCloseOnSelect
      onChange={handleOnChange}
      inputValue={inputValue}
      onInputChange={handleOnInputChange}
      renderTags={(tagValue, getTagProps) => {
        if (props.chipVisible) {
          return tagValue.map((option, index) => <Chip label={option.label} {...getTagProps({ index })} />);
        }
      }}
      renderOption={(_renderProps, option, { selected }) => defaultChipDisplay(option, _renderProps, selected)}
      renderInput={(params) => (
        <TextField
          onKeyDown={(event: any) => {
            if (event.key === 'Backspace') {
              event.stopPropagation();
            }
          }}
          {...params}
          required={props.required}
          label={props.label}
          variant="outlined"
          fullWidth
          error={touched && Boolean(error)}
          helperText={touched && error}
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
