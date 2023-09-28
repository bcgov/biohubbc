import { GridRenderCellParams, GridValidRowModel, useGridApiContext } from '@mui/x-data-grid';
import { IAutocompleteDataGridOption } from 'components/data-grid/autocomplete/AutocompleteDataGrid.interface';
import AutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AutocompleteDataGridEditCell';
import { useEffect } from 'react';

export interface IConditionalAutocompleteDataGridEditCellProps<
  DataGridType extends GridValidRowModel,
  ValueType extends string | number
> {
  /**
   * Data grid props for the cell.
   *
   * @type {GridRenderCellParams<DataGridType>}
   * @memberof IConditionalAutocompleteDataGridEditCellProps
   */
  dataGridProps: GridRenderCellParams<DataGridType>;
  /**
   * The array of options to choose from.
   *
   * @type {IAutocompleteDataGridOption<ValueType>[]}
   * @memberof IConditionalAutocompleteDataGridEditCellProps
   */
  options: IAutocompleteDataGridOption<ValueType>[];
  /**
   * Function that receives an option, and returns a boolean indicating if that option should be disabled or not.
   *
   * @memberof IConditionalAutocompleteDataGridEditCellProps
   */
  getOptionDisabled?: (option: IAutocompleteDataGridOption<ValueType>) => boolean;
}

/**
 * Data grid single value synchronous autocomplete component for edit.
 *
 * @template DataGridType
 * @template ValueType
 * @param {IConditionalAutocompleteDataGridEditCellProps<DataGridType, ValueType>} props
 * @return {*}
 */
const ConditionalAutocompleteDataGridEditCell = <
  DataGridType extends GridValidRowModel,
  ValueType extends string | number
>(
  props: IConditionalAutocompleteDataGridEditCellProps<DataGridType, ValueType>
) => {
  const { dataGridProps, options, getOptionDisabled } = props;

  const apiRef = useGridApiContext();

  useEffect(() => {
    const samplingSite = apiRef.current.getCellValue(dataGridProps.id, 'samplingSite');

    console.log('cellValue', samplingSite, new Date());
  });

  return (
    <AutocompleteDataGridEditCell
      dataGridProps={dataGridProps}
      options={options}
      getOptionDisabled={getOptionDisabled}
    />
  );
};

export default ConditionalAutocompleteDataGridEditCell;
