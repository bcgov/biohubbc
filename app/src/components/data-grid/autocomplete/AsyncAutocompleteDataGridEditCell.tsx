import { Paper } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import TextField from '@mui/material/TextField';
import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import {
  IAutocompleteDataGridOption,
  IAutocompleteDataGridTaxonomyOption
} from 'components/data-grid/autocomplete/AutocompleteDataGrid.interface';
import SpeciesCard from 'components/species/components/SpeciesCard';
import { DebouncedFunc } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';

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
  getCurrentOption: (value: ValueType) => Promise<IAutocompleteDataGridTaxonomyOption<ValueType> | null>;
  /**
   * Search function that returns an array of options to choose from.
   *
   * @memberof IAsyncAutocompleteDataGridEditCell
   */
  getOptions: DebouncedFunc<
    (
      searchTerm: string,
      onSearchResults: (searchResults: IAutocompleteDataGridTaxonomyOption<ValueType>[]) => void
    ) => Promise<void>
  >;
  /**
   * Indicates if there is an error with the control
   *
   * @memberof IAsyncAutocompleteDataGridEditCell
   */
  error?: boolean;
  /**
   * Optional function to render the autocomplete option.
   */
  renderOption?: (option: IAutocompleteDataGridOption<ValueType>) => JSX.Element;
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

  const ref = useRef<HTMLInputElement>();

  useEnhancedEffect(() => {
    if (dataGridProps.hasFocus) {
      ref.current?.focus();
    }
  }, [dataGridProps]);

  // The current data grid value
  const dataGridValue = dataGridProps.value;
  // The input field value
  const [inputValue, setInputValue] = useState<IAutocompleteDataGridTaxonomyOption<ValueType>['label']>('');
  // The currently selected option
  const [currentOption, setCurrentOption] = useState<IAutocompleteDataGridTaxonomyOption<ValueType> | null>(null);
  // The array of options to choose from
  const [options, setOptions] = useState<IAutocompleteDataGridTaxonomyOption<ValueType>[]>([]);
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

  return (
    <Autocomplete
      id={`${dataGridProps.id}[${dataGridProps.field}]`}
      noOptionsText="No matching options"
      autoHighlight
      fullWidth
      blurOnSelect
      handleHomeEndKeys
      loading={isLoading}
      value={currentOption}
      options={options}
      PaperComponent={({ children }) => <Paper sx={{ minWidth: '600px' }}>{children}</Paper>}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => {
        if (!option?.value || !value?.value) {
          return false;
        }
        return option.value === value.value;
      }}
      filterOptions={(item) => item}
      onChange={(_, selectedOption) => {
        setOptions(selectedOption ? [selectedOption, ...options] : options);
        setCurrentOption(selectedOption);

        // Set the data grid cell value with selected options value
        dataGridProps.api.setEditCellValue({
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
          inputRef={ref}
          size="small"
          variant="outlined"
          fullWidth
          error={props.error}
          InputProps={{
            color: props.error ? 'error' : undefined,
            ...params.InputProps,
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
          <Box
            component="li"
            sx={{
              '& + li': {
                borderTop: '1px solid' + grey[300]
              }
            }}
            key={`${renderOption.tsn}-${renderOption.label}`}
            {...renderProps}>
            <Box py={1} width="100%">
              <SpeciesCard taxon={renderOption} />
            </Box>
          </Box>
        );
      }}
      data-testid={dataGridProps.id}
    />
  );
};

export default AsyncAutocompleteDataGridEditCell;
