import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { GridRenderCellParams, GridValidRowModel, useGridApiContext } from '@mui/x-data-grid';
import { IAutocompleteDataGridOption } from 'components/data-grid/autocomplete/AutocompleteDataGrid.interface';
import { DebouncedFunc } from 'lodash-es';
import { useEffect, useState } from 'react';

export interface IAsyncAutocompleteDataGridEditCell<
  DataGridType extends GridValidRowModel,
  ValueType extends string | number
> {
  /**
   * Data grid props for the cell.
   *
   * @type {GridRenderCellParams<DataGridType>}
   * @memberof IAsyncAutocompleteDataGridEditCell
   */
  dataGridProps: GridRenderCellParams<DataGridType>;
  /**
   * Function that returns a single option. Used to translate an existing value to its matching option.
   *
   * @memberof IAsyncAutocompleteDataGridEditCell
   */
  getCurrentOption: (value: ValueType) => Promise<IAutocompleteDataGridOption<ValueType> | null>;
  /**
   * Search function that returns an array of options to choose from.
   *
   * @memberof IAsyncAutocompleteDataGridEditCell
   */
  getOptions: DebouncedFunc<
    (
      searchTerm: string,
      onSearchResults: (searchResults: IAutocompleteDataGridOption<ValueType>[]) => void
    ) => Promise<void>
  >;
}

/**
 * Data grid single value asynchronous autocomplete component for edit.
 *
 * @template DataGridType
 * @template ValueType
 * @param {IAsyncAutocompleteDataGridEditCell<DataGridType, ValueType>} props
 * @return {*}
 */
const AsyncAutocompleteDataGridEditCell = <DataGridType extends GridValidRowModel, ValueType extends string | number>(
  props: IAsyncAutocompleteDataGridEditCell<DataGridType, ValueType>
) => {
  const { dataGridProps, getCurrentOption, getOptions } = props;

  const apiRef = useGridApiContext();

  // The current data grid value
  const dataGridValue = dataGridProps.value;
  // The input field value
  const [inputValue, setInputValue] = useState<IAutocompleteDataGridOption<ValueType>['label']>('');
  // The currently selected option
  const [currentOption, setCurrentOption] = useState<IAutocompleteDataGridOption<ValueType> | null>(null);
  // The array of options to choose from
  const [options, setOptions] = useState<IAutocompleteDataGridOption<ValueType>[]>([]);
  // Is control loading (search in progress)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!dataGridValue) {
      // No current value
      return;
    }

    if (dataGridValue === currentOption?.value) {
      // Existing value matches tracked value
      return;
    }

    const fetchCurrentOption = async () => {
      // Fetch a single option for the current value
      const response = await getCurrentOption(dataGridValue);

      if (!mounted) {
        return;
      }

      if (!response) {
        return;
      }

      setCurrentOption(response);
    };

    fetchCurrentOption();

    return () => {
      mounted = false;
    };
  }, [dataGridValue, currentOption?.value, getCurrentOption]);

  useEffect(() => {
    let mounted = true;

    if (inputValue === '') {
      // No input value, nothing to search with
      setOptions(currentOption ? [currentOption] : []);
      return;
    }

    // Call async search function
    setIsLoading(true);
    getOptions(inputValue, (searchResults) => {
      if (!mounted) {
        return;
      }

      setOptions([...searchResults]);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [inputValue, getOptions, currentOption]);

  function getCurrentValue() {
    if (!dataGridValue) {
      // No current value
      return null;
    }

    return currentOption || options.find((option) => dataGridValue === option.value) || null;
  }

  return (
    <Autocomplete
      id={String(dataGridProps.id)}
      noOptionsText="No matching options"
      autoHighlight
      fullWidth
      blurOnSelect
      handleHomeEndKeys
      loading={isLoading}
      value={getCurrentValue()}
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => {
        if (!option?.value || !value?.value) {
          return false;
        }
        return option.value === value.value;
      }}
      filterOptions={createFilterOptions({ limit: 50 })}
      onChange={(_, selectedOption) => {
        setOptions(selectedOption ? [selectedOption, ...options] : options);
        setCurrentOption(selectedOption);

        // Set the data grid cell value with selected options value
        apiRef.current.setEditCellValue({
          id: dataGridProps.id,
          field: dataGridProps.field,
          value: selectedOption?.value
        });
      }}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder={'Type to search...'}
          fullWidth
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <Box mt="6px">
                <Icon path={mdiMagnify} size={1}></Icon>
              </Box>
            ),
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderOption={(renderProps, renderOption) => {
        return (
          <Box component="li" {...renderProps}>
            {renderOption.label}
          </Box>
        );
      }}
      data-testid={dataGridProps.id}
    />
  );
};

export default AsyncAutocompleteDataGridEditCell;
