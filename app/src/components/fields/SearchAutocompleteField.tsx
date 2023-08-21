import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, Box, CircularProgress, TextField } from '@mui/material';
import { DebouncedFunc } from 'lodash-es';
import React from 'react';

interface ISearchAutocompleteFieldProps<T> {
  id: string;
  displayNameKey: string;
  placeholderText: string;
  searchOptions: T[];
  selectedOptions: T[];
  handleSearch: DebouncedFunc<(inputValue: string, existingValues: T[]) => Promise<void>>;
  isSearching: boolean;
  handleOnChange: (arg0: T) => void;
  renderSearch: (arg0: any) => JSX.Element;
}

const SearchAutocompleteField: React.FC<ISearchAutocompleteFieldProps<any>> = (props) => {
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
      id={id}
      options={searchOptions}
      getOptionLabel={(option) => option[displayNameKey] || ''}
      onInputChange={(_, value) => {
        handleSearch(value, selectedOptions);
      }}
      onChange={(_, option) => {
        if (option) {
          handleOnChange(option);
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
            startAdornment: <SearchIcon />,
            endAdornment: (
              <>
                {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderOption={(renderProps, renderOption, { selected }) => {
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
