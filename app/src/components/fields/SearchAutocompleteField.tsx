import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import { Autocomplete, Box, CircularProgress, TextField } from '@mui/material';
import { DebouncedFunc } from 'lodash-es';

interface ISearchAutocompleteFieldProps<T> {
  id: string;
  displayNameKey: keyof T;
  placeholderText: string;
  searchOptions: T[];
  selectedOptions: T[];
  handleSearch: DebouncedFunc<(inputValue: string, existingValues: T[]) => Promise<void>>;
  isSearching: boolean;
  handleOnChange: (arg0: T) => void;
  renderSearch: (arg0: any) => JSX.Element;
}

const SearchAutocompleteField = <T,>(props: ISearchAutocompleteFieldProps<T>) => {
  const {
    id,
    placeholderText,
    isSearching,
    displayNameKey,
    searchOptions,
    selectedOptions,
    handleSearch,
    handleOnChange,
    renderSearch
  } = props;

  return (
    <Autocomplete
      clearOnBlur
      handleHomeEndKeys
      multiple
      renderTags={() => null}
      id={id}
      options={searchOptions}
      filterSelectedOptions
      filterOptions={(options) => options} // https://mui.com/material-ui/react-autocomplete/#search-as-you-type
      isOptionEqualToValue={(option, value) => option[displayNameKey] === value[displayNameKey]}
      getOptionLabel={(option) => String(option[displayNameKey] || '')}
      onInputChange={(_, value) => {
        handleSearch(value, selectedOptions);
      }}
      onChange={(_, option) => {
        const newItem = option.pop();
        if (newItem) {
          handleOnChange(newItem);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder={placeholderText}
          fullWidth
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <Box mx={1} mt={'6px'}>
                <Icon path={mdiMagnify} size={1} />
              </Box>
            ),
            endAdornment: (
              <>
                {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderOption={(renderProps, renderOption) => {
        return (
          <Box component="li" {...renderProps}>
            {renderSearch(renderOption)}
          </Box>
        );
      }}
    />
  );
};

export default SearchAutocompleteField;
