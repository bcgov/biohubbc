import { GridColDef, GridColumnVisibilityModel, GridRowModes } from '@mui/x-data-grid';
import {
  getSurveySessionStorageKey,
  SIMS_OBSERVATIONS_HIDDEN_COLUMNS,
  SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS
} from 'constants/session-storage';
import { IObservationTableRow, MeasurementColumn } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { ConfigureColumns } from 'features/surveys/observations/observations-table/configure-table/ConfigureColumns';
import { getMeasurementColumns } from 'features/surveys/observations/observations-table/grid-column-definitions/GridColumnDefinitionsUtils';
import { useObservationsTableContext } from 'hooks/useContext';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { useCallback, useContext, useEffect, useMemo } from 'react';

export interface IConfigureColumnsContainerProps {
  /**
   * Controls the disabled state of the button.
   *
   * @type {boolean}
   * @memberof IConfigureColumnsContainerProps
   */
  disabled: boolean;
  /**
   * The column definitions of the columns rendered in the observations table
   *
   * @type {GridColDef<IObservationTableRow>[]}
   * @memberof IConfigureColumnsContainerProps
   */
  columns: GridColDef<IObservationTableRow>[];
}

/**
 * Renders a button, which renders a popover, to manage measurements.
 *
 * @param {IConfigureColumnsContainerProps} props
 * @return {*}
 */
export const ConfigureColumnsContainer = (props: IConfigureColumnsContainerProps) => {
  const { disabled, columns } = props;

  const surveyContext = useContext(SurveyContext);
  const { surveyId } = surveyContext;

  const observationsTableContext = useObservationsTableContext();

  // The array of columns that may be toggled as hidden or visible
  const hideableColumns = useMemo(() => {
    return columns.filter((column) => column?.hideable);
  }, [columns]);

  /**
   * Toggles visibility for a particular column
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
   * Toggles whether all columns are hidden or visible.
   */
  const onToggleShowHideAll = useCallback(() => {
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
      getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_HIDDEN_COLUMNS),
      JSON.stringify(model)
    );

    // Update the column visibility model in the context
    observationsTableContext.setColumnVisibilityModel(model);
  }, [hideableColumns, observationsTableContext, surveyId]);

  /**
   * Handles the removal of measurement columns from the table.
   *
   * @param {string[]} measurementColumnsToRemove The `field` names of the columns to remove
   */
  const onRemoveMeasurements = useCallback(
    (measurementColumnsToRemove: string[]) => {
      // Delete the measurement columns from the database
      observationsTableContext.deleteObservationMeasurementColumns(measurementColumnsToRemove, () => {
        // Remove the measurement columns from the table context
        observationsTableContext.setMeasurementColumns((currentColumns) => {
          const remainingColumns = currentColumns.filter(
            (currentColumn) => !measurementColumnsToRemove.includes(currentColumn.colDef.field)
          );

          // Store all remaining measurement definitions in local storage
          sessionStorage.setItem(
            getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS),
            JSON.stringify(remainingColumns.map((column) => column.measurement))
          );

          return remainingColumns;
        });
      });
    },
    [observationsTableContext, surveyId]
  );

  /**
   * Handles the addition of measurement columns to the table.
   *
   * @param {CBMeasurementType[]} measurements
   * @return {*}
   */
  const onAddMeasurements = (measurements: CBMeasurementType[]) => {
    if (!measurements?.length) {
      return;
    }

    // Transform the measurement definitions into measurement columns to add to the table
    const measurementColumnsToAdd: MeasurementColumn[] = getMeasurementColumns(
      measurements,
      observationsTableContext.hasError
    );

    // Add the measurement columns to the table context
    observationsTableContext.setMeasurementColumns((currentColumns) => {
      const newColumns = measurementColumnsToAdd.filter(
        (columnToAdd) =>
          !currentColumns.find((currentColumn) => currentColumn.colDef.field === columnToAdd.colDef.field)
      );

      // Store all measurement definitions in local storage
      sessionStorage.setItem(
        getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS),
        JSON.stringify([
          ...currentColumns.map((column) => column.measurement),
          ...newColumns.map((column) => column.measurement)
        ])
      );

      return [...currentColumns, ...newColumns];
    });
  };

  /**
   * On first mount, load visibility state from session storage, if it exists.
   */
  useEffect(() => {
    if (Object.keys(observationsTableContext.columnVisibilityModel).length) {
      // The column visibility model is not empty (has already been initialized)
      return;
    }

    // Get visibility model from session storage, if it exists
    const stringifiedModel: string | null = sessionStorage.getItem(
      getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_HIDDEN_COLUMNS)
    );

    if (!stringifiedModel) {
      // No visibility model found in session storage, leave the model in its default initial state
      return;
    }

    try {
      const model: GridColumnVisibilityModel = JSON.parse(stringifiedModel);

      observationsTableContext.setColumnVisibilityModel(model);
    } catch {
      // An error occurred parsing the visibility model from session storage, do nothing
      return;
    }
  }, [observationsTableContext, surveyId]);

  /**
   * Return `true` if any row is in edit mode, `false` otherwise.
   *
   * @return {*}  {boolean}
   */
  function isAnyRowInEditMode(): boolean {
    return Object.values(observationsTableContext.rowModesModel).some(
      (innerObj) => innerObj.mode === GridRowModes.Edit
    );
  }

  // The currently hidden fields
  const hiddenFields = Object.keys(observationsTableContext.columnVisibilityModel).filter(
    (key) => observationsTableContext.columnVisibilityModel[key] === false
  );

  return (
    <ConfigureColumns
      disabled={disabled}
      hiddenFields={hiddenFields}
      hideableColumns={hideableColumns}
      onToggleColumnVisibility={onToggleColumnVisibility}
      onToggleShowHideAll={onToggleShowHideAll}
      disabledAddMeasurements={isAnyRowInEditMode()}
      disabledRemoveMeasurements={isAnyRowInEditMode()}
      measurementColumns={observationsTableContext.measurementColumns}
      onRemoveMeasurements={onRemoveMeasurements}
      onAddMeasurements={onAddMeasurements}
    />
  );
};
