import { mdiClose, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import { Autocomplete, createFilterOptions, FilterOptionsState } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';

export interface IAutocompleteWithListProps<T> {
  options: T[];
  selectedItems: T[];
  handleSelect: (item: T) => void;
  handleRemove: (item: T) => void;
  getOptionLabel: (option: T) => string;
  renderOptionDetails?: (option: T) => JSX.Element;
  placeholder?: string;
  noOptionsText?: string;
}

export const AutocompleteWithList = <T extends IAutocompleteFieldOption<string | number>>({
  options,
  selectedItems,
  handleSelect,
  handleRemove,
  getOptionLabel,
  renderOptionDetails,
  placeholder = 'Search...',
  noOptionsText = 'No records found'
}: IAutocompleteWithListProps<T>) => {
  const [searchText, setSearchText] = useState('');

  const filterOptions = (options: T[], state: FilterOptionsState<T>) => {
    const searchFilter = createFilterOptions<T>({ ignoreCase: true });
    const unselectedOptions = options.filter((option) => !selectedItems.some((item) => item.value === option.value));
    return searchFilter(unselectedOptions, state);
  };

  return (
    <>
      <Autocomplete
        filterSelectedOptions
        noOptionsText={noOptionsText}
        options={options}
        filterOptions={filterOptions}
        getOptionLabel={getOptionLabel}
        inputValue={searchText}
        value={null}
        onInputChange={(_, value, reason) => {
          if (reason === 'reset') {
            setSearchText('');
          } else {
            setSearchText(value);
          }
        }}
        onChange={(_, option) => {
          console.log(option, 'OPTION')
          if (option) {
            handleSelect(option);
            setSearchText('');
          }
        }}
        onClose={() => setSearchText('')}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={placeholder}
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <Box mx={1} mt="6px">
                  <Icon path={mdiMagnify} size={1} />
                </Box>
              )
            }}
          />
        )}
        renderOption={(renderProps, option) => (
          <Box component="li" {...renderProps} key={option.value}>
            {renderOptionDetails ? renderOptionDetails(option) : getOptionLabel(option)}
          </Box>
        )}
      />
      <TransitionGroup>
        {selectedItems.map((item) => (
          <Collapse key={item.value}>
            <Card
              variant="outlined"
              sx={{
                background: grey[100],
                '& .MuiCardHeader-subheader': {
                  display: '-webkit-box',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                  maxWidth: '92ch',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '14px'
                },
                mt: 1,
                '& .MuiCardHeader-title': {
                  mb: 0.5
                }
              }}>
              <CardHeader
                action={
                  <IconButton onClick={() => handleRemove(item)} aria-label="remove">
                    <Icon path={mdiClose} size={1} />
                  </IconButton>
                }
                title={getOptionLabel(item)}
              />
            </Card>
          </Collapse>
        ))}
      </TransitionGroup>
    </>
  );
};
