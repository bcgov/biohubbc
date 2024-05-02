import { getSurveySessionStorageKey, SIMS_OBSERVATIONS_ENVIRONMENT_COLUMNS } from 'constants/session-storage';
import { useObservationsTableContext, useSurveyContext } from 'hooks/useContext';
import { EnvironmentType, EnvironmentTypeIds } from 'interfaces/useReferenceApi.interface';
import { useCallback } from 'react';

/**
 * Functions for environment column configuration.
 *
 * @return {*}
 */
export const useConfigureEnvironmentColumns = () => {
  const surveyContext = useSurveyContext();
  const observationsTableContext = useObservationsTableContext();

  /**
   * Handles the addition of environment columns to the table.
   *
   * @param {EnvironmentType} environmentColumnsToAdd
   * @return {*}
   */
  const onAddEnvironmentColumns = useCallback(
    (environmentColumnsToAdd: EnvironmentType) => {
      if (
        !environmentColumnsToAdd.qualitative_environments.length &&
        !environmentColumnsToAdd.quantitative_environments.length
      ) {
        return;
      }

      // Add the environment columns to the table context
      observationsTableContext.setEnvironmentColumns((currentColumns) => {
        const qualitativeEnvironmentColumnsToAdd = environmentColumnsToAdd.qualitative_environments.filter(
          (columnToAdd) =>
            !currentColumns.qualitative_environments.find(
              (currentColumn) => currentColumn.environment_qualitative_id === columnToAdd.environment_qualitative_id
            )
        );

        const quantitativeEnvironmentColumnsToAdd = environmentColumnsToAdd.quantitative_environments.filter(
          (columnToAdd) =>
            !currentColumns.quantitative_environments.find(
              (currentColumn) => currentColumn.environment_quantitative_id === columnToAdd.environment_quantitative_id
            )
        );

        const newColumns = {
          qualitative_environments: [...currentColumns.qualitative_environments, ...qualitativeEnvironmentColumnsToAdd],
          quantitative_environments: [
            ...currentColumns.quantitative_environments,
            ...quantitativeEnvironmentColumnsToAdd
          ]
        };

        // Store all environment definitions in local storage
        sessionStorage.setItem(
          getSurveySessionStorageKey(surveyContext.surveyId, SIMS_OBSERVATIONS_ENVIRONMENT_COLUMNS),
          JSON.stringify(newColumns)
        );

        return newColumns;
      });

      observationsTableContext.setSavedRows;
    },
    [observationsTableContext, surveyContext.surveyId]
  );

  /**
   * Handles the removal of environment columns from the table.
   *
   * @param {EnvironmentTypeIds} environmentColumnsToRemove
   * @return {*}
   */
  const onRemoveEnvironmentColumns = useCallback(
    (environmentColumnsToRemove: EnvironmentTypeIds) => {
      if (
        !environmentColumnsToRemove.qualitative_environments.length &&
        !environmentColumnsToRemove.quantitative_environments.length
      ) {
        return;
      }

      // Delete the environment columns from the database
      observationsTableContext.deleteObservationEnvironmentColumns(environmentColumnsToRemove, () => {
        // Remove the environment columns from the table context
        observationsTableContext.setEnvironmentColumns((currentColumns) => {
          const remainingQualitativeEnvironmentColumns = currentColumns.qualitative_environments.filter(
            (currentColumn) =>
              !environmentColumnsToRemove.qualitative_environments.includes(currentColumn.environment_qualitative_id)
          );

          const remainingQuantitativeEnvironmentColumns = currentColumns.quantitative_environments.filter(
            (currentColumn) =>
              !environmentColumnsToRemove.quantitative_environments.includes(currentColumn.environment_quantitative_id)
          );

          const remainingColumns = {
            qualitative_environments: remainingQualitativeEnvironmentColumns,
            quantitative_environments: remainingQuantitativeEnvironmentColumns
          };

          // Store all remaining environment definitions in local storage
          sessionStorage.setItem(
            getSurveySessionStorageKey(surveyContext.surveyId, SIMS_OBSERVATIONS_ENVIRONMENT_COLUMNS),
            JSON.stringify(remainingColumns)
          );

          return remainingColumns;
        });

        // Update saved rows, removing any cell values for the deleted columns
        observationsTableContext.setSavedRows((current) => {
          return current.map((row) => {
            for (const columnToRemove of environmentColumnsToRemove.qualitative_environments) {
              delete row[columnToRemove];
            }

            for (const columnToRemove of environmentColumnsToRemove.quantitative_environments) {
              delete row[columnToRemove];
            }

            return row;
          });
        });

        // Update staged rows, removing any cell values for the deleted columns
        observationsTableContext.setStagedRows((current) => {
          return current.map((row) => {
            for (const columnToRemove of environmentColumnsToRemove.qualitative_environments) {
              delete row[columnToRemove];
            }

            for (const columnToRemove of environmentColumnsToRemove.quantitative_environments) {
              delete row[columnToRemove];
            }

            return row;
          });
        });
      });
    },
    [observationsTableContext, surveyContext.surveyId]
  );

  return {
    onAddEnvironmentColumns,
    onRemoveEnvironmentColumns
  };
};
