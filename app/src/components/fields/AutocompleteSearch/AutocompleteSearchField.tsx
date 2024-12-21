import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import TextField from '@mui/material/TextField';
import useIsMounted from 'hooks/useIsMounted';
import { debounce } from 'lodash-es';
import { useMemo, useState } from 'react';

export type WithIdAndName<T> = T & { id: string | number; name: string };

export interface IAutocompleteSearchFieldProps<T> {
  fieldName: string;
  label: string;
  onSelect: (selection: T) => void;
  onClear?: () => void;
  /**
   * The API request to make when searching. Will receive the current autocomplete text input value.
   */
  onSearch: (inputValue: string) => Promise<any>;
  getOptionLabel: (option: T) => string;
  defaultSelection?: T;
  noOptionsText?: string;
  required?: boolean;
  disabled?: boolean;
  clearOnSelect?: boolean;
  showStartAdornment?: boolean;
  placeholder?: string;
  error?: string;
  /**
   * An arbritrary number that changes to force the options to refresh. Used to update the options when an item is unselected.
   */
  refreshKey?: number;
}

/**
 * Generic Autocomplete field for searching and selecting an item
 *
 * @param {IAutocompleteSearchFieldProps} props
 * @return {*}
 */
export const AutocompleteSearchField = <T extends { id: string | number; name: string }>({
  fieldName,
  label,
  onSelect,
  onClear,
  onSearch,
  getOptionLabel,
  defaultSelection,
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
  const [inputValue, setInputValue] = useState<string>(defaultSelection ? defaultSelection?.name : '');
  // The array of options to choose from
  const [options, setOptions] = useState<T[]>(defaultSelection ? [defaultSelection] : []);
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

        // Remove the selected item from the list of options
        setOptions((prev) => prev.filter((existing) => existing.id !== option.id));

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
