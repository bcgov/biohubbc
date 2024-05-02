import { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { getSurveySessionStorageKey, SIMS_OBSERVATIONS_HIDDEN_COLUMNS } from 'constants/session-storage';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { useObservationsTableContext, useSurveyContext } from 'hooks/useContext';

export interface IUseConfigureGeneralColumnsProps {
  hideableColumns: GridColDef<IObservationTableRow>[];
}

/**
 * Functions for general column configuration.
 *
 * @return {*}
 */
export const useConfigureGeneralColumns = (props: IUseConfigureGeneralColumnsProps) => {
  const { hideableColumns } = props;

  const surveyContext = useSurveyContext();
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
      (item) => item === true
    );

    let model: GridColumnVisibilityModel = {};

    if (hasHiddenColumns) {
      // Some columns currently hidden, show all columns
      model = { ...Object.fromEntries(hideableColumns.map((column) => [column.field, false])) };
    } else {
      // No columns currently hidden, hide all columns
      model = { ...Object.fromEntries(hideableColumns.map((column) => [column.field, true])) };
    }

    // Store current visibility model in session storage
    sessionStorage.setItem(
      getSurveySessionStorageKey(surveyContext.surveyId, SIMS_OBSERVATIONS_HIDDEN_COLUMNS),
      JSON.stringify(model)
    );

    // Update the column visibility model in the context
    observationsTableContext.setColumnVisibilityModel(model);
  };

  return {
    onToggleColumnVisibility,
    onToggleShowHideAll
  };
};
