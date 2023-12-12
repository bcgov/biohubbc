import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import { ListItemText } from '@mui/material';
import Autocomplete, {
  AutocompleteChangeReason,
  AutocompleteInputChangeReason,
  createFilterOptions
} from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import { useEffect, useState } from 'react';

export interface IMultiAutocompleteFieldOption {
  value: string | number;
  label: string;
  subText?: string;
}

export interface IMultiAutocompleteField {
  id: string;
  label: string;
  options: IMultiAutocompleteFieldOption[];
  selectedOptions?: IMultiAutocompleteFieldOption[];
  required?: boolean;
  filterLimit?: number;
  chipVisible?: boolean;
  onChange?: (
    _event: React.ChangeEvent<any>,
    selectedOptions: IMultiAutocompleteFieldOption[],
    reason: AutocompleteChangeReason
  ) => void;
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
  const { values, touched, errors, setFieldValue } = useFormikContext<IMultiAutocompleteFieldOption>();

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

  const defaultHandleOnChange = (_event: React.ChangeEvent<any>, selectedOptions: IMultiAutocompleteFieldOption[]) => {
    setOptions(sortAutocompleteOptions(selectedOptions, options));
    setSelectedOptions(selectedOptions);
    setFieldValue(
      props.id,
      selectedOptions.map((item) => item.value)
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

  const getExistingValue = (existingValues?: (number | string)[]): IMultiAutocompleteFieldOption[] => {
    if (existingValues) {
      return options.filter((option) => existingValues.includes(option.value));
    }
    return [];
  };

  return (
    <Autocomplete
      multiple
      noOptionsText="No matching options"
      autoHighlight={true}
      value={getExistingValue(get(values, props.id))}
      id={props.id}
      data-testid={props.id}
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={handleGetOptionSelected}
      disableCloseOnSelect
      disableListWrap
      inputValue={inputValue}
      onInputChange={handleOnInputChange}
      onChange={props.onChange ? props.onChange : defaultHandleOnChange}
      filterOptions={createFilterOptions({ limit: props.filterLimit })}
      renderOption={(renderProps, renderOption, { selected }) => {
        return (
          <Box component="li" {...renderProps}>
            <Checkbox
              icon={<CheckBoxOutlineBlank fontSize="small" />}
              checkedIcon={<CheckBox fontSize="small" />}
              checked={selected}
              disabled={props.options.includes(renderOption) || false}
              value={renderOption.value}
              color="default"
            />
            <ListItemText primary={renderOption.label} secondary={renderOption.subText} />
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          onKeyDown={(event: any) => {
            if (event.key === 'Backspace') {
              event.stopPropagation();
            }
          }}
          {...params}
          name={props.id}
          required={props.required}
          label={props.label}
          variant="outlined"
          fullWidth
          placeholder="Type to start searching"
          error={get(touched, props.id) && Boolean(get(errors, props.id))}
          helperText={get(touched, props.id) && get(errors, props.id)}
        />
      )}
      renderTags={(tagValue, getTagProps) => {
        if (props.chipVisible === false) {
          return;
        }

        return tagValue.map((option, index) => <Chip label={option.label} {...getTagProps({ index })} />);
      }}
    />
  );
};

export default MultiAutocompleteField;
