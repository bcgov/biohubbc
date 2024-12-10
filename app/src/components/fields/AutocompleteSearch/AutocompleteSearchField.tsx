import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { debounce } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

export type WithIdAndName<T> = T & { id: string | number; name: string };

export interface IAutocompleteSearchFieldProps<T> {
  formikFieldName: string;
  label: string;
  handleSelect: (selection: T) => void;
  handleClear?: () => void;
  /**
   * The API request to make when searching
   *
   * @param {any} params
   * @returns {Promise<Any>}
   */
  searchApi: (params: any) => Promise<any>;
  getOptionLabel: (option: T) => string;
  defaultSelection?: T;
  filters?: any;
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
  formikFieldName,
  label,
  handleSelect,
  handleClear,
  searchApi,
  getOptionLabel,
  defaultSelection,
  filters,
  noOptionsText = 'No matching options',
  required,
  disabled,
  clearOnSelect,
  showStartAdornment,
  placeholder,
  error,
  refreshKey
}: IAutocompleteSearchFieldProps<T>) => {
  const [inputValue, setInputValue] = useState<string>(defaultSelection?.name || '');
  const [options, setOptions] = useState<T[]>(defaultSelection ? [defaultSelection] : []);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useMemo(
    () =>
      debounce(async (inputValue: string, callback: (searchedValues: T[]) => void) => {
        setIsLoading(true);
        try {
          const response = await searchApi({ keyword: inputValue, ...filters });
          callback(response || []);
        } catch (error) {
          callback([]);
        } finally {
          setIsLoading(false);
        }
      }, 500),
    [searchApi, filters]
  );

  // Immediate request when the component mounts to prevent users from waiting. Can remove if performance becomes an issue.
  useEffect(() => {
    handleSearch('', (newOptions) => {
      setOptions(newOptions);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <Autocomplete
      id={formikFieldName}
      disabled={disabled}
      data-testid={formikFieldName}
      noOptionsText={isLoading ? 'Loading...' : noOptionsText}
      options={options}
      value={null}
      getOptionLabel={getOptionLabel}
      inputValue={inputValue}
      onInputChange={(_, value, reason) => {
        if (reason === 'reset' || reason === 'clear') {
          if (!clearOnSelect) {
            return;
          }
          setInputValue('');
          handleClear?.();
          return;
        }

        if (!value) {
          setInputValue('');
          return;
        }

        setInputValue(value);
        handleSearch(value, (newOptions) => {
          setOptions(newOptions);
        });
      }}
      onChange={(_, option) => {
        if (!option) {
          return;
        }

        handleSelect(option);

        // Remove the selected item from the list of options
        setOptions((prev) => prev.filter((existing) => existing.id !== option.id));

        if (clearOnSelect) {
          setInputValue('');
        } else {
          setInputValue(option.name);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          name={formikFieldName}
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
        />
      )}
    />
  );
};

export default AutocompleteSearchField;
