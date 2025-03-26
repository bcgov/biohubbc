import Typography from '@mui/material/Typography';
import {
  GridCellParams,
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowSelectionModel,
  GridSortModel,
  GridValidRowModel,
  useGridApiRef
} from '@mui/x-data-grid';
import { GridApiCommunity, GridStateColDef } from '@mui/x-data-grid/internals';
import { RowValidationError, TableValidationModel } from 'components/data-grid/DataGridValidationAlert';
import { TelemetryTableI18N } from 'constants/i18n';
import { SIMS_TELEMETRY_HIDDEN_COLUMNS } from 'constants/session-storage';
import { default as dayjs } from 'dayjs';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { usePersistentState } from 'hooks/usePersistentState';
import { GetSurveyTelemetryResponse } from 'interfaces/useTelemetryApi.interface';
import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import { v4 as uuidv4 } from 'uuid';

export const MANUAL_TELEMETRY_TYPE = 'manual';

export interface IManualTelemetryRecord {
  deployment_id: number;
  serial: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  time: string;
  telemetry_type: string;
}

export interface IManualTelemetryTableRow extends Partial<IManualTelemetryRecord> {
  id: GridRowId;
}

export type TelemetryTableValidationModel = TableValidationModel<IManualTelemetryTableRow>;
export type TelemetryRowValidationError = RowValidationError<IManualTelemetryTableRow>;

export type IAllTelemetryTableContext = {
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
   * Indicates if the data is in the process of being persisted to the server.
   */
  isSaving: boolean;
  /**
   * Indicates whether or not content in the telemetry table is loading.
   */
  isLoading: boolean;
  /**
   * Indicates whether the telemetry table has any unsaved changes
   */
  hasUnsavedChanges: boolean;
  /**
   * Reflects the total count of telemetry records for the survey
   */
  recordCount: number;
  /**
   * The pagination model, which defines which telemetry records to fetch and load in the table.
   */
  paginationModel: GridPaginationModel;
  /**
   * Sets the pagination model.
   */
  setPaginationModel: (model: GridPaginationModel) => void;
  /**
   * The sort model, which defines how the telemetry records should be sorted.
   */
  sortModel: GridSortModel;
  /**
   * Sets the sort model.
   */
  setSortModel: (mode: GridSortModel) => void;
  /**
   * Columns hidden from table view
   */
  hiddenColumns: string[];
  /**
   * Returns all columns belonging to the telemetry table
   */
  getColumns: (config?: { hideable: boolean }) => GridStateColDef[];
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
  refreshRecords: () => Promise<GetSurveyTelemetryResponse | undefined>;
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
   * Callback when row model changes ie: 'Edit' -> 'View'
   *
   */
  onRowModesModelChange: (model: GridRowModesModel) => void;
  /**
   * The state of the validation model
   */
  validationModel: TelemetryTableValidationModel;
  /**
   * Indicates whether the cell has an error.
   */
  hasError: (params: GridCellParams) => boolean;
  /**
   * The column visibility model, which defines which columns are visible
   */
  columnVisibilityModel: GridColumnVisibilityModel;
  /**
   * Callback fired when column visibility model changes
   */
  onColumnVisibilityModelChange: (model: GridColumnVisibilityModel) => void;
  /**
   * Toggle columns visibility - no config will toggle all columns
   */
  toggleColumnsVisibility: (config?: { columns: string[] }) => void;
  /**
   * Callback fired when row goes into edit mode.
   */
  onRowEditStart: (id: GridRowId) => void;
};

export const TelemetryTableContext = createContext<IAllTelemetryTableContext | undefined>(undefined);

type IAllTelemetryTableContextProviderProps = PropsWithChildren;

export const TelemetryTableContextProvider = (props: IAllTelemetryTableContextProviderProps) => {
  const { children } = props;

  const _muiDataGridApiRef = useGridApiRef();

  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();

  const telemetryDataLoader = useDataLoader((pagination?: ApiPaginationRequestOptions) =>
    biohubApi.telemetry.getTelemetryForSurvey(surveyContext.projectId, surveyContext.surveyId, pagination)
  );

  const {
    data: telemetryData,
    isLoading: isLoadingTelemetryData,
    hasLoaded: hasLoadedTelemetryData,
    refresh: refreshTelemetryData
  } = telemetryDataLoader;

  // The data grid rows
  const [rows, setRows] = useState<IManualTelemetryTableRow[]>([]);

  // Stores the currently selected row ids
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);

  // The row modes model, which defines which rows are in edit mode
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  // Stores the current validation state of the table
  const [validationModel, setValidationModel] = useState<TelemetryTableValidationModel>({});

  // Stores the column visibility state in local storage
  const [columnVisibilityModel, setColumnVisibilityModel] = usePersistentState<GridColumnVisibilityModel>(
    SIMS_TELEMETRY_HIDDEN_COLUMNS,
    {}
  );

  // New rows (regardless of mode)
  const _stagedRowIds = useRef<string[]>([]);

  // New rows (regardless of mode)
  const _modifiedRowIds = useRef<string[]>([]);

  // True if the records are in the process of being saved to the server
  const _isSavingData = useRef(false);

  // Count of table records
  const recordCount = telemetryData?.count ?? 0;

  // Pagination model
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25
  });

  // Sort model
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'date', sort: 'desc' }]);

  // True if table has unsaved changes, deferring value to prevent ui issue with controls rendering
  const hasUnsavedChanges = _modifiedRowIds.current.length > 0 || _stagedRowIds.current.length > 0;

  // Columns hidden from table view
  const hiddenColumns = useMemo(() => {
    const columns = Object.keys(columnVisibilityModel);
    return columns.filter((column) => !columnVisibilityModel[column]);
  }, [columnVisibilityModel]);

  /**
   * Get ids that have been edited, staged or modified
   *
   * @returns {string[]} Row ids
   */
  const _getEditedIds = useCallback(
    () => [..._modifiedRowIds.current, ..._stagedRowIds.current],
    [_modifiedRowIds, _stagedRowIds]
  );

  /**
   * Get all table columns or hideable columns
   *
   * @param {{hideable: boolean}} [config] Only return hideable columns
   * @returns {GridStateColDef[]} Table columns
   */
  const getColumns = useCallback(
    (config?: { hideable: boolean }) => {
      const nonHideableColumns = ['actions', '__check__'];
      const columns = _muiDataGridApiRef.current.getAllColumns?.() ?? [];
      return config?.hideable ? columns.filter((column) => !nonHideableColumns.includes(column.field)) : columns;
    },
    [_muiDataGridApiRef]
  );

  /**
   * Gets all rows from the table that have been edited
   *
   * @returns {IManualTelemetryTableRow[]} Edited rows.
   */
  const _getEditedRows = useCallback(
    (rowIds?: string[]): IManualTelemetryTableRow[] => {
      const editRows: IManualTelemetryTableRow[] = [];
      const idsToSave = rowIds ?? _getEditedIds();

      for (const id of idsToSave) {
        const editRow = _muiDataGridApiRef.current.state.editRows[id];

        if (editRow) {
          const newRow: Record<string, any> = { id };
          for (const [key, value] of Object.entries(editRow)) {
            newRow[key] = value.value;
          }

          editRows.push(newRow as IManualTelemetryTableRow);
        }
      }

      return editRows;
    },
    [_getEditedIds, _muiDataGridApiRef]
  );

  /**
   * Get selected records via individual selection or bulk
   *
   * @returns {IManualTelemetryTableRow[]} Table rows.
   */
  const _getSelectedRows: () => IManualTelemetryTableRow[] = useCallback(() => {
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
   * Toggle the table columns visibility
   * Passing no columns in config will toggle ALL columns visibility
   *
   * @param {{columns: string[]}} [config] - Array of columns to hide
   * @returns {void}
   */
  const toggleColumnsVisibility = useCallback(
    (config?: { columns: string[] }) => {
      let updatedVisibilityModel = { ...columnVisibilityModel };

      const tableColumns = getColumns({ hideable: true }).map((column) => column.field);

      // If specific columns are passed to hide, toggle their visibility
      if (config?.columns) {
        config.columns.forEach((column) => {
          updatedVisibilityModel[column] =
            updatedVisibilityModel[column] === undefined ? false : !updatedVisibilityModel[column];
        });
      } else {
        // If no specific columns are passed, toggle visibility of all columns
        const areAllColumnsVisible = Object.values(columnVisibilityModel).every((isVisible) => isVisible);
        updatedVisibilityModel = Object.fromEntries(tableColumns.map((column) => [column, !areAllColumnsVisible]));
      }
      setColumnVisibilityModel(updatedVisibilityModel);
    },
    [columnVisibilityModel, getColumns, setColumnVisibilityModel]
  );

  /**
   * Update edit or view state of table rows
   *
   * @param {string[]} rowIds - Row ids to modify
   * @param {GirdRowModes} mode - Mode to change to ie: View or Edit
   * @param {boolean} keepChanges - Indicator to keep or remove changes
   * @returns {void}
   */
  const _updateRowsMode = useCallback(
    (rowIds: string[], mode: GridRowModes, keepChanges: boolean) => {
      setRowModesModel((prevModel) => {
        const newModel: GridRowModesModel = { ...prevModel };
        for (const id of rowIds) {
          newModel[id] = { mode, ignoreModifications: !keepChanges };
        }
        return newModel;
      });
    },
    [setRowModesModel]
  );

  /**
   * Checks if the cell has error.
   *
   * @returns {boolean}
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
   * Puts the specified row into edit mode, and adds the row id to the array of modified rows.
   *
   * @param {GridRowId} id
   */
  const onRowEditStart = useCallback((id: GridRowId) => {
    // Add row to modified rows array
    _modifiedRowIds.current = Array.from(new Set([..._modifiedRowIds.current, String(id)]));
  }, []);

  /**
   * Validates all edited rows of table.
   *
   * @returns {TelemetryTableValidationModel | null} Validation model or null (if passes validation)
   */
  const _validateRows = useCallback((): TelemetryTableValidationModel | null => {
    const tableColumns = getColumns();
    const rowValues = _getEditedRows();

    const requiredColumnsSet: Set<keyof IManualTelemetryTableRow> = new Set([
      'deployment_id',
      'latitude',
      'longitude',
      'date',
      'time'
    ]);

    const validation = rowValues.reduce((tableModel: TelemetryTableValidationModel, row: IManualTelemetryTableRow) => {
      const rowErrors: TelemetryRowValidationError[] = [];

      // Validate missing required fields
      tableColumns.forEach((column) => {
        const field = column.field as keyof IManualTelemetryTableRow;
        if (requiredColumnsSet.has(field) && !row[field]) {
          rowErrors.push({ field, message: `Missing column: ${column.headerName ?? field}` });
        }
      });

      // Validate date value
      if (row.date && !dayjs(row.date).isValid()) {
        rowErrors.push({ field: 'date', message: 'Invalid date' });
      }

      // Validate time value
      if (row.time === 'Invalid date') {
        rowErrors.push({ field: 'time', message: 'Invalid time' });
      }

      // Validate latitude
      if (String(row.latitude) === String(0)) {
        rowErrors.push({ field: 'latitude', message: 'Invalid latitude' });
      }

      // Validate longitude
      if (String(row.longitude) === String(0)) {
        rowErrors.push({ field: 'longitude', message: 'Invalid longitude' });
      }

      if (rowErrors.length > 0) {
        tableModel[row.id] = rowErrors;
      }

      return tableModel;
    }, {});

    setValidationModel(validation);

    return Object.keys(validation).length > 0 ? validation : null;
  }, [getColumns, _getEditedRows]);

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
          await biohubApi.telemetry.deleteManualTelemetry(
            surveyContext.projectId,
            surveyContext.surveyId,
            modifiedRowIdsToDelete
          );
        }

        // Remove row IDs from validation model
        setValidationModel((prevValidationModel) => {
          const newValidationModel = { ...prevValidationModel };
          for (const id of allRowIdsToDelete) {
            delete newValidationModel[id];
          }
          return newValidationModel;
        });

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
    [biohubApi.telemetry, dialogContext, surveyContext.projectId, surveyContext.surveyId]
  );

  /**
   * Delete records from table
   *
   * @param {IManualTelemetryTableRow[]} telemetryRecords - Records to delete
   * @returns {void}
   */
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

  /**
   * Delete the selected records
   *
   * @returns {void}
   */
  const deleteSelectedRecords = useCallback(() => {
    const selectedRecords = _getSelectedRows();
    if (!selectedRecords.length) {
      return;
    }

    deleteRecords(selectedRecords);
  }, [deleteRecords, _getSelectedRows]);

  /**
   * Stage a new empty record to the data grid
   *
   * @returns {void}
   */
  const addRecord = useCallback(() => {
    const id = uuidv4();

    const newRecord: IManualTelemetryTableRow = {
      id,
      deployment_id: '' as unknown as number,
      latitude: '' as unknown as number, // empty strings to satisfy text fields
      longitude: '' as unknown as number,
      date: '',
      time: '',
      telemetry_type: MANUAL_TELEMETRY_TYPE
    };

    // Append new record to initial rows
    setRows([newRecord, ...rows]);

    _stagedRowIds.current = [..._stagedRowIds.current, id];

    // Set edit mode for the new row
    _updateRowsMode([id], GridRowModes.Edit, false);
  }, [rows, _updateRowsMode]);

  /**
   * Revert all table changes
   *
   * @returns {void}
   */
  const revertRecords = useCallback(() => {
    // Remove any rows that are newly created
    setRows(rows.filter((row) => !_stagedRowIds.current.includes(String(row.id))));

    // Clear the validation from the table
    setValidationModel({});

    // Revert any current edits
    _updateRowsMode(_modifiedRowIds.current, GridRowModes.View, false);

    // Reset the refs
    _modifiedRowIds.current = [];
    _stagedRowIds.current = [];
  }, [rows, _updateRowsMode, _modifiedRowIds]);

  /**
   * Refreshes the observations table with the latest records from the server.
   *
   * @return {*}
   */
  const refreshTelemetryRecords = useCallback(async () => {
    const sort = firstOrNull(sortModel);

    let sortField = sort?.field;

    // Convert frontend column names to the backend column names supported by the api
    if (sortField === 'date') {
      sortField = 'acquisition_date';
    } else if (sortField === 'time') {
      sortField = 'acquisition_time';
    } else if (sortField === 'telemetry_type') {
      sortField = 'vendor';
    }

    return refreshTelemetryData({
      limit: paginationModel.pageSize,
      sort: sortField || undefined,
      order: sort?.sort || undefined,

      // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
      page: paginationModel.page + 1
    });
  }, [paginationModel.page, paginationModel.pageSize, refreshTelemetryData, sortModel]);

  /**
   * Dispatches update and create requests to SIMS
   *
   * @param {GridValidRowModel[]} createRows - Rows to create
   * @param {GridValidRowModel[]} updateRows - Rows to update
   * @returns {Promise<void>}
   */
  const _saveRecords = useCallback(
    async (createRows: GridValidRowModel[], updateRows: GridValidRowModel[]) => {
      try {
        // create a new records
        const createData = createRows.map((row) => ({
          deployment_id: row.deployment_id,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          acquisition_date: dayjs(`${row.date}T${row.time}`).toISOString(),
          transmission_date: null
        }));

        // update existing records
        const updateData = updateRows.map((row) => ({
          telemetry_manual_id: String(row.id),
          deployment_id: row.deployment_id,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          acquisition_date: dayjs(`${row.date}T${row.time}`).toISOString(),
          transmission_date: null
        }));

        if (createData.length) {
          await biohubApi.telemetry.createManualTelemetry(surveyContext.projectId, surveyContext.surveyId, createData);
        }

        if (updateData.length) {
          await biohubApi.telemetry.updateManualTelemetry(surveyContext.projectId, surveyContext.surveyId, updateData);
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

        return refreshTelemetryRecords();
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
    [
      _updateRowsMode,
      biohubApi.telemetry,
      dialogContext,
      refreshTelemetryRecords,
      revertRecords,
      surveyContext.projectId,
      surveyContext.surveyId
    ]
  );

  /**
   * Callback to save the edited and staged records
   *
   * @async
   * @returns {Promise<void>}
   */
  const saveRecords = useCallback(async () => {
    _isSavingData.current = true;

    // Validate rows
    const validationErrors = _validateRows();

    if (validationErrors) {
      _isSavingData.current = false;
      return;
    }

    const idsToSave = _getEditedIds();

    if (!idsToSave) {
      // No rows in edit mode, nothing to stop or save
      _isSavingData.current = false;
      return;
    }

    const newRows = _getEditedRows(_stagedRowIds.current);
    const updateRows = _getEditedRows(_modifiedRowIds.current);

    await _saveRecords(newRows, updateRows);
  }, [_validateRows, _getEditedIds, _getEditedRows, _saveRecords]);

  /**
   * Fetch new rows based on sort/ pagination model changes
   */
  useEffect(() => {
    refreshTelemetryRecords();
    // Should not re-run this effect on `refreshTelemetryRecords` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel, sortModel]);

  /**
   * Parse the telemetry data to the table format and set the rows.
   *
   */
  useEffect(() => {
    if (!hasLoadedTelemetryData) {
      // Existing telemetry records have not yet loaded
      return;
    }

    if (!telemetryData?.telemetry) {
      // Existing telemetry data doesn't exist
      return;
    }

    const rows: IManualTelemetryTableRow[] = telemetryData.telemetry.map((item) => {
      return {
        id: item.telemetry_id,
        deployment_id: item.deployment_id,
        serial: item.serial,
        latitude: item.latitude,
        longitude: item.longitude,
        date: dayjs(item.acquisition_date).format('YYYY-MM-DD'),
        time: dayjs(item.acquisition_date).format('HH:mm:ss'),
        telemetry_type: item.vendor
      };
    });

    setRows(rows);
  }, [hasLoadedTelemetryData, telemetryData]);

  const telemetryTableContext: IAllTelemetryTableContext = useMemo(
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
      refreshRecords: refreshTelemetryRecords,
      hasUnsavedChanges,
      rowSelectionModel,
      onRowSelectionModelChange: setRowSelectionModel,
      rowModesModel,
      onRowModesModelChange: setRowModesModel,
      columnVisibilityModel,
      onColumnVisibilityModelChange: setColumnVisibilityModel,
      isLoading: isLoadingTelemetryData,
      isSaving: _isSavingData.current,
      validationModel,
      recordCount,
      paginationModel,
      setPaginationModel,
      sortModel,
      setSortModel,
      toggleColumnsVisibility,
      hiddenColumns,
      onRowEditStart
    }),
    [
      _muiDataGridApiRef,
      addRecord,
      columnVisibilityModel,
      deleteRecords,
      deleteSelectedRecords,
      getColumns,
      hasError,
      hasUnsavedChanges,
      hiddenColumns,
      isLoadingTelemetryData,
      onRowEditStart,
      paginationModel,
      recordCount,
      refreshTelemetryRecords,
      revertRecords,
      rowModesModel,
      rowSelectionModel,
      rows,
      saveRecords,
      setColumnVisibilityModel,
      sortModel,
      toggleColumnsVisibility,
      validationModel
    ]
  );

  return <TelemetryTableContext.Provider value={telemetryTableContext}>{children}</TelemetryTableContext.Provider>;
};
