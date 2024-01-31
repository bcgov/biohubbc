import Typography from '@mui/material/Typography';
import { GridRowId, GridRowSelectionModel, GridValidRowModel, useGridApiRef } from '@mui/x-data-grid';
import { GridApiCommunity, GridStateColDef } from '@mui/x-data-grid/internals';
import { ObservationsTableI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { ObservationsContext } from 'contexts/observationsContext';
import { default as dayjs } from 'dayjs';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RowValidationError, TableValidationModel } from '../components/data-grid/DataGridValidationAlert';
import { SurveyContext } from './surveyContext';
import { TaxonomyContext } from './taxonomyContext';

export interface IObservationRecord {
  survey_observation_id: number;
  wldtaxonomic_units_id: number;
  survey_sample_site_id: number | null;
  survey_sample_method_id: number | null;
  survey_sample_period_id: number | null;
  count: number | null;
  observation_date: Date;
  observation_time: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ISupplementaryObservationData {
  observationCount: number;
}

export interface IObservationTableRow extends Partial<IObservationRecord> {
  id: GridRowId;
}

export type ObservationTableValidationModel = TableValidationModel<IObservationTableRow>;
export type ObservationRowValidationError = RowValidationError<IObservationTableRow>;

/**
 * Context object that provides helper functions for working with a survey observations data grid.
 *
 * @export
 * @interface IObservationsTableContext
 */
export type IObservationsTableContext = {
  /**
   * API ref used to interface with an MUI DataGrid representing the observation records
   */
  _muiDataGridApiRef: React.MutableRefObject<GridApiCommunity>;
  /**
   * The rows the data grid should render.
   */
  rows: IObservationTableRow[];
  /**
   * A setState setter for the `rows`
   */
  setRows: React.Dispatch<React.SetStateAction<IObservationTableRow[]>>;
  /**
   * Returns all columns belonging to the observation table
   */
  getColumns: () => GridStateColDef[];
  /**
   * Appends a new blank record to the observation rows
   */
  addObservationRecord: () => void;
  /**
   * Transitions all rows in edit mode to view mode and triggers a commit of all observation rows to the database.
   */
  saveObservationRecords: () => void;
  /**
   * Deletes all of the given records and removes them from the Observation table.
   */
  deleteObservationRecords: (observationRecords: IObservationTableRow[]) => void;
  /**
   * Deletes all of the currently selected records and removes them from the Observation table.
   */
  deleteSelectedObservationRecords: () => void;
  /**
   * Reverts all changes made to observation records within the Observation Table
   */
  revertObservationRecords: () => void;
  /**
   * Refreshes the Observation Table with already existing records
   */
  refreshObservationRecords: () => Promise<void>;
  /**
   * Returns all of the observation table records that have been selected
   */
  getSelectedObservationRecords: () => IObservationTableRow[];
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
   * Indicates whether or not content in the observations table is loading.
   */
  isLoading: boolean;
  /**
   * The state of the validation model
   */
  validationModel: ObservationTableValidationModel;
  /**
   * Reflects the count of total observations for the survey
   */
  observationCount: number;
  /**
   * Updates the total observation count for the survey
   */
  setObservationCount: (observationCount: number) => void;
};

export const ObservationsTableContext = createContext<IObservationsTableContext>({
  _muiDataGridApiRef: null as unknown as React.MutableRefObject<GridApiCommunity>,
  rows: [],
  setRows: () => {},
  getColumns: () => [],
  addObservationRecord: () => {},
  saveObservationRecords: () => {},
  deleteObservationRecords: () => undefined,
  deleteSelectedObservationRecords: () => undefined,
  revertObservationRecords: () => undefined,
  refreshObservationRecords: () => Promise.resolve(),
  getSelectedObservationRecords: () => [],
  hasUnsavedChanges: false,
  onRowEditStart: () => {},
  rowSelectionModel: [],
  onRowSelectionModelChange: () => {},
  isSaving: false,
  isLoading: false,
  validationModel: {},
  observationCount: 0,
  setObservationCount: () => undefined,
});

export const ObservationsTableContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const { projectId, surveyId } = useContext(SurveyContext);

  const _muiDataGridApiRef = useGridApiRef();

  const observationsContext = useContext(ObservationsContext);
  const taxonomyContext = useContext(TaxonomyContext);
  const dialogContext = useContext(DialogContext);

  const biohubApi = useBiohubApi();

  // The data grid rows
  const [rows, setRows] = useState<IObservationTableRow[]>([]);
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
  const [validationModel, setValidationModel] = useState<ObservationTableValidationModel>({});

  /**
   * Gets all rows from the table, including values that have been edited in the table.
   */
  const _getRowsWithEditedValues = (): IObservationTableRow[] => {
    const rowValues = Array.from(_muiDataGridApiRef.current.getRowModels?.()?.values()) as IObservationTableRow[];

    return rowValues.map((row) => {
      const editRow = _muiDataGridApiRef.current.state.editRows[row.id];
      if (!editRow) {
        return row;
      }

      return Object.entries(editRow).reduce(
        (newRow, entry) => ({ ...row, ...newRow, _isModified: true, [entry[0]]: entry[1].value }),
        {}
      );
    }) as IObservationTableRow[];
  };

  /**
   * Returns all columns belonging to thte observations table.
   */
  const getColumns = useCallback(() => {
    return _muiDataGridApiRef.current.getAllColumns?.() ?? [];
  }, [_muiDataGridApiRef.current.getAllColumns]);

  /**
   * Validates all rows belonging to the table. Returns null if validation passes, otherwise
   * returns the validation model
   */
  const _validateRows = (): ObservationTableValidationModel | null => {
    const rowValues = _getRowsWithEditedValues();
    const tableColumns = getColumns();

    const requiredColumns: (keyof IObservationTableRow)[] = [
      'count',
      'latitude',
      'longitude',
      'observation_date',
      'observation_time',
      'wldtaxonomic_units_id'
    ];

    const samplingRequiredColumns: (keyof IObservationTableRow)[] = [
      'survey_sample_site_id',
      'survey_sample_method_id',
      'survey_sample_period_id'
    ];

    const validation = rowValues.reduce((tableModel: ObservationTableValidationModel, row: IObservationTableRow) => {
      const rowErrors: ObservationRowValidationError[] = [];

      // Validate missing columns
      const missingColumns: Set<keyof IObservationTableRow> = new Set(requiredColumns.filter((column) => !row[column]));
      const missingSamplingColumns: (keyof IObservationTableRow)[] = samplingRequiredColumns.filter(
        (column) => !row[column]
      );

      // If an observation is not an incidental record, then all sampling columns are required.
      if (!missingSamplingColumns.includes('survey_sample_site_id')) {
        // Record is non-incidental, namely one or more of its sampling columns is non-empty.
        missingSamplingColumns.forEach((column) => missingColumns.add(column));

        if (missingColumns.has('survey_sample_site_id')) {
          // If sampling site is missing, then a sampling method may not be selected
          missingColumns.add('survey_sample_method_id');
        }

        if (missingColumns.has('survey_sample_method_id')) {
          // If sampling method is missing, then a sampling period may not be selected
          missingColumns.add('survey_sample_period_id');
        }
      }

      Array.from(missingColumns).forEach((field: keyof IObservationTableRow) => {
        const columnName = tableColumns.find((column) => column.field === field)?.headerName ?? field;
        rowErrors.push({ field, message: `Missing column: ${columnName}` });
      });

      // Validate date value
      if (row.observation_date && !dayjs(row.observation_date).isValid()) {
        rowErrors.push({ field: 'observation_date', message: 'Invalid date' });
      }

      // Validate time value
      if (row.observation_time === 'Invalid date') {
        rowErrors.push({ field: 'observation_time', message: 'Invalid time' });
      }

      if (rowErrors.length > 0) {
        tableModel[row.id] = rowErrors;
      }

      return tableModel;
    }, {});

    setValidationModel(validation);

    return Object.keys(validation).length > 0 ? validation : null;
  };

  const _deleteRecords = useCallback(
    async (observationRecords: IObservationTableRow[]): Promise<void> => {
      if (!observationRecords.length) {
        return;
      }

      const allRowIdsToDelete = observationRecords.map((item) => String(item.id));

      // Get all row ids that are new, which only need to be removed from local state
      const addedRowIdsToDelete = allRowIdsToDelete.filter((id) => addedRowIds.includes(id));

      // Get all row ids that are not new, which need to be deleted from the server
      const modifiedRowIdsToDelete = allRowIdsToDelete.filter((id) => !addedRowIds.includes(id));

      try {
        if (modifiedRowIdsToDelete.length) {
          const response = await biohubApi.observation.deleteObservationRecords(
            projectId,
            surveyId,
            modifiedRowIdsToDelete
          );
          setObservationCount(response.supplementaryObservationData.observationCount);
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
              {observationRecords.length === 1
                ? ObservationsTableI18N.deleteSingleRecordSuccessSnackbarMessage
                : ObservationsTableI18N.deleteMultipleRecordSuccessSnackbarMessage(observationRecords.length)}
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
          dialogTitle: ObservationsTableI18N.removeRecordsErrorDialogTitle,
          dialogText: ObservationsTableI18N.removeRecordsErrorDialogText,
          open: true
        });
      }
    },
    [addedRowIds, dialogContext, biohubApi.observation, projectId, surveyId]
  );

  const getSelectedObservationRecords: () => IObservationTableRow[] = useCallback(() => {
    if (!_muiDataGridApiRef?.current?.getRowModels) {
      // Data grid is not fully initialized
      return [];
    }

    const rowValues = Array.from(_muiDataGridApiRef.current.getRowModels(), ([_, value]) => value);
    return rowValues.filter((row): row is IObservationTableRow =>
      rowSelectionModel.includes((row as IObservationTableRow).id)
    );
  }, [_muiDataGridApiRef, rowSelectionModel]);

  const deleteObservationRecords = useCallback(
    (observationRecords: IObservationTableRow[]) => {
      if (!observationRecords.length) {
        return;
      }

      dialogContext.setYesNoDialog({
        dialogTitle:
          observationRecords.length === 1
            ? ObservationsTableI18N.removeSingleRecordDialogTitle
            : ObservationsTableI18N.removeMultipleRecordsDialogTitle(observationRecords.length),
        dialogText:
          observationRecords.length === 1
            ? ObservationsTableI18N.removeSingleRecordDialogText
            : ObservationsTableI18N.removeMultipleRecordsDialogText,
        yesButtonProps: {
          color: 'error',
          loading: false
        },
        yesButtonLabel:
          observationRecords.length === 1
            ? ObservationsTableI18N.removeSingleRecordButtonText
            : ObservationsTableI18N.removeMultipleRecordsButtonText,
        noButtonProps: { color: 'primary', variant: 'outlined', disabled: false },
        noButtonLabel: 'Cancel',
        open: true,
        onYes: () => _deleteRecords(observationRecords),
        onClose: () => dialogContext.setYesNoDialog({ open: false }),
        onNo: () => dialogContext.setYesNoDialog({ open: false })
      });
    },
    [_deleteRecords, dialogContext]
  );

  const deleteSelectedObservationRecords = useCallback(() => {
    const selectedRecords = getSelectedObservationRecords();
    if (!selectedRecords.length) {
      return;
    }

    deleteObservationRecords(selectedRecords);
  }, [deleteObservationRecords, getSelectedObservationRecords]);

  const onRowEditStart = (id: GridRowId) => {
    setModifiedRowIds((current) => Array.from(new Set([...current, String(id)])));
  };

  /**
   * Add a new empty record to the data grid.
   */
  const addObservationRecord = useCallback(() => {
    const id = uuidv4();

    const newRecord: IObservationTableRow = {
      id,
      survey_observation_id: null as unknown as number,
      wldtaxonomic_units_id: null as unknown as number,
      survey_sample_site_id: null as unknown as number,
      survey_sample_method_id: null as unknown as number,
      survey_sample_period_id: null,
      count: null as unknown as number,
      observation_date: null as unknown as Date,
      observation_time: '',
      latitude: null as unknown as number,
      longitude: null as unknown as number
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
  const saveObservationRecords = useCallback(() => {
    if (_isStoppingEdit) {
      // Stop edit mode already in progress
      return;
    }

    // Validate rows
    const validationErrors = _validateRows();

    if (validationErrors) {
      return;
    }

    _setIsStoppingEdit(true);

    // Collect the ids of all rows in edit mode
    const allEditingIds = Object.keys(_muiDataGridApiRef.current.state.editRows);

    // Remove any row ids that the data grid might still be tracking, but which have been removed from local state
    const editingIdsToSave = allEditingIds.filter((id) => rows.find((row) => String(row.id) === id));

    if (!editingIdsToSave.length) {
      // No rows in edit mode, nothing to stop or save
      _setIsStoppingEdit(false);
      return;
    }

    // Transition all rows in edit mode to view mode
    for (const id of editingIdsToSave) {
      _muiDataGridApiRef.current.stopRowEditMode({ id });
    }

    // Store ids of rows that were in edit mode
    setModifiedRowIds(editingIdsToSave);
  }, [_muiDataGridApiRef, _isStoppingEdit, rows]);

  /**
   * Transition all rows tracked by `modifiedRowIds` to view mode.
   */
  const _revertAllRowsEditMode = useCallback(() => {
    modifiedRowIds.forEach((id) => _muiDataGridApiRef.current.startRowEditMode({ id }));
  }, [_muiDataGridApiRef, modifiedRowIds]);

  const revertObservationRecords = useCallback(() => {
    // Mark all rows as saved
    setModifiedRowIds([]);
    setAddedRowIds([]);

    // Revert any current edits
    const editingIds = Object.keys(_muiDataGridApiRef.current.state.editRows);
    editingIds.forEach((id) => _muiDataGridApiRef.current.stopRowEditMode({ id, ignoreModifications: true }));

    // Remove any rows that are newly created
    setRows(rows.filter((row) => !addedRowIds.includes(String(row.id))));

    // Reset all validation errors
    setValidationModel({});
  }, [_muiDataGridApiRef, addedRowIds, rows]);

  const refreshObservationRecords = useCallback(async () => {
    return observationsContext.observationsDataLoader.refresh();
  }, [observationsContext.observationsDataLoader]);

  // True if the data grid contains at least 1 unsaved record
  const hasUnsavedChanges = modifiedRowIds.length > 0 || addedRowIds.length > 0;

  /**
   * Send all observation rows to the backend.
   */
  const _saveRecords = useCallback(
    async (rowsToSave: GridValidRowModel[]) => {
      try {
        await biohubApi.observation.insertUpdateObservationRecords(
          projectId,
          surveyId,
          rowsToSave as IObservationTableRow[]
        );

        setModifiedRowIds([]);
        setAddedRowIds([]);

        dialogContext.setSnackbar({
          snackbarMessage: (
            <Typography variant="body2" component="div">
              {ObservationsTableI18N.saveRecordsSuccessSnackbarMessage}
            </Typography>
          ),
          open: true
        });

        return refreshObservationRecords();
      } catch (error) {
        _revertAllRowsEditMode();
        const apiError = error as APIError;
        dialogContext.setErrorDialog({
          onOk: () => dialogContext.setErrorDialog({ open: false }),
          onClose: () => dialogContext.setErrorDialog({ open: false }),
          dialogTitle: ObservationsTableI18N.submitRecordsErrorDialogTitle,
          dialogText: ObservationsTableI18N.submitRecordsErrorDialogText,
          dialogErrorDetails: apiError.errors,
          open: true
        });
      } finally {
        _setIsSaving(false);
      }
    },
    [biohubApi.observation, projectId, surveyId, dialogContext, refreshObservationRecords, _revertAllRowsEditMode]
  );

  const isLoading: boolean = useMemo(() => {
    return !hasInitializedTaxonomyCache || observationsContext.observationsDataLoader.isLoading;
  }, [hasInitializedTaxonomyCache, observationsContext.observationsDataLoader.isLoading]);

  const isSaving: boolean = useMemo(() => {
    return _isSaving || _isStoppingEdit;
  }, [_isSaving, _isStoppingEdit]);

  /**
   * Runs when observation context data has changed. This does not occur when records are
   * deleted; Only on initial page load, and whenever records are saved.
   */
  useEffect(() => {
    if (!observationsContext.observationsDataLoader.hasLoaded) {
      // Existing observation records have not yet loaded
      return;
    }

    if (!observationsContext.observationsDataLoader.data) {
      // Existing observation data doesn't exist
      return;
    }

    // Collect rows from the observations data loader
    const rows: IObservationTableRow[] = observationsContext.observationsDataLoader.data.surveyObservations.map(
      (row: IObservationRecord) => ({ ...row, id: String(row.survey_observation_id) })
    );

    // Set initial rows for the table context
    setRows(rows);

    // Set initial observations count
    setObservationCount(observationsContext.observationsDataLoader.data.supplementaryObservationData.observationCount);
  }, [observationsContext.observationsDataLoader.data, observationsContext.observationsDataLoader.hasLoaded]);

  /**
   * Runs onces on initial page load.
   */
  useEffect(() => {
    if (taxonomyContext.isLoading || hasInitializedTaxonomyCache) {
      // Taxonomy cache is currently loading, or has already loaded
      return;
    }

    // Only attempt to initialize the cache once
    setHasInitializedTaxonomyCache(true);

    if (!observationsContext.observationsDataLoader.data?.surveyObservations.length) {
      // No taxonomy records to fetch and cache
      return;
    }

    const uniqueTaxonomicIds: number[] = Array.from(
      observationsContext.observationsDataLoader.data.surveyObservations.reduce(
        (acc: Set<number>, record: IObservationRecord) => {
          acc.add(record.wldtaxonomic_units_id);
          return acc;
        },
        new Set<number>([])
      )
    );

    // Fetch and cache all unique taxonomic IDs
    taxonomyContext.cacheSpeciesTaxonomyByIds(uniqueTaxonomicIds).catch(() => {});
  }, [
    hasInitializedTaxonomyCache,
    observationsContext.observationsDataLoader.data?.surveyObservations,
    taxonomyContext
  ]);

  /**
   * Runs when row records are being saved and transitioned from Edit mode to View mode.
   */
  useEffect(() => {
    if (!_muiDataGridApiRef?.current?.getRowModels) {
      // Data grid is not fully initialized
      return;
    }

    if (!_isStoppingEdit) {
      // Stop edit mode not in progress, cannot save yet
      return;
    }

    if (!modifiedRowIds.length) {
      // No rows to save
      return;
    }

    if (_isSaving) {
      // Saving already in progress
      return;
    }

    if (modifiedRowIds.some((id) => _muiDataGridApiRef.current.getRowMode(id) === 'edit')) {
      // Not all rows have transitioned to view mode, cannot save yet
      return;
    }

    // All rows have transitioned to view mode
    _setIsStoppingEdit(false);

    // Start saving records
    _setIsSaving(true);

    const rowModels = _muiDataGridApiRef.current.getRowModels();
    const rowValues = Array.from(rowModels, ([_, value]) => value);

    _saveRecords(rowValues);
  }, [_muiDataGridApiRef, _saveRecords, _isSaving, _isStoppingEdit, modifiedRowIds]);

  const observationsTableContext: IObservationsTableContext = useMemo(
    () => ({
      _muiDataGridApiRef,
      rows,
      setRows,
      getColumns,
      addObservationRecord,
      saveObservationRecords,
      deleteObservationRecords,
      deleteSelectedObservationRecords,
      revertObservationRecords,
      refreshObservationRecords,
      getSelectedObservationRecords,
      hasUnsavedChanges,
      onRowEditStart,
      rowSelectionModel,
      onRowSelectionModelChange: setRowSelectionModel,
      isLoading,
      isSaving,
      validationModel,
      observationCount,
      setObservationCount
    }),
    [
      _muiDataGridApiRef,
      rows,
      addObservationRecord,
      saveObservationRecords,
      deleteObservationRecords,
      deleteSelectedObservationRecords,
      revertObservationRecords,
      refreshObservationRecords,
      getSelectedObservationRecords,
      hasUnsavedChanges,
      rowSelectionModel,
      isLoading,
      validationModel,
      isSaving,
      observationCount
    ]
  );

  return (
    <ObservationsTableContext.Provider value={observationsTableContext}>
      {props.children}
    </ObservationsTableContext.Provider>
  );
};
