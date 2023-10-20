import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { IAutocompleteDataGridOption } from 'components/data-grid/autocomplete/AutocompleteDataGrid.interface';
import { useMemo } from 'react';

export interface IConditionalAutocompleteDataGridViewCellProps<
  DataGridType extends GridValidRowModel,
  OptionsType extends Record<string, string | number>,
  ValueType extends string | number
> {
  /**
   * Data grid props for the cell.
   *
   * @type {GridRenderCellParams<DataGridType>}
   * @memberof IConditionalAutocompleteDataGridViewCellProps
   */
  dataGridProps: GridRenderCellParams<DataGridType>;
  /**
   *
   *
   * @type {OptionsType[]}
   * @memberof IConditionalAutocompleteDataGridViewCellProps
   */
  allOptions: OptionsType[];
  /**
   *
   *
   * @memberof IConditionalAutocompleteDataGridViewCellProps
   */
  optionsGetter: (row: DataGridType, allOptions: OptionsType[]) => IAutocompleteDataGridOption<ValueType>[];
}

/**
 * Data grid single value synchronous autocomplete component for view.
 *
 * @template DataGridType
 * @template OptionsType
 * @template ValueType
 * @param {IConditionalAutocompleteDataGridViewCellProps<DataGridType, OptionsType, ValueType>} props
 * @return {*}
 */
const ConditionalAutocompleteDataGridViewCell = <
  DataGridType extends GridValidRowModel,
  OptionsType extends Record<string, string | number>,
  ValueType extends string | number
>(
  props: IConditionalAutocompleteDataGridViewCellProps<DataGridType, OptionsType, ValueType>
) => {
  const { dataGridProps, allOptions, optionsGetter } = props;

  const options = useMemo(
    function () {
      const options = optionsGetter(dataGridProps.row, allOptions);
      return options;
    },
    [allOptions, dataGridProps.row, optionsGetter]
  );

  return <>{options.find((item) => item.value === dataGridProps.value)?.label || ''}</>;
};

export default ConditionalAutocompleteDataGridViewCell;
