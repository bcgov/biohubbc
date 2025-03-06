import Typography from '@mui/material/Typography';
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
   * All possible options for the autocomplete control.
   *
   * @type {OptionsType[]}
   * @memberof IConditionalAutocompleteDataGridViewCellProps
   */
  allOptions: OptionsType[];
  /**
   * Given a row and list of all possible options, return the matching options for the autocomplete control.
   *
   * @memberof IConditionalAutocompleteDataGridViewCellProps
   */
  optionsGetter: (row: DataGridType, allOptions: OptionsType[]) => IAutocompleteDataGridOption<ValueType>[];
  /**
   * Indicates if the control contains an error
   *
   * @type {boolean}
   * @memberof IConditionalAutocompleteDataGridViewCellProps
   */
  error?: boolean;
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

  return (
    <Typography color={props.error ? 'error' : undefined} sx={{ fontSize: 'inherit' }}>
      {options.find((item) => item.value === dataGridProps.value)?.label || ''}
    </Typography>
  );
};

export default ConditionalAutocompleteDataGridViewCell;
