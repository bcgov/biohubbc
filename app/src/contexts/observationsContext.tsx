import Typography from '@mui/material/Typography';
import { GridRowId, GridRowModelUpdate, GridValidRowModel, useGridApiRef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { ObservationsTableI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyObservationsResponse } from 'interfaces/useObservationApi.interface';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
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

type RowId = string | number

export interface IObservationTableRow extends Partial<IObservationRecord> {
  id: RowId;
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
  deleteObservationRecords: (observationRecords: IObservationTableRow[]) => Promise<void>;
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
  const [rowIdsToSave, setRowIdsToSave] = useState<GridRowId[]>([]);
  const [isStoppingEdit, setIsStoppingEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const _showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const _showErrorDialog = useCallback(
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

  observationsDataLoader.load();

  const markRecordWithUnsavedChanges = (id: RowId) => {
    const unsavedRecordSet = new Set<string>(unsavedRecordIds);
    unsavedRecordSet.add(String(id));

    _setUnsavedRecordIds(Array.from(unsavedRecordSet));
  };

  const deleteObservationRecords = async (observationRecords: IObservationTableRow[]): Promise<void> => {
    if (!observationRecords.length) {
      return;
    }

    // markRecordWithUnsavedChanges(id); // TODO probably not needed anymore.
    const deletingObservationIds = observationRecords
      .filter((observationRecord) => 'survey_observation_id' in observationRecord)
      .map((observationRecord) => (observationRecord as IObservationRecord).survey_observation_id);

    return biohubApi.observation.deleteObservationRecords(projectId, surveyId, deletingObservationIds)
      .then(() => {
        const gridRowModelUpdate: GridRowModelUpdate[] = observationRecords.map((observationRecord) => ({
          id: observationRecord.id,
          _action: 'delete'
        }));
        _muiDataGridApiRef.current.updateRows(gridRowModelUpdate);
      })
      .catch((error: any) => {
        // TODO replace with dialog popup
        throw new Error(error);
      })
  }

  /**
   * Add a new empty record to the data grid.
   */
  const createNewRecord = () => {
    const id = uuidv4();
    markRecordWithUnsavedChanges(id);

    _muiDataGridApiRef.current.updateRows([
      {
        id,
        survey_observation_id: null,
        wldtaxonomic_units_id: null,
        survey_sample_site_id: null,
        survey_sample_method_id: null,
        survey_sample_period_id: null,
        count: null,
        observation_date: null,
        observation_time: null,
        latitude: null,
        longitude: null
      } as GridRowModelUpdate
    ]);

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
  const revertAllRowsEditMode = useCallback(() => {
    rowIdsToSave.forEach((id) => _muiDataGridApiRef.current.startRowEditMode({ id }));
  }, [_muiDataGridApiRef, rowIdsToSave]);

  // @TODO deleting a row and then calling method currently fails to recover said row...
  const revertRecords = async () => {
    // Mark all rows as saved
    _setUnsavedRecordIds([]);

    // Revert any current edits
    const editingIds = Object.keys(_muiDataGridApiRef.current.state.editRows);
    editingIds.forEach((id) => _muiDataGridApiRef.current.stopRowEditMode({ id, ignoreModifications: true }));

    // Remove any rows that are newly created
    _muiDataGridApiRef.current.setRows(initialRows);
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
        revertAllRowsEditMode();
        const apiError = error as APIError;
        _showErrorDialog({ dialogErrorDetails: apiError.errors });
        return;
      } finally {
        setIsSaving(false);
      }
    },
    [_showErrorDialog, biohubApi.observation, projectId, refreshRecords, revertAllRowsEditMode, surveyId]
  );

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
    deleteObservationRecords,
    unsavedRecordIds,
    observationsDataLoader,
    _muiDataGridApiRef,
    initialRows,
    setInitialRows,
    isSaving
  };

  return <ObservationsContext.Provider value={observationsContext}>{props.children}</ObservationsContext.Provider>;
};
