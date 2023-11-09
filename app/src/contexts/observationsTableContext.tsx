import Typography from '@mui/material/Typography';
import { GridRowId, GridRowSelectionModel, GridValidRowModel, useGridApiRef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { ObservationsTableI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { ObservationsContext } from 'contexts/observationsContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SurveyContext } from './surveyContext';

export interface IObservationRecord {
  survey_observation_id: number;
  wldtaxonomic_units_id: number;
  survey_sample_site_id: number;
  survey_sample_method_id: number;
  survey_sample_period_id: number;
  count: number | null;
  observation_date: Date;
  observation_time: string;
  latitude: number | null;
  longitude: number | null;
}

export interface IObservationTableRow extends Partial<IObservationRecord> {
  id: GridRowId;
}

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
};

export const ObservationsTableContext = createContext<IObservationsTableContext>({
  _muiDataGridApiRef: null as unknown as React.MutableRefObject<GridApiCommunity>,
  rows: [],
  setRows: () => {},
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
  isSaving: false
});

export const ObservationsTableContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const { projectId, surveyId } = useContext(SurveyContext);

  const _muiDataGridApiRef = useGridApiRef();

  const observationsContext = useContext(ObservationsContext);
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
  const [isStoppingEdit, setIsStoppingEdit] = useState(false);
  // True if the records are in the process of being saved to the server
  const [isSaving, setIsSaving] = useState(false);

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
          await biohubApi.observation.deleteObservationRecords(projectId, surveyId, modifiedRowIdsToDelete);
        }

        // Update all rows, removing deleted rows
        setRows((current) => current.filter((item) => !allRowIdsToDelete.includes(String(item.id))));

        // Update added rows, removing deleted rows
        setAddedRowIds((current) => current.filter((id) => !addedRowIdsToDelete.includes(id)));

        // Updated editing rows, removing deleted rows
        setModifiedRowIds((current) => current.filter((id) => !allRowIdsToDelete.includes(id)));

        // Close yes-no dialog
        dialogContext.setYesNoDialog({ open: false });
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
    return rowValues.filter((row): row is IObservationTableRow => rowSelectionModel.includes(row.id));
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
            : ObservationsTableI18N.removeMultipleRecordsDialogTitle,
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
      survey_observation_id: undefined,
      wldtaxonomic_units_id: undefined,
      survey_sample_site_id: undefined,
      survey_sample_method_id: undefined,
      survey_sample_period_id: undefined,
      count: undefined,
      observation_date: undefined,
      observation_time: undefined,
      latitude: undefined,
      longitude: undefined
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
    if (isStoppingEdit) {
      // Stop edit mode already in progress
      return;
    }

    setIsStoppingEdit(true);

    // The ids of all rows in edit mode
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
  }, [_muiDataGridApiRef, isStoppingEdit, rows]);

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
              Observations updated successfully.
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
        setIsSaving(false);
      }
    },
    [biohubApi.observation, projectId, surveyId, dialogContext, refreshObservationRecords, _revertAllRowsEditMode]
  );

  useEffect(() => {
    if (!observationsContext.observationsDataLoader.data?.surveyObservations?.length) {
      return;
    }

    const rows: IObservationTableRow[] = observationsContext.observationsDataLoader.data.surveyObservations.map(
      (row: IObservationRecord) => ({ ...row, id: row.survey_observation_id })
    );

    if (!rows.length) {
      return;
    }

    setRows(rows);
  }, [observationsContext.observationsDataLoader.data]);

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

    if (isSaving) {
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
    setIsSaving(true);

    const rowModels = _muiDataGridApiRef.current.getRowModels();
    const rowValues = Array.from(rowModels, ([_, value]) => value);

    _saveRecords(rowValues);
  }, [_muiDataGridApiRef, _saveRecords, isSaving, isStoppingEdit, modifiedRowIds]);

  const observationsTableContext: IObservationsTableContext = useMemo(
    () => ({
      _muiDataGridApiRef,
      rows,
      setRows,
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
      isSaving
    }),
    [
      _muiDataGridApiRef,
      rows,
      addObservationRecord,
      saveObservationRecords,
      deleteObservationRecords,
      deleteSelectedObservationRecords,
      revertObservationRecords,
      getSelectedObservationRecords,
      refreshObservationRecords,
      hasUnsavedChanges,
      rowSelectionModel,
      isSaving
    ]
  );

  return (
    <ObservationsTableContext.Provider value={observationsTableContext}>
      {props.children}
    </ObservationsTableContext.Provider>
  );
};
