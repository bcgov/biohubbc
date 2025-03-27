import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import TextField from '@mui/material/TextField';
import useIsMounted from 'hooks/useIsMounted';
import { debounce } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

export type WithIdAndName<T> = T & { id: string | number; name: string };

interface IAutocompleteSearchFieldProps<T> {
  /**
   * The name of the field.
   */
  fieldName: string;
  /**
   * The label to display for the input field.
   */
  label: string;
  /**
   * Callback fired when an option is selected from the drop-down.
   */
  onSelect: (selection: T) => void;
  /**
   * Callback fired when the clear button ('X' button) is clicked.
   */
  onClear?: () => void;
  /**
   * The API request to make when searching. Will receive the current autocomplete text input value.
   */
  onSearch: (inputValue: string) => Promise<any>;
  /**
   * The function to get the label to display for each option in the drop-down.
   */
  getOptionLabel: (option: T) => string;
  /**
   * Whether to execute the 'onSearch' callback once on component mount.
   *
   * Note: should not be used if 'initialOptions' is set, as it will override the initial options.
   */
  searchOnMount?: boolean;
  /**
   * The initial value of the input field, if any.
   */
  initialInputValue?: string;
  /**
   * The initial list of options to choose from, if any.
   */
  initialOptions?: T[];
  /**
   * The text to display when there are no options to choose from in the drop-down.
   */
  noOptionsText?: string;
  /**
   * Whether the field is required.
   */
  required?: boolean;
  /**
   * Whether the field is disabled.
   */
  disabled?: boolean;
  /**
   * Whether to clear the input field when an option is selected from the drop-down.
   */
  clearOnSelect?: boolean;
  /**
   * Whether to show the start adornment (magnifying glass icon) in the input field.
   */
  showStartAdornment?: boolean;
  /**
   * The placeholder text to display in the input field.
   */
  placeholder?: string;
  /**
   * The error message to display below the input field.
   */
  error?: string;
}

/**
 * Generic Autocomplete field for searching and selecting an item
 *
 * @param {IAutocompleteSearchFieldProps} props
 * @return {*}
 */
const AutocompleteSearchField = <T extends { id: string | number; name: string }>({
  fieldName,
  label,
  onSelect,
  onClear,
  onSearch,
  getOptionLabel,
  searchOnMount,
  initialInputValue,
  initialOptions,
  noOptionsText = 'No matching options',
  required,
  disabled,
  clearOnSelect,
  showStartAdornment,
  placeholder,
  error
}: IAutocompleteSearchFieldProps<T>) => {
  const isMounted = useIsMounted();

  // The input field value
  const [inputValue, setInputValue] = useState<string>(initialInputValue ?? '');
  // The array of options to choose from
  const [options, setOptions] = useState<T[]>(initialOptions ?? []);
  // Is control loading (search in progress)
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useMemo(
    () =>
      debounce(async (inputValue: string, callback: (searchedValues: T[]) => void) => {
        await onSearch(inputValue)
          .then((response) => {
            callback(response || []);
          })
          .catch(() => {
            callback([]);
          });
      }, 500),
    [onSearch]
  );

  useEffect(() => {
    if (!searchOnMount) {
      return;
    }

    if (isLoading || options.length > 0) {
      return;
    }

    handleSearch(inputValue, (newOptions) => {
      if (!isMounted()) {
        return;
      }

      setOptions(newOptions);
      setIsLoading(false);
    });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Autocomplete
      id={`${fieldName}-autocomplete`}
      disabled={disabled}
      noOptionsText={isLoading ? 'Loading...' : noOptionsText}
      options={options}
      value={null}
      getOptionLabel={getOptionLabel}
      inputValue={inputValue}
      onInputChange={(_, value, reason) => {
        if (reason === 'reset') {
          if (!clearOnSelect) {
            return;
          }

          if (inputValue === '' && options.length === 0) {
            // Nothing to clear
            return;
          }

          setInputValue('');
          onClear?.();

          return;
        }

        if (reason === 'clear') {
          if (inputValue === '' && options.length === 0) {
            // Nothing to clear
            return;
          }

          setInputValue('');
          onClear?.();
          return;
        }

        if (!value) {
          if (inputValue === '' && options.length === 0) {
            // Nothing to clear
            return;
          }

          setInputValue('');
          return;
        }

        setIsLoading(true);
        setInputValue(value);
        handleSearch(value, (newOptions) => {
          if (!isMounted()) {
            return;
          }

          setOptions(newOptions);
          setIsLoading(false);
        });
      }}
      onChange={(_, option) => {
        if (!option) {
          return;
        }

        onSelect(option);

        if (clearOnSelect) {
          setInputValue('');
          return;
        }

        setInputValue(option.name);
      }}
      renderOption={(renderProps, renderOption) => {
        return (
          <Box
            component="li"
            sx={{
              '& + li': {
                borderTop: '1px solid' + grey[300]
              }
            }}
            {...renderProps}
            key={renderProps.key}>
            <Box py={1} width={'100%'}>
              {getOptionLabel(renderOption)}
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          name={`${fieldName}-input`}
          required={required}
          label={label}
          variant="outlined"
          fullWidth
          placeholder={placeholder || 'Enter a search term'}
          InputProps={{
            ...params.InputProps,
            startAdornment: showStartAdornment && (
              <Box mx={1} mt="6px">
                <Icon path={mdiMagnify} size={1} />
              </Box>
            ),
            endAdornment: (
              <>
                {inputValue && isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
          error={Boolean(error)}
          helperText={error}
          data-testid={`${fieldName}-input`}
        />
      )}
      data-testid={`${fieldName}-autocomplete`}
    />
  );
};

export default AutocompleteSearchField;
