import { GridRowId, GridRowSelectionModel, useGridApiRef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { DialogContext } from 'contexts/dialogContext';
import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { RowValidationError, TableValidationModel } from '../components/data-grid/DataGridValidationAlert';
import { SurveyContext } from './surveyContext';
import { TelemetryContext } from './telemetryContext';

export interface IManualTelemetryRecord {
  alias: string;
  device_id: number;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
}

export interface IManualTelemetryTableRow extends Partial<IManualTelemetryRecord> {
  id: GridRowId;
}

export type TelemetryTableValidationModel = TableValidationModel<IManualTelemetryTableRow>;
export type TelemetryRowValidationError = RowValidationError<IManualTelemetryTableRow>;

export type ITelemetryTableContext = {
  /**
   * API ref used to interface with an MUI DataGrid representing the telemetry records
   */
  _muiDataGridApiRef: React.MutableRefObject<GridApiCommunity>;
  /**
   * The rows the data grid should render.
   */
  rows: IManualTelemetryTableRow[];
  /**
   * A setState setter for the `rows`
   */
  setRows: React.Dispatch<React.SetStateAction<IManualTelemetryTableRow[]>>;
  /**
   * Appends a new blank record to the telemetry rows
   */
  addRecord: () => void;
  /**
   * Transitions all rows in edit mode to view mode and triggers a commit of all telemetry rows to the database.
   */
  saveRecords: () => void;
  /**
   * Deletes all of the given records and removes them from the Observation table.
   */
  deleteRecords: (observationRecords: IManualTelemetryTableRow[]) => void;
  /**
   * Deletes all of the currently selected records and removes them from the Observation table.
   */
  deleteSelectedRecords: () => void;
  /**
   * Reverts all changes made to observation records within the Observation Table
   */
  revertRecords: () => void;
  /**
   * Refreshes the Observation Table with already existing records
   */
  refreshRecords: () => Promise<void>;
  /**
   * Returns all of the observation table records that have been selected
   */
  getSelectedRecords: () => IManualTelemetryTableRow[];
  /**
   * Indicates whether the observation table has any unsaved changes
   */
  hasUnsavedChanges: boolean;
  /**
   * Callback that should be called when a row enters edit mode.
   */
  onRowEditStart: (id: GridRowId) => void;
  /**
   * The IDs of the selected observation table rows
   */
  rowSelectionModel: GridRowSelectionModel;
  /**
   * Sets the IDs of the selected observation table rows
   */
  onRowSelectionModelChange: (rowSelectionModel: GridRowSelectionModel) => void;
  /**
   * Indicates if the data is in the process of being persisted to the server.
   */
  isSaving: boolean;
  /**
   * Indicates whether or not content in the telemetry table is loading.
   */
  isLoading: boolean;
  /**
   * The state of the validation model
   */
  validationModel: any;
  /**
   * Reflects the total count of telemetry records for the survey
   */
  recordCount: number;
  /**
   * Updates the total observation count for the survey
   */
  setRecordCount: (count: number) => void;
};

export const TelemetryTableContext = createContext<ITelemetryTableContext>({
  _muiDataGridApiRef: null as unknown as React.MutableRefObject<GridApiCommunity>,
  rows: [],
  setRows: () => {},
  addRecord: () => {},
  saveRecords: () => {},
  deleteRecords: () => undefined,
  deleteSelectedRecords: () => undefined,
  revertRecords: () => undefined,
  refreshRecords: () => Promise.resolve(),
  getSelectedRecords: () => [],
  hasUnsavedChanges: false,
  onRowEditStart: () => {},
  rowSelectionModel: [],
  onRowSelectionModelChange: () => {},
  isSaving: false,
  isLoading: false,
  validationModel: {},
  recordCount: 0,
  setRecordCount: () => undefined
});

export const TelemetryTableContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const _muiDataGridApiRef = useGridApiRef();
  const surveyContext = useContext(SurveyContext);
  const telemetryContext = useContext(TelemetryContext);
  const dialogContext = useContext(DialogContext);

  // The data grid rows
  const [rows, setRows] = useState<IManualTelemetryTableRow[]>([]);
  // Stores the currently selected row ids
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  // Existing rows that are in edit mode
  const [modifiedRowIds, setModifiedRowIds] = useState<string[]>([]);
  // New rows (regardless of mode)
  const [addedRowIds, setAddedRowIds] = useState<string[]>([]);
  // True if the rows are in the process of transitioning from edit to view mode
  const [_isStoppingEdit, _setIsStoppingEdit] = useState(false);
  // True if the taxonomy cache has been initialized
  const [hasInitializedTaxonomyCache, setHasInitializedTaxonomyCache] = useState(false);
  // True if the records are in the process of being saved to the server
  const [_isSaving, _setIsSaving] = useState(false);
  // Stores the current count of observations for this survey
  const [observationCount, setObservationCount] = useState<number>(0);
  // Stores the current validation state of the table
  const [validationModel, setValidationModel] = useState<TelemetryTableValidationModel>({});

  /**
   * Gets all rows from the table, including values that have been edited in the table.
   */
  const _getRowsWithEditedValues = (): IManualTelemetryTableRow[] => {
    const rowValues = Array.from(_muiDataGridApiRef.current.getRowModels?.()?.values()) as IManualTelemetryTableRow[];

    return rowValues.map((row) => {
      const editRow = _muiDataGridApiRef.current.state.editRows[row.id];
      if (!editRow) {
        return row;
      }

      return Object.entries(editRow).reduce(
        (newRow, entry) => ({ ...row, ...newRow, _isModified: true, [entry[0]]: entry[1].value }),
        {}
      );
    }) as IManualTelemetryTableRow[];
  };

  const _validateRows = (): TelemetryTableValidationModel | null => {
    const rowValues = _getRowsWithEditedValues();
    const tableColumns = _muiDataGridApiRef.current.getAllColumns();

    const requiredColumns: (keyof IManualTelemetryTableRow)[] = [
      'alias',
      'device_id',
      'latitude',
      'longitude',
      'date',
      'time'
    ];
  };
};
