import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { IAutocompleteDataGridOption } from 'components/data-grid/autocomplete/AutocompleteDataGrid.interface';
import AutocompleteDataGridEditCell from 'components/data-grid/autocomplete/AutocompleteDataGridEditCell';
import { useMemo } from 'react';

export interface IConditionalAutocompleteDataGridEditCellProps<
  DataGridType extends GridValidRowModel,
  OptionsType extends Record<string, string | number>,
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
   *
   *
   * @type {OptionsType[]}
   * @memberof IConditionalAutocompleteDataGridEditCellProps
   */
  allOptions: OptionsType[];
  /**
   *
   *
   * @memberof IConditionalAutocompleteDataGridEditCellProps
   */
  optionsGetter: (row: DataGridType, allOptions: OptionsType[]) => IAutocompleteDataGridOption<ValueType>[];
  /**
   * Indicates if the control contains an error
   *
   * @type {boolean}
   * @memberof IConditionalAutocompleteDataGridEditCellProps
   */
  error?: boolean;
}

/**
 * Data grid single value synchronous autocomplete component for edit.
 *
 * @template DataGridType
 * @template OptionsType
 * @template ValueType
 * @param {IConditionalAutocompleteDataGridEditCellProps<DataGridType, OptionsType, ValueType>} props
 * @return {*}
 */
const ConditionalAutocompleteDataGridEditCell = <
  DataGridType extends GridValidRowModel,
  OptionsType extends Record<string, string | number>,
  ValueType extends string | number
>(
  props: IConditionalAutocompleteDataGridEditCellProps<DataGridType, OptionsType, ValueType>
) => {
  const { dataGridProps, allOptions, optionsGetter } = props;

  const options = useMemo(
    function () {
      const options = optionsGetter(dataGridProps.row, allOptions);
      return options;
    },
    [allOptions, dataGridProps.row, optionsGetter]
  );

  return <AutocompleteDataGridEditCell dataGridProps={dataGridProps} options={options} error={props.error} />;
};

export default ConditionalAutocompleteDataGridEditCell;
