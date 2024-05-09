import Typography from '@mui/material/Typography';
import {
  GridCellParams,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowSelectionModel,
  GridValidRowModel,
  useGridApiRef
} from '@mui/x-data-grid';
import { GridApiCommunity, GridStateColDef } from '@mui/x-data-grid/internals';
import { TelemetryTableI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { default as dayjs } from 'dayjs';
import { APIError } from 'hooks/api/useAxios';
import { ICreateManualTelemetry, IUpdateManualTelemetry, useTelemetryApi } from 'hooks/useTelemetryApi';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RowValidationError, TableValidationModel } from '../components/data-grid/DataGridValidationAlert';
import { TelemetryDataContext } from './telemetryDataContext';

export interface IManualTelemetryRecord {
  deployment_id: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  telemetry_type: string;
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
   * Returns all columns belonging to the telemetry table
   */
  getColumns: () => GridStateColDef[];
  /**
   * Appends a new blank record to the telemetry rows
   */
  addRecord: () => void;
  /**
   * Transitions all rows in edit mode to view mode and triggers a commit of all telemetry rows to the database.
   */
  saveRecords: () => void;
  /**
   * Deletes all of the given records and removes them from the Telemetry table.
   */
  deleteRecords: (telemetryRecords: IManualTelemetryTableRow[]) => void;
  /**
   * Deletes all of the currently selected records and removes them from the Telemetry table.
   */
  deleteSelectedRecords: () => void;
  /**
   * Reverts all changes made to telemetry records within the Telemetry Table
   */
  revertRecords: () => void;
  /**
   * Refreshes the Telemetry Table with already existing records
   */
  refreshRecords: () => Promise<void>;
  /**
   * Returns all of the telemetry table records that have been selected
   */
  //_getSelectedRecords: () => IManualTelemetryTableRow[];
  /**
   * Indicates whether the telemetry table has any unsaved changes
   */
  hasUnsavedChanges: boolean;
  /**
   * Callback that should be called when a row enters edit mode.
   */
  //onRowEditStart: (id: GridRowId) => void;
  /**
   * The IDs of the selected telemetry table rows
   */
  rowSelectionModel: GridRowSelectionModel;
  /**
   * Sets the IDs of the selected telemetry table rows
   */
  onRowSelectionModelChange: (rowSelectionModel: GridRowSelectionModel) => void;
  /**
   * The row modes model, which defines which rows are in edit mode.
   */
  rowModesModel: GridRowModesModel;
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
  validationModel: TelemetryTableValidationModel;
  /**
   * Reflects the total count of telemetry records for the survey
   */
  recordCount: number;
  /**
   * Updates the total telemetry count for the survey
   */
  //setRecordCount: (count: number) => void;

  /**
   * Indicates whether the cell has an error.
   *
   */
  hasError: (params: GridCellParams) => boolean;

  /**
   * Callback when row model changes ie: 'Edit' -> 'View'
   *
   */
  onRowModesModelChange: (model: GridRowModesModel) => void;
};

export const TelemetryTableContext = createContext<ITelemetryTableContext | undefined>(undefined);

type ITelemetryTableContextProviderProps = PropsWithChildren<{
  deployment_ids: string[];
}>;

export const TelemetryTableContextProvider = (props: ITelemetryTableContextProviderProps) => {
  const { children, deployment_ids } = props;

  const _muiDataGridApiRef = useGridApiRef();

  const telemetryApi = useTelemetryApi();

  const telemetryDataContext = useContext(TelemetryDataContext);
  const dialogContext = useContext(DialogContext);

  // The data grid rows
  const [rows, setRows] = useState<IManualTelemetryTableRow[]>([]);

  // Stores the currently selected row ids
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);

  // The row modes model, which defines which rows are in edit mode
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  // Stores the current validation state of the table
  const [validationModel, setValidationModel] = useState<TelemetryTableValidationModel>({});

  // New rows (regardless of mode)
  const _stagedRowIds = useRef<string[]>([]);

  // New rows (regardless of mode)
  const _modifiedRowIds = useRef<string[]>([]);

  // True if the records are in the process of being saved to the server
  const _isSavingData = useRef(false);

  // Count of table records
  const recordCount = rows.length;

  // True if telemetry is fetching
  const isLoading = telemetryDataContext.telemetryDataLoader.isLoading;

  // True if table has unsaved changes, deferring value to prevent ui issue with controls rendering
  const hasUnsavedChanges = useDeferredValue(_modifiedRowIds.current.length > 0 || _stagedRowIds.current.length > 0);

  const getMutatedIds = useCallback(
    () => [..._modifiedRowIds.current, ..._stagedRowIds.current],
    [_modifiedRowIds, _stagedRowIds]
  );

  const refreshRecords = useCallback(async () => {
    const telemetry = (await telemetryDataContext.telemetryDataLoader.refresh(deployment_ids)) ?? [];

    // Format the rows to use date and time
    const rows: IManualTelemetryTableRow[] = telemetry.map((item) => {
      return {
        id: item.id,
        deployment_id: item.deployment_id,
        latitude: item.latitude,
        longitude: item.longitude,
        date: dayjs(item.acquisition_date).format('YYYY-MM-DD'),
        time: dayjs(item.acquisition_date).format('HH:mm:ss'),
        telemetry_type: item.telemetry_type
      };
    });

    // Set initial rows for the table context
    setRows(rows);
  }, [deployment_ids]);

  /**
   * Get table columns
   *
   * @returns {string[]} Table columns
   */
  const getColumns = useCallback(() => {
    return _muiDataGridApiRef.current.getAllColumns?.() ?? [];
  }, [_muiDataGridApiRef]);

  /**
   * Gets all rows from the table that are being edited
   *
   * @returns {IManualTelemetryTableRow[]} Edited rows.
   */
  const _getModifiedRows = useCallback((): IManualTelemetryTableRow[] => {
    const editRows: IManualTelemetryTableRow[] = [];
    const idsToSave = getMutatedIds();

    for (const id of idsToSave) {
      const editRow = _muiDataGridApiRef.current.state.editRows[id];
      if (editRow) {
        const newRow = Object.entries(editRow).reduce(
          (newRow, entry) => ({
            ..._muiDataGridApiRef.current.getRow(id),
            ...newRow,
            [entry[0]]: entry[1].value
          }),
          {}
        ) as IManualTelemetryTableRow;
        editRows.push(newRow);
      }
    }

    return editRows;
  }, [_muiDataGridApiRef]);

  const _updateRowsMode = useCallback(
    (rowIds: string[], mode: GridRowModes, keepChanges: boolean) => {
      setRowModesModel(() => {
        const newModel: GridRowModesModel = {};
        for (const id of rowIds) {
          newModel[id] = { mode, ignoreModifications: !keepChanges };
        }
        return newModel;
      });
    },
    [setRowModesModel]
  );

  /**
   * Get selected records via individual selection or bulk
   *
   * @returns {IManualTelemetryTableRow[]} Table rows.
   */
  const _getSelectedRecords: () => IManualTelemetryTableRow[] = useCallback(() => {
    if (!_muiDataGridApiRef?.current?.getRowModels) {
      // Data grid is not fully initialized
      return [];
    }

    const rowValues = Array.from(_muiDataGridApiRef.current.getRowModels(), ([_, value]) => value);
    return rowValues.filter((row): row is IManualTelemetryTableRow =>
      rowSelectionModel.includes((row as IManualTelemetryTableRow).id)
    );
  }, [_muiDataGridApiRef, rowSelectionModel]);

  /**
   * Checks if the cell has error.
   *
   */
  const hasError = useCallback(
    (params: GridCellParams): boolean => {
      return Boolean(
        validationModel[params.row.id]?.some((error) => {
          return error.field === params.field;
        })
      );
    },
    [validationModel]
  );

  /**
   * Validates all rows belonging to the table. Returns null if validation passes, otherwise
   * returns the validation model
   */
  const _validateRows = useCallback((): TelemetryTableValidationModel | null => {
    const tableColumns = getColumns();
    const rowValues = _getModifiedRows();

    const requiredColumns: (keyof IManualTelemetryTableRow)[] = [
      'deployment_id',
      'latitude',
      'longitude',
      'date',
      'time'
    ];

    const validation = rowValues.reduce((tableModel: TelemetryTableValidationModel, row: IManualTelemetryTableRow) => {
      const rowErrors: TelemetryRowValidationError[] = [];

      // Validate missing columns
      const missingColumns: Set<keyof IManualTelemetryTableRow> = new Set(
        requiredColumns.filter((column) => !row[column])
      );

      Array.from(missingColumns).forEach((field: keyof IManualTelemetryTableRow) => {
        const columnName = tableColumns.find((column) => column.field === field)?.headerName ?? field;
        rowErrors.push({ field, message: `Missing column: ${columnName}` });
      });

      // Validate date value
      if (row.date && !dayjs(row.date).isValid()) {
        rowErrors.push({ field: 'date', message: 'Invalid date' });
      }

      // Validate time value
      if (row.time === 'Invalid date') {
        rowErrors.push({ field: 'time', message: 'Invalid time' });
      }

      if (rowErrors.length > 0) {
        tableModel[row.id] = rowErrors;
      }

      return tableModel;
    }, {});

    setValidationModel(validation);

    return Object.keys(validation).length > 0 ? validation : null;
  }, [getColumns, _getModifiedRows]);

  const _commitDeleteRecords = useCallback(
    async (telemetryRecords: IManualTelemetryTableRow[]): Promise<void> => {
      if (!telemetryRecords.length) {
        return;
      }

      const allRowIdsToDelete = telemetryRecords.map((item) => String(item.id));

      // Get all row ids that are new, which only need to be removed from local state
      const addedRowIdsToDelete = allRowIdsToDelete.filter((id) => _stagedRowIds.current.includes(id));

      // Get all row ids that are not new, which need to be deleted from the server
      const modifiedRowIdsToDelete = allRowIdsToDelete.filter((id) => !_stagedRowIds.current.includes(id));

      try {
        if (modifiedRowIdsToDelete.length) {
          await telemetryApi.deleteManualTelemetry(modifiedRowIdsToDelete);
        }

        // Remove row IDs from validation model
        setValidationModel((prevValidationModel) =>
          allRowIdsToDelete.reduce((newValidationModel, rowId) => {
            delete newValidationModel[rowId];
            return newValidationModel;
          }, prevValidationModel)
        );

        // Update all rows, removing deleted rows
        setRows((current) => current.filter((item) => !allRowIdsToDelete.includes(String(item.id))));

        // Update added rows, removing deleted rows
        _stagedRowIds.current = _stagedRowIds.current.filter((id) => !addedRowIdsToDelete.includes(id));

        // Updated editing rows, removing deleted rows
        _modifiedRowIds.current = _modifiedRowIds.current.filter((id) => !allRowIdsToDelete.includes(id));

        // Close yes-no dialog
        dialogContext.setYesNoDialog({ open: false });

        // Show snackbar for successful deletion
        dialogContext.setSnackbar({
          snackbarMessage: (
            <Typography variant="body2" component="div">
              {telemetryRecords.length === 1
                ? TelemetryTableI18N.deleteSingleRecordSuccessSnackbarMessage
                : TelemetryTableI18N.deleteMultipleRecordSuccessSnackbarMessage(telemetryRecords.length)}
            </Typography>
          ),
          open: true
        });
      } catch {
        // Close yes-no dialog
        dialogContext.setYesNoDialog({ open: false });

        // Show error dialog
        dialogContext.setErrorDialog({
          onOk: () => dialogContext.setErrorDialog({ open: false }),
          onClose: () => dialogContext.setErrorDialog({ open: false }),
          dialogTitle: TelemetryTableI18N.removeRecordsErrorDialogTitle,
          dialogText: TelemetryTableI18N.removeRecordsErrorDialogText,
          open: true
        });
      }
    },
    [dialogContext, telemetryApi]
  );

  const deleteRecords = useCallback(
    (telemetryRecords: IManualTelemetryTableRow[]) => {
      if (!telemetryRecords.length) {
        return;
      }

      dialogContext.setYesNoDialog({
        dialogTitle:
          telemetryRecords.length === 1
            ? TelemetryTableI18N.removeSingleRecordDialogTitle
            : TelemetryTableI18N.removeMultipleRecordsDialogTitle(telemetryRecords.length),
        dialogText:
          telemetryRecords.length === 1
            ? TelemetryTableI18N.removeSingleRecordDialogText
            : TelemetryTableI18N.removeMultipleRecordsDialogText,
        yesButtonProps: {
          color: 'error',
          loading: false
        },
        yesButtonLabel:
          telemetryRecords.length === 1
            ? TelemetryTableI18N.removeSingleRecordButtonText
            : TelemetryTableI18N.removeMultipleRecordsButtonText,
        noButtonProps: { color: 'primary', variant: 'outlined', disabled: false },
        noButtonLabel: 'Cancel',
        open: true,
        onYes: () => {
          _commitDeleteRecords(telemetryRecords);
        },
        onClose: () => dialogContext.setYesNoDialog({ open: false }),
        onNo: () => dialogContext.setYesNoDialog({ open: false })
      });
    },
    [_commitDeleteRecords, dialogContext]
  );

  const deleteSelectedRecords = useCallback(() => {
    const selectedRecords = _getSelectedRecords();
    if (!selectedRecords.length) {
      return;
    }

    deleteRecords(selectedRecords);
  }, [deleteRecords, _getSelectedRecords]);

  /**
   * Add a new empty record to the data grid.
   */
  const addRecord = useCallback(() => {
    const id = uuidv4();

    const newRecord: IManualTelemetryTableRow = {
      id,
      deployment_id: '',
      latitude: '' as unknown as number,
      longitude: '' as unknown as number,
      date: '',
      time: '',
      telemetry_type: 'MANUAL'
    };

    // Append new record to initial rows
    setRows([newRecord, ...rows]);

    _stagedRowIds.current = [..._stagedRowIds.current, id];

    // Set edit mode for the new row
    _updateRowsMode([id], GridRowModes.Edit, false);
  }, [rows, _updateRowsMode]);

  const revertRecords = useCallback(() => {
    // Revert any current edits
    _updateRowsMode(_modifiedRowIds.current, GridRowModes.View, false);

    // Remove any rows that are newly created
    setRows(rows.filter((row) => !_stagedRowIds.current.includes(String(row.id))));

    // Clear the validation from the table
    setValidationModel({});

    // Reset the refs
    _modifiedRowIds.current = [];
    _stagedRowIds.current = [];
  }, [rows, _updateRowsMode, _modifiedRowIds]);

  /**
   * Send all telemetry rows to the backend.
   */
  const _saveRecords = useCallback(
    async (rowsToSave: GridValidRowModel[]) => {
      try {
        const createData: ICreateManualTelemetry[] = [];
        const updateData: IUpdateManualTelemetry[] = [];
        // loop through records and decide based on initial data loaded if a record should be created or updated
        (rowsToSave as IManualTelemetryTableRow[]).forEach((item) => {
          if (item.telemetry_type === 'MANUAL') {
            const found = telemetryDataContext.telemetryDataLoader.data?.find(
              (search) => search.telemetry_manual_id === item.id
            );
            if (found) {
              // existing ID found, update record
              updateData.push({
                telemetry_manual_id: String(item.id),
                latitude: Number(item.latitude),
                longitude: Number(item.longitude),
                acquisition_date: dayjs(`${dayjs(item.date).format('YYYY-MM-DD')} ${item.time}`).format(
                  'YYYY-MM-DD HH:mm:ss'
                )
              });
            } else {
              // nothing found, create a new record
              createData.push({
                deployment_id: String(item.deployment_id),
                latitude: Number(item.latitude),
                longitude: Number(item.longitude),
                acquisition_date: dayjs(`${dayjs(item.date).format('YYYY-MM-DD')} ${item.time}`).format(
                  'YYYY-MM-DD HH:mm:ss'
                )
              });
            }
          }
        });

        if (createData.length) {
          await telemetryApi.createManualTelemetry(createData);
        }

        if (updateData.length) {
          await telemetryApi.updateManualTelemetry(updateData);
        }

        revertRecords();

        dialogContext.setSnackbar({
          snackbarMessage: (
            <Typography variant="body2" component="div">
              {TelemetryTableI18N.saveRecordsSuccessSnackbarMessage}
            </Typography>
          ),
          open: true
        });

        return refreshRecords();
      } catch (error) {
        _updateRowsMode(_modifiedRowIds.current, GridRowModes.Edit, true);
        const apiError = error as APIError;
        dialogContext.setErrorDialog({
          onOk: () => dialogContext.setErrorDialog({ open: false }),
          onClose: () => dialogContext.setErrorDialog({ open: false }),
          dialogTitle: TelemetryTableI18N.submitRecordsErrorDialogTitle,
          dialogText: TelemetryTableI18N.submitRecordsErrorDialogText,
          dialogErrorDetails: apiError.errors,
          open: true
        });
      } finally {
        _isSavingData.current = false;
      }
    },
    [dialogContext, _updateRowsMode, _isSavingData, revertRecords, refreshRecords]
  );

  /**
   * Transition all editable rows from edit mode to view mode.
   */
  const saveRecords = useCallback(async () => {
    _isSavingData.current = true;

    // Validate rows
    const validationErrors = _validateRows();

    if (validationErrors) {
      _isSavingData.current = false;
      return;
    }

    const idsToSave = getMutatedIds();

    if (!idsToSave) {
      // No rows in edit mode, nothing to stop or save
      _isSavingData.current = false;
      return;
    }

    const rowsToSave = _getModifiedRows();

    await _saveRecords(rowsToSave);
  }, [_validateRows, getMutatedIds, _getModifiedRows, _saveRecords]);

  useEffect(() => {
    // Begin fetching telemetry once we have deployments ids
    if (deployment_ids.length) {
      refreshRecords();
    }
  }, [deployment_ids, refreshRecords]);

  // /**
  //  * Runs when row records are being saved and transitioned from Edit mode to View mode.
  //  */
  // useEffect(() => {
  //   // Data grid is not fully initialized
  //   if (!_muiDataGridApiRef?.current?.getRowModels) return;
  //
  //   // Stop edit mode not in progress, cannot save yet
  //   if (!_isStoppingEdit.current) return;
  //
  //   // Modified row ids
  //   const modifiedRowIds = _modifiedRowIds.current;
  //
  //   // No rows to save
  //   if (!modifiedRowIds.length) return;
  //
  //   // Saving already in progress
  //   if (_isSavingData.current) return;
  //
  //   // Not all rows have transitioned to view mode, cannot save yet
  //   if (modifiedRowIds.some((id) => _muiDataGridApiRef.current.getRowMode(id) === 'edit')) return;
  //
  //   // Start saving records
  //   _isSavingData.current = true;
  //
  //   // All rows have transitioned to view mode
  //   _isStoppingEdit.current = false;
  //
  //   const rowModels = _muiDataGridApiRef.current.getRowModels();
  //   const rowValues = Array.from(rowModels, ([_, value]) => value);
  //
  //   _saveRecords(rowValues);
  // }, [_muiDataGridApiRef, _saveRecords, _modifiedRowIds, _isSavingData, _isStoppingEdit]);

  //}, [_muiDataGridApiRef, _saveRecords, _isSavingData, _isStoppingEdit, _modifiedRowIds]);
  const telemetryTableContext: ITelemetryTableContext = useMemo(
    () => ({
      _muiDataGridApiRef,
      rows,
      setRows,
      getColumns,
      addRecord,
      hasError,
      saveRecords,
      deleteRecords,
      deleteSelectedRecords,
      revertRecords,
      refreshRecords,
      hasUnsavedChanges,
      rowSelectionModel,
      onRowSelectionModelChange: setRowSelectionModel,
      rowModesModel,
      onRowModesModelChange: setRowModesModel,
      isLoading,
      isSaving: _isSavingData.current,
      validationModel,
      recordCount
      //setRecordCount
    }),
    [
      _muiDataGridApiRef,
      rows,
      rowModesModel,
      hasError,
      getColumns,
      addRecord,
      saveRecords,
      deleteRecords,
      deleteSelectedRecords,
      revertRecords,
      refreshRecords,
      hasUnsavedChanges,
      rowSelectionModel,
      isLoading,
      validationModel,
      recordCount
    ]
  );

  return <TelemetryTableContext.Provider value={telemetryTableContext}>{children}</TelemetryTableContext.Provider>;
};
