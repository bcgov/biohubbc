import { mdiCogOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import { getSurveySessionStorageKey, SIMS_OBSERVATIONS_HIDDEN_COLUMNS } from 'constants/session-storage';
import { MeasurementColumn, ObservationsTableContext } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { ConfigureColumns } from 'features/surveys/observations/observations-table/configure-table/ConfigureColumns';
import {
  ObservationQualitativeMeasurementColDef,
  ObservationQuantitativeMeasurementColDef
} from 'features/surveys/observations/observations-table/GridColumnDefinitions';
import { Measurement } from 'hooks/cb_api/useLookupApi';
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface IConfigureColumnsButtonProps {
  /**
   * The array of fields that are currently hidden.
   *
   * @type {string[]}
   * @memberof IConfigureColumnsButtonProps
   */
  hiddenFields: string[];
  /**
   * Sets the array of fields that are currently hidden.
   *
   * @type {Dispatch<SetStateAction<string[]>>}
   * @memberof IConfigureColumnsButtonProps
   */
  setHiddenFields: Dispatch<SetStateAction<string[]>>;
  /**
   * Controls the disabled state of the button.
   *
   * @type {boolean}
   * @memberof IConfigureColumnsButtonProps
   */
  disabled: boolean;
}

/**
 * Renders a button, which renders a popover, to manage measurements.
 *
 * @param {IConfigureColumnsButtonProps} props
 * @return {*}
 */
export const ConfigureColumnsButton = (props: IConfigureColumnsButtonProps) => {
  const { hiddenFields, setHiddenFields, disabled } = props;

  const surveyContext = useContext(SurveyContext);
  const { surveyId } = surveyContext;

  const observationsTableContext = useContext(ObservationsTableContext);

  const [columnVisibilityMenuAnchorEl, setColumnVisibilityMenuAnchorEl] = useState<Element | null>(null);

  /**
   * Handles the addition of measurement columns to the table.
   *
   * @param {Measurement[]} measurements
   * @return {*}
   */
  const handleMeasurements = (measurements: Measurement[]) => {
    if (!measurements?.length) {
      return;
    }

    const measurementColumns: MeasurementColumn[] = [];

    for (const measurement of measurements) {
      if (measurement.measurementType === 'Quantitative') {
        measurementColumns.push({
          measurement: measurement,
          colDef: ObservationQuantitativeMeasurementColDef({
            measurement: measurement,
            hasError: observationsTableContext.hasError
          })
        });
      }

      if (measurement.measurementType === 'Qualitative') {
        measurementColumns.push({
          measurement: measurement,
          colDef: ObservationQualitativeMeasurementColDef({
            measurement: measurement,
            measurementOptions: measurement.measurementOptions,
            hasError: observationsTableContext.hasError
          })
        });
      }
    }

    observationsTableContext.addMeasurementColumns(measurementColumns);
  };

  // The array of columns that may be toggled as hidden or visible
  const hideableColumns = useMemo(() => {
    return observationsTableContext.getColumns().filter((column) => {
      return column && column.type && !['actions', 'checkboxSelection'].includes(column.type) && column.hideable;
    });
  }, [observationsTableContext]);

  /**
   * Toggles visibility for a particular column
   */
  const toggleColumnVisibility = (field: string) => {
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
  const toggleShowHideAll = useCallback(() => {
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

  /**
   * Whenever hidden fields updates, trigger an update in visiblity for the table.
   */
  useEffect(() => {
    observationsTableContext._muiDataGridApiRef?.current?.setColumnVisibilityModel({
      ...Object.fromEntries(hideableColumns.map((column) => [column.field, true])),
      ...Object.fromEntries(hiddenFields.map((field) => [field, false]))
    });
  }, [hideableColumns, hiddenFields, observationsTableContext._muiDataGridApiRef]);

  return (
    <>
      <IconButton
        color="default"
        onClick={(event) => setColumnVisibilityMenuAnchorEl(event.currentTarget)}
        disabled={disabled}>
        <Icon path={mdiCogOutline} size={1} />
      </IconButton>
      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        id="survey-observations-table-actions-menu"
        anchorEl={columnVisibilityMenuAnchorEl}
        open={Boolean(columnVisibilityMenuAnchorEl)}
        onClose={() => setColumnVisibilityMenuAnchorEl(null)}>
        <ConfigureColumns
          hideableColumns={hideableColumns}
          hiddenFields={hiddenFields}
          measurementColumns={observationsTableContext.measurementColumns}
          onMeasurementsSave={handleMeasurements}
          onToggleColumnVisibility={toggleColumnVisibility}
          onToggledShowHideAll={toggleShowHideAll}
        />
      </Popover>
    </>
  );
};
