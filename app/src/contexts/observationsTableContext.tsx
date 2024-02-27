import Typography from '@mui/material/Typography';
import {
  GridCellParams,
  GridColDef,
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRowId,
  GridRowModesModel,
  GridRowSelectionModel,
  GridSortModel,
  useGridApiRef
} from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { ObservationsTableI18N } from 'constants/i18n';
import { getSurveySessionStorageKey, SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS } from 'constants/session-storage';
import { DialogContext } from 'contexts/dialogContext';
import { default as dayjs } from 'dayjs';
import { getMeasurementColumns } from 'features/surveys/observations/observations-table/grid-column-definitions/GridColumnDefinitionsUtils';
import { APIError } from 'hooks/api/useAxios';
import { IObservationTableRowToSave, MeasurementColumnToSave } from 'hooks/api/useObservationApi';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useObservationsContext, useTaxonomyContext } from 'hooks/useContext';
import { CBMeasurementType, CBMeasurementValue } from 'interfaces/useCritterApi.interface';
import { IGetSurveyObservationsResponse } from 'interfaces/useObservationApi.interface';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { firstOrNull } from 'utils/Utils';
import { v4 as uuidv4 } from 'uuid';
import { RowValidationError, TableValidationModel } from '../components/data-grid/DataGridValidationAlert';
import { SurveyContext } from './surveyContext';

export interface IStandardObservationColumns {
  survey_observation_id: number;
  itis_tsn: number | null;
  itis_scientific_name: string | null;
  survey_sample_site_id: number | null;
  survey_sample_method_id: number | null;
  survey_sample_period_id: number | null;
  count: number | null;
  subcount: number | null;
  observation_date: Date;
  observation_time: string;
  latitude: number | null;
  longitude: number | null;
}

export interface IObservationRecord extends IStandardObservationColumns {
  [key: string]: any;
}

export interface IObservationRecordWithSamplingData {
  survey_observation_id: number;
  itis_tsn: number | null;
  itis_scientific_name: string | null;
  survey_sample_site_id: number | null;
  survey_sample_site_name: string | null;
  survey_sample_method_id: number | null;
  survey_sample_method_name: string | null;
  survey_sample_period_id: number | null;
  survey_sample_period_start_datetime: string | null;
  count: number | null;
  observation_date: Date;
  observation_time: string;
  latitude: number | null;
  longitude: number | null;
}

export type MeasurementColumn = {
  measurement: CBMeasurementType;
  colDef: GridColDef;
};

export interface IObservationRecordWithSamplingDataWithEventsWithAttributes extends IObservationRecordWithSamplingData {
  subcount: number;
  observation_subcount_events: string[];
  observation_subcount_attributes: CBMeasurementValue[];
}

export interface ISupplementaryObservationData {
  observationCount: number;
  measurementColumns: CBMeasurementType[];
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
   * The perviously saved rows the data grid should render.
   */
  savedRows: IObservationTableRow[];
  /**
   * Sets the previously saved rows.
   */
  setSavedRows: React.Dispatch<React.SetStateAction<IObservationTableRow[]>>;
  /**
   * The new rows, that have not yet been persisted to the server, that the grid should render.
   */
  stagedRows: IObservationTableRow[];
  /**
   * Sets the new rows.
   *
   * @type {React.Dispatch<React.SetStateAction<IObservationTableRow[]>>}
   */
  setStagedRows: React.Dispatch<React.SetStateAction<IObservationTableRow[]>>;
  /**
   * The row modes model, which defines which rows are in edit mode.
   */
  rowModesModel: GridRowModesModel;
  /**
   * Sets the row modes model.
   */
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  /**
   * The column visibility model, which defines which columns are visible or hidden.
   */
  columnVisibilityModel: GridColumnVisibilityModel;
  /**
   * Sets the column visibility model.
   */
  setColumnVisibilityModel: React.Dispatch<React.SetStateAction<GridColumnVisibilityModel>>;
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
   * discards all changes made to observation records within the Observation Table. Abandons all newly added rows that
   * have not yet been saved, and reverts all edits to existing rows.
   */
  discardChanges: () => void;
  /**
   * Refreshes the Observation Table with already existing records
   */
  refreshObservationRecords: () => Promise<IGetSurveyObservationsResponse | undefined>;
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
   * Indicates whether or not content in the observations table is loading.
   */
  isLoading: boolean;
  /**
   * Indicates if the save process has started.
   */
  isSaving: boolean;
  /**
   * Indicates that the rows have all transitioned to view mode successfully, and the data is about to be, or is in the
   * process of being, persisted to the server.
   *
   * Note: This ref should not be manually updated outside of this context.
   */
  _isSavingData: React.MutableRefObject<boolean>;
  /**
   * Indicates that the rows in edit mode are transitioning to view mode, which is part of the process of persisting
   * the data to the server.
   *
   * Note: This ref should not be manually updated outside of this context.
   */
  _isStoppingEdit: React.MutableRefObject<boolean>;
  /**
   * The state of the validation model
   */
  validationModel: ObservationTableValidationModel;
  /**
   * Indicates if the given row has a validation error.
   */
  hasError: (params: GridCellParams) => boolean;
  /**
   * Reflects the count of total observations for the survey
   */
  observationCount: number;
  /**
   * Updates the total observation count for the survey
   */
  setObservationCount: (observationCount: number) => void;
  /**
   * The pagination model, which defines which observation records to fetch and load in the table.
   */
  paginationModel: GridPaginationModel;
  /**
   * Sets the pagination model.
   */
  setPaginationModel: (model: GridPaginationModel) => void;
  /**
   * The sort model, which defines how the observation records should be sorted.
   */
  sortModel: GridSortModel;
  /**
   * Sets the sort model.
   */
  setSortModel: (mode: GridSortModel) => void;
  /**
   * User-added measurement columns that are not part of the default observation table columns.
   */
  measurementColumns: MeasurementColumn[];
  /**
   * Sets the user-added measurement columns.
   */
  setMeasurementColumns: React.Dispatch<React.SetStateAction<MeasurementColumn[]>>;
  /**
   * Used to disable the entire table.
   */
  disabled: boolean;
  /**
   * Sets the disabled state of the table.
   */
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ObservationsTableContext = createContext<IObservationsTableContext | undefined>(undefined);

export const ObservationsTableContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const { projectId, surveyId } = useContext(SurveyContext);

  const _muiDataGridApiRef = useGridApiRef();

  const {
    observationsDataLoader: {
      data: observationsData,
      isLoading: isLoadingObservationsData,
      hasLoaded: hasLoadedObservationsData,
      refresh: refreshObservationsData
    }
  } = useObservationsContext();

  const { cacheSpeciesTaxonomyByIds } = useTaxonomyContext();

  const { setYesNoDialog, setSnackbar, setErrorDialog } = useContext(DialogContext);

  const biohubApi = useBiohubApi();

  // Existing rows
  const [savedRows, setSavedRows] = useState<IObservationTableRow[]>([]);

  // New rows not yet persisted to the sever
  const [stagedRows, setStagedRows] = useState<IObservationTableRow[]>([]);

  // The row modes model, which defines which rows are in edit mode
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  // Stores the currently selected row ids
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);

  // Existing rows that are in edit mode
  const [modifiedRowIds, setModifiedRowIds] = useState<string[]>([]);

  // True if the rows are in the process of transitioning from edit to view mode
  const _isStoppingEdit = useRef(false);

  // True if the records are in the process of being saved to the server
  const _isSavingData = useRef(false);

  // Status of the taxonomy cache
  const [taxonomyCacheStatus, setTaxonomyCacheStatus] = useState({ isInitializing: false, isInitialized: false });

  // Stores the current count of observations for this survey
  const [observationCount, setObservationCount] = useState<number>(0);

  // Stores the current validation state of the table
  const [validationModel, setValidationModel] = useState<ObservationTableValidationModel>({});

  // Stores any measurement columns that are not part of the default observation table columns
  const [measurementColumns, setMeasurementColumns] = useState<MeasurementColumn[]>([]);

  // Global disabled state for the observations table
  const [disabled, setDisabled] = useState(false);

  // Column visibility model
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({});

  // Pagination model
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 50
  });

  // Sort model
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  /**
   * Refreshes the observations table with the latest records from the server.
   *
   * @return {*}
   */
  const refreshObservationRecords = useCallback(async () => {
    const sort = firstOrNull(sortModel);
    return refreshObservationsData({
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,

      // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
      page: paginationModel.page + 1
    });
  }, [paginationModel.page, paginationModel.pageSize, refreshObservationsData, sortModel]);

  /**
   * Gets all rows from the table, including values that have been edited in the table.
   */
  const _getRowsWithEditedValues = useCallback((): IObservationTableRow[] => {
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
  }, [_muiDataGridApiRef]);

  /**
   * Validates all rows belonging to the table. Returns null if validation passes, otherwise
   * returns the validation model
   */
  const _validateRows = useCallback((): ObservationTableValidationModel | null => {
    const rowValues = _getRowsWithEditedValues();
    const tableColumns = _muiDataGridApiRef.current.getAllColumns?.() ?? [];

    const requiredColumns: (keyof IObservationTableRow)[] = [
      'count',
      'latitude',
      'longitude',
      'observation_date',
      'observation_time',
      'itis_tsn'
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
  }, [_getRowsWithEditedValues, _muiDataGridApiRef]);

  /**
   * Returns true if the given row has a validation error.
   *
   * @param {GridCellParams} params
   * @return {*}  {boolean}
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
   * Deletes the given records from the server and removes them from the table.
   *
   * @param {IObservationTableRow[]} observationRecords
   * @return {*}  {Promise<void>}
   */
  const _deleteRecords = useCallback(
    async (observationRecords: IObservationTableRow[]): Promise<void> => {
      if (!observationRecords.length) {
        return;
      }

      const allRowIdsToDelete = observationRecords.map((item) => String(item.id));

      // Get all row ids that are new, which only need to be removed from local state
      const savedRowIdsToDelete = allRowIdsToDelete.filter((id) => savedRows.map((item) => item.id).includes(id));

      // Get all row ids that are not new, which need to be deleted from the server
      const stagedRowIdsToDelete = allRowIdsToDelete.filter((id) => stagedRows.map((item) => item.id).includes(id));

      try {
        if (savedRowIdsToDelete.length) {
          // Delete previously saved records from the server, if any
          const response = await biohubApi.observation.deleteObservationRecords(
            projectId,
            surveyId,
            savedRowIdsToDelete
          );
          setObservationCount(response.supplementaryObservationData.observationCount);
        }

        // Remove deleted row IDs from the validation model
        setValidationModel((prevValidationModel) =>
          allRowIdsToDelete.reduce((newValidationModel, rowId) => {
            delete newValidationModel[rowId];
            return newValidationModel;
          }, prevValidationModel)
        );

        // Update saved rows, removing any deleted rows
        setSavedRows((current) => current.filter((item) => !savedRowIdsToDelete.includes(String(item.id))));

        // Update staged rows, removing any deleted rows
        setStagedRows((current) => current.filter((item) => !stagedRowIdsToDelete.includes(String(item.id))));

        // Updated editing rows, removing deleted rows
        setModifiedRowIds((current) => current.filter((id) => !allRowIdsToDelete.includes(id)));

        // Updated row modes model, removing deleted rows
        setRowModesModel((current) => {
          allRowIdsToDelete.forEach((rowId) => delete current[rowId]);
          return current;
        });

        // Close yes-no dialog
        setYesNoDialog({ open: false });

        // Show snackbar for successful deletion
        setSnackbar({
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
        setYesNoDialog({ open: false });

        // Show error dialog
        setErrorDialog({
          onOk: () => setErrorDialog({ open: false }),
          onClose: () => setErrorDialog({ open: false }),
          dialogTitle: ObservationsTableI18N.removeRecordsErrorDialogTitle,
          dialogText: ObservationsTableI18N.removeRecordsErrorDialogText,
          open: true
        });
      }
    },
    [savedRows, stagedRows, setYesNoDialog, setSnackbar, biohubApi.observation, projectId, surveyId, setErrorDialog]
  );

  /**
   * Returns all of the rows that have been selected.
   *
   * @return {*}
   */
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

  /**
   * Renders a dialog that prompts the user to delete the given records.
   *
   * @param {IObservationTableRow[]} observationRecords
   * @return {*}
   */
  const deleteObservationRecords = useCallback(
    (observationRecords: IObservationTableRow[]) => {
      if (!observationRecords.length) {
        return;
      }

      setYesNoDialog({
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
        onClose: () => setYesNoDialog({ open: false }),
        onNo: () => setYesNoDialog({ open: false })
      });
    },
    [_deleteRecords, setYesNoDialog]
  );

  /**
   * Puts the specified row into edit mode, and adds the row id to the array of modified rows.
   *
   * @param {GridRowId} id
   */
  const onRowEditStart = (id: GridRowId) => {
    // Add row to modified rows array
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
      survey_sample_site_id: null as unknown as number,
      survey_sample_method_id: null as unknown as number,
      survey_sample_period_id: null,
      count: null as unknown as number,
      observation_date: null as unknown as Date,
      observation_time: '',
      latitude: null as unknown as number,
      longitude: null as unknown as number,
      itis_tsn: null as unknown as number,
      itis_scientific_name: ''
    };

    // Append new record to initial rows
    setStagedRows([...stagedRows, newRecord]);

    // Set edit mode for the new row
    _muiDataGridApiRef.current.startRowEditMode({ id, fieldToFocus: 'wldtaxonomic_units' });
  }, [_muiDataGridApiRef, stagedRows]);

  /**
   * Transition all editable rows from edit mode to view mode.
   */
  const saveObservationRecords = useCallback(() => {
    if (_isStoppingEdit.current) {
      // Stop edit mode already in progress
      return;
    }

    // Validate rows
    const validationErrors = _validateRows();

    if (validationErrors) {
      return;
    }

    _isStoppingEdit.current = true;

    // Collect the ids of all rows in edit mode
    const allEditingIds = Object.keys(_muiDataGridApiRef.current.state.editRows);

    // Remove any row ids that the data grid might still be tracking, but which have been removed from local state
    const editingIdsToSave = allEditingIds.filter((id) =>
      [...savedRows, ...stagedRows].find((row) => String(row.id) === id)
    );

    if (!editingIdsToSave.length) {
      // No rows in edit mode, nothing to stop or save
      _isStoppingEdit.current = false;
      return;
    }

    // Transition all rows in edit mode to view mode
    for (const id of editingIdsToSave) {
      _muiDataGridApiRef.current.stopRowEditMode({ id });
    }

    // Store ids of rows that were in edit mode
    setModifiedRowIds(editingIdsToSave);
  }, [_validateRows, _muiDataGridApiRef, savedRows, stagedRows]);

  /**
   * Transition all rows tracked by `modifiedRowIds` to edit mode.
   */
  const _revertAllRowsEditMode = useCallback(() => {
    modifiedRowIds.forEach((id) => _muiDataGridApiRef.current.startRowEditMode({ id }));
  }, [_muiDataGridApiRef, modifiedRowIds]);

  /**
   * Transition all rows tracked by `modifiedRowIds` to edit mode.
   */
  const discardChanges = useCallback(() => {
    // Reset any rows in edit mode back to view mode
    for (const id of modifiedRowIds) {
      _muiDataGridApiRef.current.stopRowEditMode({ id });
    }
    // Remove any rows from the modified rows array
    setModifiedRowIds([]);
    // Remove any newly created rows
    setStagedRows([]);
    // Clear any validation errors
    setValidationModel({});
  }, [_muiDataGridApiRef, modifiedRowIds]);

  // True if the data grid contains at least 1 unsaved record
  const hasUnsavedChanges = modifiedRowIds.length > 0 || stagedRows.length > 0;

  /**
   * Send all observation rows to the backend.
   */
  const _saveRecords = useCallback(
    async (rowsToSave: IObservationTableRowToSave[]) => {
      try {
        await biohubApi.observation.insertUpdateObservationRecords(projectId, surveyId, rowsToSave);

        setModifiedRowIds([]);
        setStagedRows([]);
        setValidationModel({});

        setSnackbar({
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
        setErrorDialog({
          onOk: () => setErrorDialog({ open: false }),
          onClose: () => setErrorDialog({ open: false }),
          dialogTitle: ObservationsTableI18N.submitRecordsErrorDialogTitle,
          dialogText: ObservationsTableI18N.submitRecordsErrorDialogText,
          dialogErrorDetails: apiError.errors,
          open: true
        });
      } finally {
        _isSavingData.current = false;
      }
    },
    [
      biohubApi.observation,
      projectId,
      surveyId,
      setSnackbar,
      refreshObservationRecords,
      _revertAllRowsEditMode,
      setErrorDialog
    ]
  );

  const isLoading: boolean = useMemo(() => {
    return !taxonomyCacheStatus.isInitialized || isLoadingObservationsData;
  }, [isLoadingObservationsData, taxonomyCacheStatus.isInitialized]);

  const isSaving: boolean = _isSavingData.current || _isStoppingEdit.current;

  useEffect(() => {
    if (isLoadingObservationsData || !observationsData) {
      // Observations data is still loading
      return;
    }

    if (measurementColumns.length) {
      // Already loaded measurement columns from local storage or existing observations data
      return;
    }

    setMeasurementColumns(() => {
      if (!observationsData.supplementaryObservationData.measurementColumns.length) {
        // Get measurement columns from local storage
        const measurementColumnStringified = sessionStorage.getItem(
          getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS)
        );

        if (!measurementColumnStringified) {
          return [];
        }

        return JSON.parse(measurementColumnStringified);
      }

      // Measurement columns are available in the observations data, remove measurement columns from local storage
      sessionStorage.removeItem(getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS));

      // Get measurement columns from existing observations data
      return [...getMeasurementColumns(observationsData.supplementaryObservationData.measurementColumns, hasError)];
    });
  }, [isLoadingObservationsData, observationsData, hasError, surveyId, measurementColumns.length]);

  /**
   * Fetch new rows based on sort/ pagination model changes
   */
  useEffect(() => {
    refreshObservationRecords();
    // Should not re-run this effect on `refreshObservationRecords` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel, sortModel]);

  /**
   * Runs when observation context data has changed. This does not occur when records are
   * deleted; Only on initial page load, and whenever records are saved.
   */
  useEffect(() => {
    if (!hasLoadedObservationsData) {
      // Existing observation records have not yet loaded
      return;
    }

    if (!observationsData) {
      // Existing observation data doesn't exist
      return;
    }

    // Collect rows from the observations data loader
    const existingRows = observationsData.surveyObservations.map((row) => {
      return {
        ...row,
        // Spread the measurement column key/values into the row
        ...row.observation_subcount_attributes.reduce((acc, cur: any) => {
          return {
            ...acc,
            // TODO update to be more type safe, etc
            [cur.taxon_measurement_id]: cur.value || cur.qualitative_option_id
          };
        }, {} as CBMeasurementValue),
        id: String(row.survey_observation_id)
      };
    });

    // Set initial rows for the table context
    setSavedRows(existingRows);

    // Set initial observations count
    setObservationCount(observationsData.supplementaryObservationData.observationCount);
  }, [observationsData, hasLoadedObservationsData]);

  /**
   * Runs onces on initial page load.
   */
  useEffect(() => {
    if (taxonomyCacheStatus.isInitializing || taxonomyCacheStatus.isInitialized) {
      // Taxonomy cache is currently loading, or has already loaded
      return;
    }

    if (!observationsData) {
      // No obserations data has laoded
      return;
    }

    // Only attempt to initialize the cache once
    setTaxonomyCacheStatus({ isInitializing: true, isInitialized: false });

    if (!observationsData.surveyObservations.length) {
      // No taxonomy records to fetch and cache
      setTaxonomyCacheStatus({ isInitializing: false, isInitialized: true });
      return;
    }

    const uniqueTaxonomicIds: number[] = Array.from(
      observationsData.surveyObservations.reduce((acc: Set<number>, record: IObservationRecord) => {
        if (record.itis_tsn) {
          acc.add(record.itis_tsn);
        }
        return acc;
      }, new Set<number>([]))
    );

    // Fetch and cache all unique taxonomic IDs
    cacheSpeciesTaxonomyByIds(uniqueTaxonomicIds)
      .catch(() => {})
      .finally(() => {
        setTaxonomyCacheStatus({ isInitializing: false, isInitialized: true });
      });
  }, [
    cacheSpeciesTaxonomyByIds,
    observationsData,
    taxonomyCacheStatus.isInitialized,
    taxonomyCacheStatus.isInitializing
  ]);

  /**
   * Runs when row records are being saved and transitioned from Edit mode to View mode.
   */
  useEffect(() => {
    if (!_muiDataGridApiRef?.current?.getRowModels) {
      // Data grid is not fully initialized
      return;
    }

    if (!_isStoppingEdit.current) {
      // Stop edit mode not in progress, cannot save yet
      return;
    }

    if (!modifiedRowIds.length) {
      // No rows to save
      return;
    }

    if (_isSavingData.current) {
      // Saving already in progress
      return;
    }

    if (modifiedRowIds.some((id) => _muiDataGridApiRef.current.getRowMode(id) === 'edit')) {
      // Not all rows have transitioned to view mode, cannot save yet
      return;
    }

    // Start saving records
    _isSavingData.current = true;

    // All rows have transitioned to view mode
    _isStoppingEdit.current = false;

    const rowModels = _muiDataGridApiRef.current.getRowModels();

    const rowValues = Array.from(rowModels, ([_, value]) => value);

    const measurements = measurementColumns.map((item) => item.measurement);

    // Build the object expected by the SIMS API
    const rowsToSave = rowValues.map((row) => {
      const standardColumnsToSave: IStandardObservationColumns = row as IStandardObservationColumns;

      const measurementColumnsToSave: MeasurementColumnToSave[] = [];

      const rowEntries = Object.entries(row);
      rowEntries.forEach(([key, value]) => {
        const matchingMeasurement = measurements.find((item) => item.taxon_measurement_id === key);

        if (matchingMeasurement) {
          measurementColumnsToSave.push({
            id: matchingMeasurement.taxon_measurement_id,
            field: matchingMeasurement.measurement_name,
            value: (value as any) || null
          });
        }
      });

      return {
        standardColumns: standardColumnsToSave,
        measurementColumns: measurementColumnsToSave
      };
    });

    _saveRecords(rowsToSave);
  }, [_muiDataGridApiRef, _saveRecords, measurementColumns, modifiedRowIds, rowModesModel]);

  const observationsTableContext: IObservationsTableContext = useMemo(
    () => ({
      _muiDataGridApiRef,
      savedRows,
      setSavedRows,
      stagedRows,
      setStagedRows,
      rowModesModel,
      setRowModesModel,
      columnVisibilityModel,
      setColumnVisibilityModel,
      addObservationRecord,
      saveObservationRecords,
      deleteObservationRecords,
      discardChanges,
      refreshObservationRecords,
      getSelectedObservationRecords,
      hasUnsavedChanges,
      onRowEditStart,
      rowSelectionModel,
      onRowSelectionModelChange: setRowSelectionModel,
      isLoading,
      isSaving,
      _isSavingData,
      _isStoppingEdit,
      validationModel,
      observationCount,
      setObservationCount,
      setPaginationModel,
      paginationModel,
      setSortModel,
      hasError,
      sortModel,
      measurementColumns,
      setMeasurementColumns,
      disabled,
      setDisabled
    }),
    [
      _muiDataGridApiRef,
      savedRows,
      stagedRows,
      rowModesModel,
      columnVisibilityModel,
      addObservationRecord,
      saveObservationRecords,
      deleteObservationRecords,
      discardChanges,
      refreshObservationRecords,
      getSelectedObservationRecords,
      hasUnsavedChanges,
      rowSelectionModel,
      isLoading,
      isSaving,
      validationModel,
      observationCount,
      paginationModel,
      hasError,
      sortModel,
      measurementColumns,
      disabled
    ]
  );

  return (
    <ObservationsTableContext.Provider value={observationsTableContext}>
      {props.children}
    </ObservationsTableContext.Provider>
  );
};
