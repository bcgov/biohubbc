import Typography from '@mui/material/Typography';
import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { IAutocompleteDataGridOption } from 'components/data-grid/autocomplete/AutocompleteDataGrid.interface';

export interface IAutocompleteDataGridViewCellProps<
  DataGridType extends GridValidRowModel,
  ValueType extends string | number
> {
  /**
   * Data grid props for the cell.
   *
   * @type {GridRenderCellParams<DataGridType>}
   * @memberof AutocompleteDataGridViewCell
   */
  dataGridProps: GridRenderCellParams<DataGridType>;
  /**
   * The array of options to choose from.
   *
   * @type {IAutocompleteDataGridOption<ValueType>[]}
   * @memberof AutocompleteDataGridViewCell
   */
  options: IAutocompleteDataGridOption<ValueType>[];
  /**
   * Indicates if the control contains an error
   *
   * @type {boolean}
   * @memberof IAutocompleteDataGridViewCellProps
   */
  error?: boolean;
}

/**
 * Data grid single value synchronous autocomplete component for view.
 *
 * @template DataGridType
 * @template ValueType
 * @param {IAutocompleteDataGridViewCellProps<DataGridType, ValueType>} props
 * @return {*}
 */
const AutocompleteDataGridViewCell = <DataGridType extends GridValidRowModel, ValueType extends string | number>(
  props: IAutocompleteDataGridViewCellProps<DataGridType, ValueType>
) => {
  const { dataGridProps, options } = props;
  return (
    <Typography
      variant="body2"
      component="div"
      color={props.error ? 'error' : undefined}
      sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
      {options.find((item) => item.value === dataGridProps.value)?.label ?? ''}
    </Typography>
  );
};

export default AutocompleteDataGridViewCell;
