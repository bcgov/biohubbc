import { Paper } from '@mui/material';
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import { GridRenderEditCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { IAutocompleteDataGridOption } from 'components/data-grid/autocomplete/AutocompleteDataGrid.interface';
import { DebouncedFunc } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';

export interface IAsyncAutocompleteDataGridEditCell<
  DataGridType extends GridValidRowModel,
  AutocompleteOptionType extends IAutocompleteDataGridOption<ValueType>,
  ValueType extends string | number
> {
  /**
   * Data grid props for the cell.
   *
   * @type {GridRenderEditCellParams<DataGridType>}
   * @memberof IAsyncAutocompleteDataGridEditCell
   */
  dataGridProps: GridRenderEditCellParams<DataGridType>;
  /**
   * Function that returns a single option. Used to translate an existing value to its matching option.
   *
   * @memberof IAsyncAutocompleteDataGridEditCell
   */
  getCurrentOption: (value: ValueType) => Promise<AutocompleteOptionType | null>;
  /**
   * Initial options to display in the autocomplete, before the user types anything.
   *
   * @memberof IAsyncAutocompleteDataGridEditCell
   */
  getInitialOptions?: () => AutocompleteOptionType[];
  /**
   * Search function that returns an array of options to choose from.
   *
   * @memberof IAsyncAutocompleteDataGridEditCell
   */
  getOptions: DebouncedFunc<
    (
      searchTerm: string,
      onSearchResults: (searchResults: AutocompleteOptionType[]) => void,
      onComplete: () => void
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
  renderOption?: AutocompleteProps<AutocompleteOptionType, false, false, false>['renderOption'];
  /**
   * Optional callback fired when an option is selected.
   */
  onSelectOption?: (selectedOption: AutocompleteOptionType | null) => void;
  /**
   * Placeholder text for the input field.
   *
   * @type {string}
   * @memberof IAsyncAutocompleteDataGridEditCell
   */
  placeholder?: string;
}

/**
 * Data grid single value asynchronous autocomplete component for edit.
 *
 * @template DataGridType
 * @template AutocompleteOptionType
 * @template ValueType
 * @param {IAsyncAutocompleteDataGridEditCell<DataGridType, AutocompleteOptionType, ValueType>} props
 * @return {*}
 */
const AsyncAutocompleteDataGridEditCell = <
  DataGridType extends GridValidRowModel,
  AutocompleteOptionType extends IAutocompleteDataGridOption<ValueType>,
  ValueType extends string | number
>(
  props: IAsyncAutocompleteDataGridEditCell<DataGridType, AutocompleteOptionType, ValueType>
) => {
  const {
    dataGridProps,
    getCurrentOption,
    getOptions,
    getInitialOptions,
    error,
    renderOption,
    onSelectOption,
    placeholder
  } = props;

  const ref = useRef<HTMLInputElement>();

  useEnhancedEffect(() => {
    if (dataGridProps.hasFocus) {
      ref.current?.focus();
    }
  }, [dataGridProps]);

  // The current data grid value
  const dataGridValue = dataGridProps.value;
  // The input field value
  const [inputValue, setInputValue] = useState<AutocompleteOptionType['label']>('');
  // The currently selected option
  const [currentOption, setCurrentOption] = useState<AutocompleteOptionType | null>(null);
  // Reference to disable search (used when selecting an option to prevent a redundant search)
  const isSearchDisabled = useRef(false);
  const isSearchInProgress = useRef(false);
  // The array of options to choose from
  const [options, setOptions] = useState<AutocompleteOptionType[]>(getInitialOptions?.() ?? []);
  // Is control loading (search in progress)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (isSearchDisabled.current) {
      // Search is disabled temporarily: the user has selectd an option, and because we update the input to match the
      // selection, the search would normally be triggered. We disable the search temporarily to prevent a redundant
      // search from being executed. The search will be re-enabled when the user interacts with the input field by
      // either clearing the input or typing a new search term.
      return;
    }

    if (!dataGridValue) {
      // No current value tracked by the datagrid state, unset any existing value tracked by this component
      setCurrentOption(null);
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

    if (isSearchDisabled.current) {
      // Search is disabled
      return;
    }

    if (inputValue === '') {
      // No search term, do not initiate search, cancel any existing search
      setOptions([]);
      setIsLoading(false);
      isSearchInProgress.current = false;
      return;
    }

    if (isSearchInProgress.current) {
      return;
    }

    isSearchInProgress.current = true;
    setIsLoading(true);

    // Call async search function
    getOptions(
      inputValue,
      (searchResults) => {
        if (!mounted) {
          return;
        }

        setOptions([...searchResults]);
        isSearchInProgress.current = false;
        setIsLoading(false);
      },
      () => {
        if (!mounted) {
          return;
        }

        isSearchInProgress.current = false;
        setIsLoading(false);
      }
    );

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
        // Disable search when selecting an option, to prevent a redundant search when the input field is updated
        // with the user's selection
        isSearchDisabled.current = true;

        setCurrentOption(selectedOption);
        onSelectOption?.(selectedOption);
        setIsLoading(false);
        isSearchInProgress.current = false;

        // Set the data grid cell value with selected options value
        dataGridProps.api.setEditCellValue({
          id: dataGridProps.id,
          field: dataGridProps.field,
          value: selectedOption?.value
        });
      }}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === 'clear' || reason === 'input') {
          // Enable search when the user interacts with the input field
          // A 'reset' event is created when the user selects an option, which should not trigger a search
          isSearchDisabled.current = false;
          isSearchInProgress.current = false;
        }

        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={ref}
          size="small"
          variant="outlined"
          fullWidth
          error={error}
          placeholder={placeholder}
          InputProps={{
            color: error ? 'error' : undefined,
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
      renderOption={
        renderOption ??
        ((renderProps, renderOption) => {
          return (
            <Box component="li" {...renderProps} key={renderProps.key}>
              <ListItemText primary={renderOption.label} secondary={renderOption.subtext} />
            </Box>
          );
        })
      }
      data-testid={dataGridProps.id}
    />
  );
};

export default AsyncAutocompleteDataGridEditCell;
