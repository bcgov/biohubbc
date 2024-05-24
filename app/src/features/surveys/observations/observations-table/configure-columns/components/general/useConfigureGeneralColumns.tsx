import { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { useObservationsTableContext } from 'hooks/useContext';

export interface IUseConfigureGeneralColumnsProps {
  hideableColumns: GridColDef<IObservationTableRow>[];
}

/**
 * Functions for general column configuration.
 *
 * @param {IUseConfigureGeneralColumnsProps} props
 * @return {*}
 */
export const useConfigureGeneralColumns = (props: IUseConfigureGeneralColumnsProps) => {
  const { hideableColumns } = props;

  const observationsTableContext = useObservationsTableContext();

  /**
   * Handles toggling the visibility of a column.
   *
   * @param {string} field
   */
  const onToggleColumnVisibility = (field: string) => {
    // Get the current visibility model for the column
    const columnVisibility = observationsTableContext.columnVisibilityModel[field];

    // If model is undefined, then no visibility model has been set for this column, default to true
    const isColumnVisible = columnVisibility === undefined ? true : columnVisibility;

    // Toggle the visibility of the column
    observationsTableContext._muiDataGridApiRef.current.setColumnVisibility(field, !isColumnVisible);
  };

  /**
   * Handles toggling the visibility of all columns.
   */
  const onToggleShowHideAll = () => {
    const hasHiddenColumns = Object.values(observationsTableContext.columnVisibilityModel).some(
      (item) => item === false
    );

    let model: GridColumnVisibilityModel = {};

    if (hasHiddenColumns) {
      // Some columns currently hidden, show all columns
      model = { ...Object.fromEntries(hideableColumns.map((column) => [column.field, true])) };
    } else {
      // No columns currently hidden, hide all columns
      model = { ...Object.fromEntries(hideableColumns.map((column) => [column.field, false])) };
    }

    // Update the column visibility model
    observationsTableContext._muiDataGridApiRef.current.setColumnVisibilityModel(model);
  };

  return {
    onToggleColumnVisibility,
    onToggleShowHideAll
  };
};
