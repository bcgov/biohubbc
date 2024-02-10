import Typography from '@mui/material/Typography';
import { GridRowId, GridRowSelectionModel, GridValidRowModel, useGridApiRef } from '@mui/x-data-grid';
import { GridApiCommunity, GridStateColDef } from '@mui/x-data-grid/internals';
import { TelemetryTableI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { default as dayjs } from 'dayjs';
import { APIError } from 'hooks/api/useAxios';
import { ICreateManualTelemetry, IUpdateManualTelemetry, useTelemetryApi } from 'hooks/useTelemetryApi';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  getSelectedRecords: () => IManualTelemetryTableRow[];
  /**
   * Indicates whether the telemetry table has any unsaved changes
   */
  hasUnsavedChanges: boolean;
  /**
   * Callback that should be called when a row enters edit mode.
   */
  onRowEditStart: (id: GridRowId) => void;
  /**
   * The IDs of the selected telemetry table rows
   */
  rowSelectionModel: GridRowSelectionModel;
  /**
   * Sets the IDs of the selected telemetry table rows
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
  validationModel: TelemetryTableValidationModel;
  /**
   * Reflects the total count of telemetry records for the survey
   */
  recordCount: number;
  /**
   * Updates the total telemetry count for the survey
   */
  setRecordCount: (count: number) => void;
};

export const TelemetryTableContext = createContext<ITelemetryTableContext>({
  _muiDataGridApiRef: null as unknown as React.MutableRefObject<GridApiCommunity>,
  rows: [],
  setRows: () => {},
  getColumns: () => [],
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

interface ITelemetryTableContextProviderProps {
  deployment_ids: string[];
  children?: React.ReactNode;
}

export const TelemetryTableContextProvider: React.FC<ITelemetryTableContextProviderProps> = (props) => {
  const { children, deployment_ids } = props;

  const _muiDataGridApiRef = useGridApiRef();

  const telemetryApi = useTelemetryApi();

  const telemetryDataContext = useContext(TelemetryDataContext);
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
  const [isStoppingEdit, setIsStoppingEdit] = useState(false);
  // True if the records are in the process of being saved to the server
  const [isCurrentlySaving, setIsCurrentlySaving] = useState(false);
  // Stores the current count of telemetry records for this survey
  const [recordCount, setRecordCount] = useState<number>(0);
  // Stores the current validation state of the table
  const [validationModel, setValidationModel] = useState<TelemetryTableValidationModel>({});

  /**
   * Gets all rows from the table, including values that have been edited in the table.
   */
  const _getRowsWithEditedValues = useCallback((): IManualTelemetryTableRow[] => {
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
  }, [_muiDataGridApiRef]);

  /**
   * Returns all columns belonging to thte telemetry table.
   */
  const getColumns = useCallback(() => {
    return _muiDataGridApiRef.current.getAllColumns?.() ?? [];
  }, [_muiDataGridApiRef]);

  /**
   * Validates all rows belonging to the table. Returns null if validation passes, otherwise
   * returns the validation model
   */
  const _validateRows = useCallback((): TelemetryTableValidationModel | null => {
    const rowValues = _getRowsWithEditedValues();
    const tableColumns = getColumns();

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
  }, [_getRowsWithEditedValues, getColumns]);

  useEffect(() => {
    setRecordCount(rows.length);
  }, [rows]);

  const _commitDeleteRecords = useCallback(
    async (telemetryRecords: IManualTelemetryTableRow[]): Promise<void> => {
      if (!telemetryRecords.length) {
        return;
      }

      const allRowIdsToDelete = telemetryRecords.map((item) => String(item.id));

      // Get all row ids that are new, which only need to be removed from local state
      const addedRowIdsToDelete = allRowIdsToDelete.filter((id) => addedRowIds.includes(id));

      // Get all row ids that are not new, which need to be deleted from the server
      const modifiedRowIdsToDelete = allRowIdsToDelete.filter((id) => !addedRowIds.includes(id));

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
        setAddedRowIds((current) => current.filter((id) => !addedRowIdsToDelete.includes(id)));

        // Updated editing rows, removing deleted rows
        setModifiedRowIds((current) => current.filter((id) => !allRowIdsToDelete.includes(id)));

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
    [addedRowIds, dialogContext, telemetryApi]
  );

  const getSelectedRecords: () => IManualTelemetryTableRow[] = useCallback(() => {
    if (!_muiDataGridApiRef?.current?.getRowModels) {
      // Data grid is not fully initialized
      return [];
    }

    const rowValues = Array.from(_muiDataGridApiRef.current.getRowModels(), ([_, value]) => value);
    return rowValues.filter((row): row is IManualTelemetryTableRow =>
      rowSelectionModel.includes((row as IManualTelemetryTableRow).id)
    );
  }, [_muiDataGridApiRef, rowSelectionModel]);

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
    const selectedRecords = getSelectedRecords();
    if (!selectedRecords.length) {
      return;
    }

    deleteRecords(selectedRecords);
  }, [deleteRecords, getSelectedRecords]);

  const onRowEditStart = (id: GridRowId) => {
    setModifiedRowIds((current) => Array.from(new Set([...current, String(id)])));
  };

  /**
   * Add a new empty record to the data grid.
   */
  const addRecord = useCallback(() => {
    const id = uuidv4();

    const newRecord: IManualTelemetryTableRow = {
      id,
      deployment_id: '',
      latitude: null as unknown as number,
      longitude: null as unknown as number,
      date: '',
      time: '',
      telemetry_type: 'MANUAL'
    };

    // Append new record to initial rows
    setRows([...rows, newRecord]);

    setAddedRowIds((current) => [...current, id]);

    // Set edit mode for the new row
    _muiDataGridApiRef.current.startRowEditMode({ id, fieldToFocus: 'wldtaxonomic_units' });
  }, [_muiDataGridApiRef, rows]);

  /**
   * Transition all editable rows from edit mode to view mode.
   */
  const saveRecords = useCallback(() => {
    if (isStoppingEdit) {
      // Stop edit mode already in progress
      return;
    }

    // Validate rows
    const validationErrors = _validateRows();

    if (validationErrors) {
      return;
    }

    setIsStoppingEdit(true);

    // Collect the ids of all rows in edit mode
    const allEditingIds = Object.keys(_muiDataGridApiRef.current.state.editRows);

    // Remove any row ids that the data grid might still be tracking, but which have been removed from local state
    const editingIdsToSave = allEditingIds.filter((id) => rows.find((row) => String(row.id) === id));

    if (!editingIdsToSave.length) {
      // No rows in edit mode, nothing to stop or save
      setIsStoppingEdit(false);
      return;
    }

    // Transition all rows in edit mode to view mode
    for (const id of editingIdsToSave) {
      _muiDataGridApiRef.current.stopRowEditMode({ id });
    }

    // Store ids of rows that were in edit mode
    setModifiedRowIds(editingIdsToSave);
  }, [_muiDataGridApiRef, _validateRows, isStoppingEdit, rows]);

  /**
   * Transition all rows tracked by `modifiedRowIds` to view mode.
   */
  const _revertAllRowsEditMode = useCallback(() => {
    modifiedRowIds.forEach((id) => _muiDataGridApiRef.current.startRowEditMode({ id }));
  }, [_muiDataGridApiRef, modifiedRowIds]);

  const revertRecords = useCallback(() => {
    // Mark all rows as saved
    setModifiedRowIds([]);
    setAddedRowIds([]);

    // Revert any current edits
    const editingIds = Object.keys(_muiDataGridApiRef.current.state.editRows);
    editingIds.forEach((id) => _muiDataGridApiRef.current.stopRowEditMode({ id, ignoreModifications: true }));

    // Remove any rows that are newly created
    setRows(rows.filter((row) => !addedRowIds.includes(String(row.id))));
  }, [_muiDataGridApiRef, addedRowIds, rows]);

  const refreshRecords = useCallback(async () => {
    if (telemetryDataContext.telemetryDataLoader.isReady) {
      telemetryDataContext.telemetryDataLoader.refresh(deployment_ids);
    }
  }, [telemetryDataContext.telemetryDataLoader]);

  // True if the data grid contains at least 1 unsaved record
  const hasUnsavedChanges = modifiedRowIds.length > 0 || addedRowIds.length > 0;

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

        setModifiedRowIds([]);
        setAddedRowIds([]);

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
        _revertAllRowsEditMode();
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
        setIsCurrentlySaving(false);
      }
    },
    [dialogContext, refreshRecords, _revertAllRowsEditMode]
  );

  const isLoading: boolean = useMemo(() => {
    return telemetryDataContext.telemetryDataLoader.isLoading;
  }, [telemetryDataContext.telemetryDataLoader.isLoading]);

  const isSaving: boolean = useMemo(() => {
    return isCurrentlySaving || isStoppingEdit;
  }, [isCurrentlySaving, isStoppingEdit]);

  useEffect(() => {
    // Begin fetching telemetry once we have deployments ids
    if (deployment_ids.length) {
      telemetryDataContext.telemetryDataLoader.load(deployment_ids);
    }
  }, [deployment_ids]);

  /**
   * Runs when telemetry context data has changed. This does not occur when records are
   * deleted; Only on initial page load, and whenever records are saved.
   */
  useEffect(() => {
    if (telemetryDataContext.telemetryDataLoader.isLoading) {
      // Existing telemetry records have not yet loaded
      return;
    }

    // Collect rows from the telemetry data loader
    const totalTelemetry = telemetryDataContext.telemetryDataLoader.data ?? [];

    const rows: IManualTelemetryTableRow[] = totalTelemetry.map((item) => {
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

    // Set initial record count
    setRecordCount(rows.length);
  }, [telemetryDataContext.telemetryDataLoader.isLoading]);

  /**
   * Runs when row records are being saved and transitioned from Edit mode to View mode.
   */
  useEffect(() => {
    if (!_muiDataGridApiRef?.current?.getRowModels) {
      // Data grid is not fully initialized
      return;
    }

    if (!isStoppingEdit) {
      // Stop edit mode not in progress, cannot save yet
      return;
    }

    if (!modifiedRowIds.length) {
      // No rows to save
      return;
    }

    if (isCurrentlySaving) {
      // Saving already in progress
      return;
    }

    if (modifiedRowIds.some((id) => _muiDataGridApiRef.current.getRowMode(id) === 'edit')) {
      // Not all rows have transitioned to view mode, cannot save yet
      return;
    }

    // All rows have transitioned to view mode
    setIsStoppingEdit(false);

    // Start saving records
    setIsCurrentlySaving(true);

    const rowModels = _muiDataGridApiRef.current.getRowModels();
    const rowValues = Array.from(rowModels, ([_, value]) => value);

    _saveRecords(rowValues);
  }, [_muiDataGridApiRef, _saveRecords, isCurrentlySaving, isStoppingEdit, modifiedRowIds]);

  const telemetryTableContext: ITelemetryTableContext = useMemo(
    () => ({
      _muiDataGridApiRef,
      rows,
      setRows,
      getColumns,
      addRecord,
      saveRecords,
      deleteRecords,
      deleteSelectedRecords,
      revertRecords,
      refreshRecords,
      getSelectedRecords,
      hasUnsavedChanges,
      onRowEditStart,
      rowSelectionModel,
      onRowSelectionModelChange: setRowSelectionModel,
      isLoading,
      isSaving,
      validationModel,
      recordCount,
      setRecordCount
    }),
    [
      _muiDataGridApiRef,
      rows,
      getColumns,
      addRecord,
      saveRecords,
      deleteRecords,
      deleteSelectedRecords,
      revertRecords,
      refreshRecords,
      getSelectedRecords,
      hasUnsavedChanges,
      rowSelectionModel,
      isLoading,
      isSaving,
      validationModel,
      recordCount
    ]
  );

  return <TelemetryTableContext.Provider value={telemetryTableContext}>{children}</TelemetryTableContext.Provider>;
};
