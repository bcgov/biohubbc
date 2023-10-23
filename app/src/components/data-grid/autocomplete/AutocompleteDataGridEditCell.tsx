import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { GridRenderCellParams, GridValidRowModel, useGridApiContext } from '@mui/x-data-grid';
import { IAutocompleteDataGridOption } from 'components/data-grid/autocomplete/AutocompleteDataGrid.interface';

export interface IAutocompleteDataGridEditCellProps<
  DataGridType extends GridValidRowModel,
  ValueType extends string | number
> {
  /**
   * Data grid props for the cell.
   *
   * @type {GridRenderCellParams<DataGridType>}
   * @memberof IAutocompleteDataGridEditCellProps
   */
  dataGridProps: GridRenderCellParams<DataGridType>;
  /**
   * The array of options to choose from.
   *
   * @type {IAutocompleteDataGridOption<ValueType>[]}
   * @memberof IAutocompleteDataGridEditCellProps
   */
  options: IAutocompleteDataGridOption<ValueType>[];
  /**
   * Function that receives an option, and returns a boolean indicating if that option should be disabled or not.
   *
   * @memberof IAutocompleteDataGridEditCellProps
   */
  getOptionDisabled?: (option: IAutocompleteDataGridOption<ValueType>) => boolean;
}

/**
 * Data grid single value synchronous autocomplete component for edit.
 *
 * @template DataGridType
 * @template ValueType
 * @param {IAutocompleteDataGridEditCellProps<DataGridType, ValueType>} props
 * @return {*}
 */
const AutocompleteDataGridEditCell = <DataGridType extends GridValidRowModel, ValueType extends string | number>(
  props: IAutocompleteDataGridEditCellProps<DataGridType, ValueType>
) => {
  const { dataGridProps, options, getOptionDisabled } = props;

  const apiRef = useGridApiContext();

  // The current data grid value
  const dataGridValue = dataGridProps.value;

  function getCurrentValue() {
    if (!dataGridValue) {
      // No current value
      return null;
    }

    const currentOption = options.find((option) => dataGridValue === option.value) ?? null;

    if (!currentOption) {
      // No matching options available for current value, set value to null
      apiRef.current.setEditCellValue({
        id: dataGridProps.id,
        field: dataGridProps.field,
        value: null
      });
    }

    return currentOption;
  }

  return (
    <Autocomplete
      id={String(dataGridProps.id)}
      noOptionsText="No matching options"
      autoHighlight={true}
      fullWidth
      blurOnSelect
      handleHomeEndKeys
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
      getOptionDisabled={getOptionDisabled}
      onChange={(_, selectedOption) => {
        // Set the data grid cell value with selected options value
        apiRef.current.setEditCellValue({
          id: dataGridProps.id,
          field: dataGridProps.field,
          value: selectedOption?.value
        });
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          variant="outlined"
          fullWidth
          InputProps={{
            ...params.InputProps
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

export default AutocompleteDataGridEditCell;
