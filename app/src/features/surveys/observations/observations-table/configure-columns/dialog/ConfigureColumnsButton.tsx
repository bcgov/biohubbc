import { mdiTableEdit } from '@mdi/js';
import Icon from '@mdi/react';
import { Button } from '@mui/material';
import { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import {
  getSurveySessionStorageKey,
  SIMS_OBSERVATIONS_ENVIRONMENT_COLUMNS,
  SIMS_OBSERVATIONS_HIDDEN_COLUMNS,
  SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS
} from 'constants/session-storage';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { useObservationsTableContext, useSurveyContext } from 'hooks/useContext';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { EnvironmentType, EnvironmentTypeIds } from 'interfaces/useReferenceApi.interface';
import { useCallback, useMemo, useState } from 'react';
import { ConfigureColumnsDialog } from './ConfigureColumnsDialog';

export interface IConfigureColumnsButtonProps {
  /**
   * Controls the disabled state of the component controls.
   *
   * @type {boolean}
   * @memberof IConfigureColumnsProps
   */
  disabled: boolean;
  /**
   * The column definitions of the columns to render in the table.
   *
   * @type {GridColDef<IObservationTableRow>[]}
   * @memberof ISpeciesObservationTableProps
   */
  columns: GridColDef<IObservationTableRow>[];
}

export const ConfigureColumnsButton = (props: IConfigureColumnsButtonProps) => {
  const { disabled, columns } = props;

  const [isOpen, setIsOpen] = useState(false);

  const surveyContext = useSurveyContext();
  const observationsTableContext = useObservationsTableContext();

  // The currently hidden fields
  const hiddenFields = Object.keys(observationsTableContext.columnVisibilityModel).filter(
    (key) => observationsTableContext.columnVisibilityModel[key] === false
  );

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
      getSurveySessionStorageKey(surveyContext.surveyId, SIMS_OBSERVATIONS_HIDDEN_COLUMNS),
      JSON.stringify(model)
    );

    // Update the column visibility model in the context
    observationsTableContext.setColumnVisibilityModel(model);
  }, [hideableColumns, observationsTableContext, surveyContext.surveyId]);

  const measurementColumns = observationsTableContext.measurementColumns;

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
   * @param {string[]} measurementColumnsToRemove The `field` names of the columns to remove
   */
  const onRemoveMeasurements = useCallback(
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
    },
    [observationsTableContext, surveyContext.surveyId]
  );

  const environmentColumns = observationsTableContext.environmentColumns;

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
    },
    [observationsTableContext, surveyContext.surveyId]
  );

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
    },
    [observationsTableContext, surveyContext.surveyId]
  );

  return (
    <>
      <Button
        color="primary"
        disabled={disabled}
        variant="outlined"
        data-testid="observation-measurements-button"
        onClick={() => setIsOpen(true)}
        startIcon={<Icon style={{ marginTop: '2px' }} path={mdiTableEdit} size={1} />}
        aria-label="Add Measurements">
        Configure
      </Button>
      <ConfigureColumnsDialog
        onClose={() => setIsOpen(false)}
        open={isOpen}
        disabled={false}
        hiddenFields={hiddenFields}
        hideableColumns={hideableColumns}
        onToggleShowHideAll={onToggleShowHideAll}
        onToggleColumnVisibility={onToggleColumnVisibility}
        onRemoveMeasurements={onRemoveMeasurements}
        measurementColumns={measurementColumns}
        onAddMeasurementColumns={onAddMeasurementColumns}
        onRemoveMeasurementColumns={onRemoveMeasurementColumns}
        environmentColumns={environmentColumns}
        onAddEnvironmentColumns={onAddEnvironmentColumns}
        onRemoveEnvironmentColumns={onRemoveEnvironmentColumns}
      />
    </>
  );
};
