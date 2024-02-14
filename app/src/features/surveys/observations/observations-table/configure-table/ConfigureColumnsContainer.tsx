import { GridColDef } from '@mui/x-data-grid';
import {
  getSurveySessionStorageKey,
  SIMS_OBSERVATIONS_HIDDEN_COLUMNS,
  SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS
} from 'constants/session-storage';
import { IObservationTableRow, MeasurementColumn } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { ConfigureColumns } from 'features/surveys/observations/observations-table/configure-table/ConfigureColumns';
import {
  ObservationQualitativeMeasurementColDef,
  ObservationQuantitativeMeasurementColDef
} from 'features/surveys/observations/observations-table/GridColumnDefinitions';
import { Measurement } from 'hooks/cb_api/useLookupApi';
import { useObservationTableContext } from 'hooks/useContext';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

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

  const observationsTableContext = useObservationTableContext();

  const [hiddenFields, setHiddenFields] = useState<string[]>([]);

  // The array of columns that may be toggled as hidden or visible
  const hideableColumns = useMemo(() => {
    return columns.filter((column) => {
      return column && column.hideable;
    });
  }, [columns]);

  /**
   * Toggles visibility for a particular column
   */
  const onToggleColumnVisibility = (field: string) => {
    let newHiddenFields = [];

    setHiddenFields((prev) => {
      if (prev.includes(field)) {
        newHiddenFields = prev.filter((hiddenField) => hiddenField !== field);
      } else {
        newHiddenFields = [...prev, field];
      }

      // Store column visibility in local storage
      sessionStorage.setItem(
        getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_HIDDEN_COLUMNS),
        JSON.stringify(newHiddenFields)
      );

      return newHiddenFields;
    });
  };

  /**
   * Toggles whether all columns are hidden or visible.
   */
  const onToggleShowHideAll = useCallback(() => {
    let newHiddenFields: string[] = [];

    setHiddenFields(() => {
      if (hiddenFields.length > 0) {
        newHiddenFields = [];
      } else {
        newHiddenFields = hideableColumns.map((column) => column.field);
      }

      // Store column visibility in local storage
      sessionStorage.setItem(
        getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_HIDDEN_COLUMNS),
        JSON.stringify(newHiddenFields)
      );

      return newHiddenFields;
    });
  }, [hiddenFields, hideableColumns, setHiddenFields, surveyId]);

  /**
   * Removes measurement columns from the observations table, ignoring columns that don't exist.
   *
   * @param {string[]} measurementColumnsToRemove The `field` names of the columns to remove
   */
  const onRemoveMeasurements = useCallback(
    (measurementColumnsToRemove: string[]) => {
      observationsTableContext.setMeasurementColumns((currentColumns) => {
        const remainingColumns = currentColumns.filter(
          (currentColumn) => !measurementColumnsToRemove.includes(currentColumn.colDef.field)
        );

        // Store user-added mesurement columns in local storage
        sessionStorage.setItem(
          getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS),
          JSON.stringify(remainingColumns)
        );

        return remainingColumns;
      });
    },
    [observationsTableContext, surveyId]
  );

  /**
   * Handles the addition of measurement columns to the table.
   *
   * @param {Measurement[]} measurements
   * @return {*}
   */
  const onAddMeasurements = (measurements: Measurement[]) => {
    if (!measurements?.length) {
      return;
    }

    const measurementColumnsToAdd: MeasurementColumn[] = [];

    for (const measurement of measurements) {
      if (measurement.measurementType === 'Quantitative') {
        measurementColumnsToAdd.push({
          measurement: measurement,
          colDef: ObservationQuantitativeMeasurementColDef({
            measurement: measurement,
            hasError: observationsTableContext.hasError
          })
        });
      }

      if (measurement.measurementType === 'Qualitative') {
        measurementColumnsToAdd.push({
          measurement: measurement,
          colDef: ObservationQualitativeMeasurementColDef({
            measurement: measurement,
            measurementOptions: measurement.measurementOptions,
            hasError: observationsTableContext.hasError
          })
        });
      }
    }

    observationsTableContext.setMeasurementColumns((currentColumns) => {
      const newColumns = measurementColumnsToAdd.filter(
        (columnToAdd) =>
          !currentColumns.find((currentColumn) => currentColumn.colDef.field === columnToAdd.colDef.field)
      );

      // Store user-added mesurement columns in local storage
      sessionStorage.setItem(
        getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS),
        JSON.stringify([...currentColumns, ...newColumns])
      );

      return [...currentColumns, ...newColumns];
    });
  };

  /**
   * Whenever hidden fields updates, trigger an update in visiblity for the table.
   */
  useEffect(() => {
    observationsTableContext._muiDataGridApiRef.current.setColumnVisibilityModel({
      ...Object.fromEntries(hideableColumns.map((column) => [column.field, true])),
      ...Object.fromEntries(hiddenFields.map((field) => [field, false]))
    });
  }, [hideableColumns, hiddenFields, observationsTableContext._muiDataGridApiRef]);

  /**
   * On first mount, load visibility state from session storage, if it exists.
   */
  useEffect(() => {
    const fieldsJson: string | null = sessionStorage.getItem(
      getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_HIDDEN_COLUMNS)
    );

    if (!fieldsJson) {
      return;
    }

    try {
      const fields: string[] = JSON.parse(fieldsJson);
      setHiddenFields(fields);
    } catch {
      return;
    }
  }, [setHiddenFields, surveyId]);

  return (
    <ConfigureColumns
      disabled={disabled}
      hiddenFields={hiddenFields}
      hideableColumns={hideableColumns}
      onToggleColumnVisibility={onToggleColumnVisibility}
      onToggleShowHideAll={onToggleShowHideAll}
      measurementColumns={observationsTableContext.measurementColumns}
      onRemoveMeasurements={onRemoveMeasurements}
      onAddMeasurements={onAddMeasurements}
    />
  );
};
