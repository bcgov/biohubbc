import Typography from '@mui/material/Typography';
import { GridRowId, GridRowSelectionModel, GridValidRowModel, useGridApiRef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { IYesNoDialogProps } from 'components/dialog/YesNoDialog';
import { ObservationsTableI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyObservationsResponse } from 'interfaces/useObservationApi.interface';
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

type RowId = string | number;

export interface IObservationTableRow extends Partial<IObservationRecord> {
  id: RowId;
  _isUnsaved?: boolean;
}

/**
 * Context object that stores information about survey observations
 *
 * @export
 * @interface IObservationsContext
 */
export type IObservationsContext = {
  /**
   * Appends a new blank record to the observation rows
   */
  createNewRecord: () => void;
  /**
   * Deletes all of the given records and removes them from the Observation table.
   */
  deleteObservationRecords: (observationRecords: IObservationTableRow[]) => void;
  /**
   * Transitions all rows in edit mode to view mode and triggers a commit of all observation rows to the database.
   */
  stopEditAndSaveRows: () => void;
  /**
   * Reverts all changes made to observation records within the Observation Table
   */
  revertRecords: () => Promise<void>;
  /**
   * Refreshes the Observation Table with already existing records
   */
  refreshRecords: () => Promise<void>;
  /**
   * Marks the given record as unsaved
   */
  markRecordWithUnsavedChanges: (id: RowId) => void;
  /**
   * Indicates all observation table rows that have unsaved changes, include IDs of rows that have been deleted.
   */
  unsavedRecordIds: string[];
  /**
   * Indicates whether the observation table has any unsaved changes
   */
  hasUnsavedChanges: () => boolean;
  /**
   * Data Loader used for retrieving existing records
   */
  observationsDataLoader: DataLoader<[], IGetSurveyObservationsResponse, unknown>;
  /**
   * API ref used to interface with an MUI DataGrid representing the observation records
   */
  _muiDataGridApiRef: React.MutableRefObject<GridApiCommunity>;
  /**
   * The initial rows the data grid should render, if any.
   */
  initialRows: IObservationTableRow[];
  /**
   * A setState setter for the `initialRows`
   */
  setInitialRows: React.Dispatch<React.SetStateAction<IObservationTableRow[]>>;
  /**
   * The IDs of the selected observation table rows
   */
  rowSelectionModel: GridRowSelectionModel;
  /**
   * Sets the IDs of the selected observation table rows
   */
  setRowSelectionModel: (rowSelectionModel: GridRowSelectionModel) => void;
  /**
   * Returns all of the observation table records that have been selected
   */
  getSelectedObservations: () => IObservationTableRow[];
  /**
   * Indicates if the data is in the process of being persisted to the server.
   */
  isSaving: boolean;
};

export const ObservationsContext = createContext<IObservationsContext>({
  _muiDataGridApiRef: null as unknown as React.MutableRefObject<GridApiCommunity>,
  observationsDataLoader: {} as DataLoader<never, IGetSurveyObservationsResponse, unknown>,
  unsavedRecordIds: [],
  initialRows: [],
  setInitialRows: () => {},
  markRecordWithUnsavedChanges: () => {},
  hasUnsavedChanges: () => false,
  createNewRecord: () => {},
  deleteObservationRecords: () => Promise.resolve(),
  revertRecords: () => Promise.resolve(),
  stopEditAndSaveRows: () => {},
  refreshRecords: () => Promise.resolve(),
  rowSelectionModel: [],
  setRowSelectionModel: () => {},
  getSelectedObservations: () => [],
  isSaving: false
});

export const ObservationsContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const { projectId, surveyId } = useContext(SurveyContext);

  const observationsDataLoader = useDataLoader(() => biohubApi.observation.getObservationRecords(projectId, surveyId));

  const _muiDataGridApiRef = useGridApiRef();

  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);

  const [unsavedRecordIds, _setUnsavedRecordIds] = useState<string[]>([]);
  const [initialRows, setInitialRows] = useState<IObservationTableRow[]>([]);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  const [rowIdsToSave, setRowIdsToSave] = useState<GridRowId[]>([]);
  const [isStoppingEdit, setIsStoppingEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [_pendingDeletionObservations, _setPendingDeletionObservations] = useState<IObservationTableRow[]>([]);

  const _showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const _showImportErrorDialog = useCallback(
    (textDialogProps?: Partial<IErrorDialogProps>) => {
      dialogContext.setErrorDialog({
        ...textDialogProps,
        onOk: () => dialogContext.setErrorDialog({ open: false }),
        onClose: () => dialogContext.setErrorDialog({ open: false }),
        dialogTitle: ObservationsTableI18N.submitRecordsErrorDialogTitle,
        dialogText: ObservationsTableI18N.submitRecordsErrorDialogText,
        open: true
      });
    },
    [dialogContext]
  );

  const _confirmDeletionDialogDefaultProps: IYesNoDialogProps = useMemo(
    () => ({
      dialogTitle:
        _pendingDeletionObservations.length === 1
          ? ObservationsTableI18N.removeSingleRecordDialogTitle
          : ObservationsTableI18N.removeMultipleRecordsDialogTitle,
      dialogText:
        _pendingDeletionObservations.length === 1
          ? ObservationsTableI18N.removeSingleRecordDialogText
          : ObservationsTableI18N.removeMultipleRecordsDialogText,
      yesButtonProps: {
        color: 'error',
        loading: false
      },
      yesButtonLabel:
        _pendingDeletionObservations.length === 1
          ? ObservationsTableI18N.removeSingleRecordButtonText
          : ObservationsTableI18N.removeMultipleRecordsButtonText,
      noButtonProps: { color: 'primary', variant: 'outlined', disabled: false },
      noButtonLabel: 'Cancel',
      open: false,
      onYes: () => _commitDeleteObservationRecords(_pendingDeletionObservations),
      onClose: () => _setPendingDeletionObservations([]),
      onNo: () => _setPendingDeletionObservations([])
    }),
    [_pendingDeletionObservations]
  );

  const _commitDeleteObservationRecords = useCallback(
    async (observationRecords: IObservationTableRow[]): Promise<void> => {
      if (!observationRecords.length) {
        return;
      }

      dialogContext.setYesNoDialog({
        ..._confirmDeletionDialogDefaultProps,
        open: true,
        yesButtonProps: { ..._confirmDeletionDialogDefaultProps.yesButtonProps, loading: true },
        noButtonProps: { ..._confirmDeletionDialogDefaultProps.noButtonProps, disabled: true }
      });

      const deletingObservationIds = observationRecords
        .filter((observationRecord) => Boolean(observationRecord.survey_observation_id))
        .map((observationRecord) => (observationRecord as IObservationRecord).survey_observation_id);

      try {
        if (deletingObservationIds.length > 0) {
          await biohubApi.observation.deleteObservationRecords(projectId, surveyId, deletingObservationIds);
        }

        _setPendingDeletionObservations([]);
        setInitialRows(initialRows.filter((row) => {
          return observationRecords.every((record) => record.id !== row.id);
        }));
        _setUnsavedRecordIds(unsavedRecordIds.filter((recordId) => {
          return observationRecords.every((record) => record.id !== recordId);
        }));
      } catch {
        // Close yes-no dialog
        dialogContext.setYesNoDialog({
          ..._confirmDeletionDialogDefaultProps,
          open: false
        });

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
    [initialRows, _confirmDeletionDialogDefaultProps]
  );

  const _promptConfirmDeleteDialog = useCallback(() => {
    dialogContext.setYesNoDialog({
      ..._confirmDeletionDialogDefaultProps,
      open: true
    });
  }, [dialogContext, _confirmDeletionDialogDefaultProps]);

  observationsDataLoader.load();

  const markRecordWithUnsavedChanges = (id: RowId) => {
    const unsavedRecordSet = new Set<string>(unsavedRecordIds);
    unsavedRecordSet.add(String(id));

    _setUnsavedRecordIds(Array.from(unsavedRecordSet));
  };

  /**
   * Add a new empty record to the data grid.
   */
  const createNewRecord = () => {
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
      longitude: undefined,
      _isUnsaved: true
    };

    // Append new record to initial rows
    setInitialRows([...initialRows, newRecord]);

    // Mark new row as unsaved
    markRecordWithUnsavedChanges(id);

    // Set edit mode for the new row
    _muiDataGridApiRef.current.startRowEditMode({ id, fieldToFocus: 'wldtaxonomic_units' });
  };

  /**
   * Transition all editable rows from edit mode to view mode.
   */
  const stopEditAndSaveRows = () => {
    if (isStoppingEdit) {
      // Stop edit mode already in progress
      return;
    }

    setIsStoppingEdit(true);

    // The ids of all rows in edit mode
    const editingIds = Object.keys(_muiDataGridApiRef.current.state.editRows);

    if (!editingIds.length) {
      // No rows in edit mode, nothing to stop or save
      setIsStoppingEdit(false);
      return;
    }

    // Transition all rows in edit mode to view mode
    for (const id of editingIds) {
      _muiDataGridApiRef.current.stopRowEditMode({ id });
    }

    // Store ids of rows that were in edit mode
    setRowIdsToSave(editingIds);
  };

  /**
   * Transition all rows tracked by `rowIdsToSave` to view mode.
   */
  const _revertAllRowsEditMode = useCallback(() => {
    rowIdsToSave.forEach((id) => _muiDataGridApiRef.current.startRowEditMode({ id }));
  }, [_muiDataGridApiRef, rowIdsToSave]);

  const revertRecords = async () => {
    // Mark all rows as saved
    _setUnsavedRecordIds([]);

    // Revert any current edits
    const editingIds = Object.keys(_muiDataGridApiRef.current.state.editRows);
    editingIds.forEach((id) => _muiDataGridApiRef.current.stopRowEditMode({ id, ignoreModifications: true }));

    // Remove any rows that are newly created
    setInitialRows(initialRows.filter((row) => !row._isUnsaved));
  };

  const refreshRecords = useCallback(async () => {
    return observationsDataLoader.refresh();
  }, [observationsDataLoader]);

  const hasUnsavedChanges = useCallback(() => {
    return unsavedRecordIds.length > 0;
  }, [unsavedRecordIds]);

  /**
   * Send all observation rows to the backend.
   *
   * @param {GridValidRowModel[]} rowsToSave
   */
  const saveRecords = useCallback(
    async (rowsToSave: GridValidRowModel[]) => {
      try {
        await biohubApi.observation.insertUpdateObservationRecords(
          projectId,
          surveyId,
          rowsToSave as IObservationTableRow[]
        );

        setRowIdsToSave([]);
        _setUnsavedRecordIds([]);
        _showSnackBar({
          snackbarMessage: (
            <Typography variant="body2" component="div">
              Updated survey observations successfully.
            </Typography>
          )
        });
        return refreshRecords();
      } catch (error) {
        _revertAllRowsEditMode();
        const apiError = error as APIError;
        _showImportErrorDialog({ dialogErrorDetails: apiError.errors });
        return;
      } finally {
        setIsSaving(false);
      }
    },
    [_showImportErrorDialog, biohubApi.observation, projectId, refreshRecords, _revertAllRowsEditMode, surveyId]
  );

  const getSelectedObservations: () => IObservationTableRow[] = useCallback(() => {
    if (!_muiDataGridApiRef?.current?.getRowModels) {
      // Data grid is not fully initialized
      return [];
    }

    const rowValues = Array.from(_muiDataGridApiRef.current.getRowModels(), ([_, value]) => value);
    return rowValues.filter((row): row is IObservationTableRow => rowSelectionModel.includes(row.id));
  }, [rowSelectionModel]);

  useEffect(() => {
    if (_pendingDeletionObservations.length > 0) {
      _promptConfirmDeleteDialog();
    } else {
      dialogContext.setYesNoDialog({ ..._confirmDeletionDialogDefaultProps, open: false });
    }
  }, [_pendingDeletionObservations]);

  useEffect(() => {
    if (!_muiDataGridApiRef?.current?.getRowModels) {
      // Data grid is not fully initialized
      return;
    }

    if (!isStoppingEdit) {
      // Stop edit mode not in progress, cannot save yet
      return;
    }

    if (!rowIdsToSave.length) {
      // No rows to save
      return;
    }

    if (isSaving) {
      // Saving already in progress
      return;
    }

    if (rowIdsToSave.some((id) => _muiDataGridApiRef.current.getRowMode(id) === 'edit')) {
      // Not all rows have transitioned to view mode, cannot save yet
      return;
    }

    // All rows have transitioned to view mode
    setIsStoppingEdit(false);

    // Start saving records
    setIsSaving(true);
    const rowModels = _muiDataGridApiRef.current.getRowModels();
    const rowValues = Array.from(rowModels, ([_, value]) => value);
    saveRecords(rowValues);
  }, [_muiDataGridApiRef, saveRecords, isSaving, isStoppingEdit, rowIdsToSave]);

  const observationsContext: IObservationsContext = {
    createNewRecord,
    revertRecords,
    stopEditAndSaveRows,
    refreshRecords,
    hasUnsavedChanges,
    markRecordWithUnsavedChanges,
    deleteObservationRecords: _setPendingDeletionObservations,
    unsavedRecordIds,
    observationsDataLoader,
    _muiDataGridApiRef,
    initialRows,
    setInitialRows,
    rowSelectionModel,
    setRowSelectionModel,
    getSelectedObservations,
    isSaving
  };

  return <ObservationsContext.Provider value={observationsContext}>{props.children}</ObservationsContext.Provider>;
};
