import { GridRowModelUpdate, useGridApiRef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { ObservationsTableI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyObservationsResponse } from 'interfaces/useObservationApi.interface';
import { createContext, PropsWithChildren, useCallback, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SurveyContext } from './surveyContext';

export interface IObservationRecord {
  survey_observation_id: number | undefined;
  wldtaxonomic_units_id: number | undefined;
  survey_sample_site_id: number | undefined;
  survey_sample_method_id: number | undefined;
  survey_sample_period_id: number | undefined;
  count: number | undefined;
  observation_date: Date | undefined;
  observation_time: string | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
}

export interface IObservationTableRow extends Partial<IObservationRecord> {
  id: string;
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
   * Commits all observation rows to the database, including those that are currently being edited in the Observation
   * Table
   */
  saveRecords: () => Promise<void>;
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
  markRecordWithUnsavedChanges: (id: string | number) => void;
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
  revertRecords: () => Promise.resolve(),
  saveRecords: () => Promise.resolve(),
  refreshRecords: () => Promise.resolve()
});

export const ObservationsContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const { projectId, surveyId } = useContext(SurveyContext);

  const observationsDataLoader = useDataLoader(() => biohubApi.observation.getObservationRecords(projectId, surveyId));
  const _muiDataGridApiRef = useGridApiRef();
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);
  const surveyContext = useContext(SurveyContext);

  const [unsavedRecordIds, _setUnsavedRecordIds] = useState<string[]>([]);
  const [initialRows, setInitialRows] = useState<IObservationTableRow[]>([]);

  const _hideErrorDialog = () => {
    dialogContext.setErrorDialog({
      open: false
    });
  };

  const _showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      ...textDialogProps,
      onOk: _hideErrorDialog,
      onClose: _hideErrorDialog,
      dialogTitle: ObservationsTableI18N.submitRecordsErrorDialogTitle,
      dialogText: ObservationsTableI18N.submitRecordsErrorDialogText,
      open: true
    });
  };

  observationsDataLoader.load();

  const markRecordWithUnsavedChanges = (id: string | number) => {
    const unsavedRecordSet = new Set<string>(unsavedRecordIds);
    unsavedRecordSet.add(String(id));

    _setUnsavedRecordIds(Array.from(unsavedRecordSet));
  };

  const createNewRecord = () => {
    const id = uuidv4();
    markRecordWithUnsavedChanges(id);

    _muiDataGridApiRef.current.updateRows([
      {
        id,
        survey_observation_id: null,
        wldtaxonomic_units: undefined,
        survey_sample_site_id: undefined,
        survey_sample_method_id: undefined,
        survey_sample_period_id: undefined,
        count: undefined,
        observation_date: undefined,
        observation_time: undefined,
        latitude: undefined,
        longitude: undefined
      } as GridRowModelUpdate
    ]);

    _muiDataGridApiRef.current.startRowEditMode({ id, fieldToFocus: 'wldtaxonomic_units' });
  };

  const _getRows = (): IObservationTableRow[] => {
    return Array.from(_muiDataGridApiRef.current.getRowModels?.()?.values()) as IObservationTableRow[];
  };

  const _getActiveRecords = (): IObservationTableRow[] => {
    return _getRows().map((row) => {
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

  const saveRecords = async () => {
    const editingIds = Object.keys(_muiDataGridApiRef.current.state.editRows);
    editingIds.forEach((id) => _muiDataGridApiRef.current.stopRowEditMode({ id }));

    const { projectId, surveyId } = surveyContext;
    const rows = _getActiveRecords();

    try {
      await biohubApi.observation.insertUpdateObservationRecords(projectId, surveyId, rows);
      _setUnsavedRecordIds([]);
      return refreshRecords();
    } catch (error) {
      const apiError = error as APIError;
      _showErrorDialog({ dialogErrorDetails: apiError.errors });
      return;
    }
  };

  // TODO deleting a row and then calling method currently fails to recover said row...
  const revertRecords = async () => {
    // Mark all rows as saved
    _setUnsavedRecordIds([]);

    // Revert any current edits
    const editingIds = Object.keys(_muiDataGridApiRef.current.state.editRows);
    editingIds.forEach((id) => _muiDataGridApiRef.current.stopRowEditMode({ id, ignoreModifications: true }));

    // Remove any rows that are newly created
    _muiDataGridApiRef.current.setRows(initialRows);
  };

  const refreshRecords = async (): Promise<void> => {
    return observationsDataLoader.refresh();
  };

  const hasUnsavedChanges = useCallback(() => {
    return unsavedRecordIds.length > 0;
  }, [unsavedRecordIds]);

  const observationsContext: IObservationsContext = {
    createNewRecord,
    revertRecords,
    saveRecords,
    refreshRecords,
    hasUnsavedChanges,
    markRecordWithUnsavedChanges,
    unsavedRecordIds,
    observationsDataLoader,
    _muiDataGridApiRef,
    initialRows,
    setInitialRows
  };

  return <ObservationsContext.Provider value={observationsContext}>{props.children}</ObservationsContext.Provider>;
};
