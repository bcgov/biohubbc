import { getSurveySessionStorageKey, SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS } from 'constants/session-storage';
import { useObservationsTableContext, useSurveyContext } from 'hooks/useContext';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { useCallback } from 'react';

/**
 * Functions for measurement column configuration.
 *
 * @return {*}
 */
export const useConfigureMeasurementColumns = () => {
  const surveyContext = useSurveyContext();
  const observationsTableContext = useObservationsTableContext();

  /**
   * Handles the addition of measurement columns to the table.
   *
   * @param {CBMeasurementType[]} measurements
   * @return {*}
   */
  const onAddMeasurementColumns = useCallback(
    (measurementColumnsToAdd: CBMeasurementType[]) => {
      if (!measurementColumnsToAdd?.length) {
        return;
      }

      // Add the measurement columns to the table context
      observationsTableContext.setMeasurementColumns((currentColumns) => {
        const newColumns = measurementColumnsToAdd.filter(
          (columnToAdd) =>
            !currentColumns.find(
              (currentColumn) => currentColumn.taxon_measurement_id === columnToAdd.taxon_measurement_id
            )
        );

        // Store all measurement definitions in local storage
        sessionStorage.setItem(
          getSurveySessionStorageKey(surveyContext.surveyId, SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS),
          JSON.stringify([...currentColumns, ...newColumns])
        );

        return [...currentColumns, ...newColumns];
      });
    },
    [observationsTableContext, surveyContext.surveyId]
  );

  /**
   * Handles the removal of measurement columns from the table.
   *
   * @param {string[]} measurementColumnsToRemove The `field` names of the columns to remove. For measurementColumnsToAdd, this is
   * the `taxon_measurement_id`.
   */
  const onRemoveMeasurementColumns = useCallback(
    (measurementColumnsToRemove: string[]) => {
      // Delete the measurement columns from the database
      observationsTableContext.deleteObservationMeasurementColumns(measurementColumnsToRemove, () => {
        // Remove the measurement columns from the table context
        observationsTableContext.setMeasurementColumns((currentColumns) => {
          const remainingColumns = currentColumns.filter(
            (currentColumn) => !measurementColumnsToRemove.includes(currentColumn.taxon_measurement_id)
          );

          // Store all remaining measurement definitions in local storage
          sessionStorage.setItem(
            getSurveySessionStorageKey(surveyContext.surveyId, SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS),
            JSON.stringify(remainingColumns)
          );

          return remainingColumns;
        });
      });

      // Update saved rows, removing any cell values for the deleted columns
      observationsTableContext.setSavedRows((currentSavedRows) => {
        return currentSavedRows.map((savedRow) => {
          for (const columnIdToRemove of measurementColumnsToRemove) {
            delete savedRow[columnIdToRemove];
          }

          return savedRow;
        });
      });

      // Update staged rows, removing any cell values for the deleted columns
      observationsTableContext.setStagedRows((currentStagedRows) => {
        return currentStagedRows.map((stagedRow) => {
          for (const columnIdToRemove of measurementColumnsToRemove) {
            delete stagedRow[columnIdToRemove];
          }

          return stagedRow;
        });
      });
    },
    [observationsTableContext, surveyContext.surveyId]
  );

  return {
    onAddMeasurementColumns,
    onRemoveMeasurementColumns
  };
};
