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
  useGridApiRef
} from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { ObservationsTableI18N } from 'constants/i18n';
import {
  getSurveySessionStorageKey,
  SIMS_OBSERVATIONS_ENVIRONMENT_COLUMNS,
  SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS
} from 'constants/session-storage';
import { DialogContext } from 'contexts/dialogContext';
import {
  isQualitativeMeasurementTypeDefinition,
  isQuantitativeMeasurementTypeDefinition
} from 'features/surveys/observations/observations-table/grid-column-definitions/GridColumnDefinitionsUtils';
import {
  validateObservationTableRow,
  validateObservationTableRowEnvironments,
  validateObservationTableRowMeasurements
} from 'features/surveys/observations/observations-table/observation-row-validation/ObservationRowValidationUtils';
import { APIError } from 'hooks/api/useAxios';
import { IObservationTableRowToSave, SubcountToSave } from 'hooks/api/useObservationApi';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useObservationsContext, useObservationsPageContext, useTaxonomyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { CBMeasurementSearchByTsnResponse, CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { IGetSurveyObservationsResponse, ObservationRecord } from 'interfaces/useObservationApi.interface';
import { EnvironmentType, EnvironmentTypeIds } from 'interfaces/useReferenceApi.interface';
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
import { firstOrNull } from 'utils/Utils';
import { v4 as uuidv4 } from 'uuid';
import { RowValidationError, TableValidationModel } from '../components/data-grid/DataGridValidationAlert';
import { SIMS_OBSERVATIONS_HIDDEN_COLUMNS } from '../constants/session-storage';
import { SurveyContext } from './surveyContext';

export type TsnMeasurementTypeDefinitionMap = Record<
  string,
  CBMeasurementSearchByTsnResponse | Promise<CBMeasurementSearchByTsnResponse>
>;

export interface IObservationTableRow extends Partial<ObservationRecord> {
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
   * Callback that must be provided to the MUI DataGrid component to handle row modes changes.
   */
  onRowModesModelChange: (model: GridRowModesModel) => void;
  /**
   * The column visibility model, which defines which columns are visible or hidden.
   */
  columnVisibilityModel: GridColumnVisibilityModel;
  /**
   * Callback that must be provided to the MUI DataGrid component to handle column visibility changes.
   */
  onColumnVisibilityModelChange: (model: GridColumnVisibilityModel) => void;
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
   * Deletes all of the given measurement columns, for all observation records, and removes them from the Observation
   * table.
   *
   * @param {string[]} measurementIds The critterbase taxon measurement ids to delete.
   * @param {() => void} [onSuccess] Optional callback that fires after the user confirms the deletion, and the deletion
   * is successful.
   */
  deleteObservationMeasurementColumns: (measurementIds: string[], onSuccess?: () => void) => void;
  /**
   * Deletes all of the given environment columns, for all observation records, and removes them from the Observation
   * table.
   *
   * @param {EnvironmentTypeIds} environmentIds The environment ids to delete.
   * @param {() => void} [onSuccess] Optional callback that fires after the user confirms the deletion, and the deletion
   * is successful.
   */
  deleteObservationEnvironmentColumns: (environmentIds: EnvironmentTypeIds, onSuccess?: () => void) => void;
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
   * Callback that must be provided to the MUI DataGrid component to handle row updates.
   */
  processRowUpdate: (newRow: IObservationTableRow) => IObservationTableRow;
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
  measurementColumns: CBMeasurementType[];
  /**
   * Sets the user-added measurement columns.
   */
  setMeasurementColumns: React.Dispatch<React.SetStateAction<CBMeasurementType[]>>;
  /**
   * User-added measurement columns that are not part of the default observation table columns.
   */
  environmentColumns: EnvironmentType;
  /**
   * Sets the user-added environment columns.
   */
  setEnvironmentColumns: React.Dispatch<React.SetStateAction<EnvironmentType>>;
  /**
   * Used to disable the entire table.
   */
  isDisabled: boolean;
  /**
   * Sets the disabled state of the table.
   */
  setIsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  /**
   * Opens the dialog for adding a comment to an observation.
   */
  openCommentDialog: (rowId: number) => void;
  /**
   * Closes the dialog for adding a comment to an observation
   */
  closeCommentDialog: () => void;
  /**
   * The row Id of the observation being commented on
   */
  commentDialogRowId: number | null;
};

export type IObservationsTableContextProviderProps = PropsWithChildren;

export const ObservationsTableContext = createContext<IObservationsTableContext | undefined>(undefined);

export const ObservationsTableContextProvider = (props: IObservationsTableContextProviderProps) => {
  const { projectId, surveyId } = useContext(SurveyContext);

  const _muiDataGridApiRef = useGridApiRef();

  const observationsPageContext = useObservationsPageContext();

  const {
    observationsDataLoader: {
      data: observationsData,
      isLoading: isLoadingObservationsData,
      hasLoaded: hasLoadedObservationsData,
      refresh: refreshObservationsData
    }
  } = useObservationsContext();

  const critterbaseApi = useCritterbaseApi();

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
  const [measurementColumns, setMeasurementColumns] = useState<CBMeasurementType[]>([]);

  // Stores any environment columns that are not part of the default observation table columns
  const [environmentColumns, setEnvironmentColumns] = useState<EnvironmentType>({
    qualitative_environments: [],
    quantitative_environments: []
  });

  // Internal disabled state for the observations table, should not be used outside of this context
  const [_isDisabled, setIsDisabled] = useState(false);

  // Stores the id of an observation row being commented on. When not null, the comment dialog is open.
  const [commentDialogRowId, setCommentDialogRowId] = useState<number | null>(null);

  // Global disabled state for the observations table
  const isDisabled = useMemo(() => {
    return _isDisabled || observationsPageContext.isDisabled;
  }, [_isDisabled, observationsPageContext.isDisabled]);

  // Column visibility model
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(() => {
    // Get initial column visibility model from session storage
    const measurementDefinitionsStringified = sessionStorage.getItem(
      getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_HIDDEN_COLUMNS)
    );

    if (measurementDefinitionsStringified) {
      return JSON.parse(measurementDefinitionsStringified);
    }

    return {};
  });

  // Pagination model
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 50
  });

  // Sort model
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'observation_date', sort: 'desc' }]);

  // TSN Measurement Type Definition Map
  const tsnMeasurementTypeDefinitionMapRef = useRef<TsnMeasurementTypeDefinitionMap>({});

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
   * Callback fired when the column visibility model changes.
   *
   * Note: Any column not included in the model will default to being visible.
   *
   * @param {GridColumnVisibilityModel} model
   */
  const onColumnVisibilityModelChange = useCallback(
    (model: GridColumnVisibilityModel) => {
      // Store current visibility model in session storage
      sessionStorage.setItem(
        getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_HIDDEN_COLUMNS),
        JSON.stringify(model)
      );

      // Update the column visibility model in the context
      setColumnVisibilityModel(model);
    },
    [surveyId]
  );

  /**
   * Callback fired when the row modes model changes.
   * The row modes model stores the `view` vs `edit` state of the rows.
   *
   * Note: Any row not included in the model will default to `view` mode.
   *
   * @param {GridRowModesModel} model
   */
  const onRowModesModelChange = useCallback((model: GridRowModesModel) => {
    setRowModesModel(() => model);
  }, []);

  /**
   * Callback fired when a row transitions from `view` mode to `edit` mode.
   *
   * @param {IObservationTableRow} newRow
   * @return {*}
   */
  const processRowUpdate = useCallback(
    (newRow: IObservationTableRow) => {
      if (savedRows.find((row) => row.id === newRow.id)) {
        // Update savedRows
        setSavedRows((currentSavedRows) => currentSavedRows.map((row) => (row.id === newRow.id ? newRow : row)));
      } else {
        // Update stagedRows
        setStagedRows((currentStagedRows) => currentStagedRows.map((row) => (row.id === newRow.id ? newRow : row)));
      }

      return newRow;
    },
    [savedRows]
  );

  /**
   * Gets all rows from the table, including values that have been edited in the table.
   */
  const _getRowsWithEditedValues = useCallback((): IObservationTableRow[] => {
    return modifiedRowIds.map((modifiedRowId) => {
      const row = _muiDataGridApiRef.current.getRow(modifiedRowId);

      // Get the current values from the table for the row
      const editRow = _muiDataGridApiRef.current.state.editRows[modifiedRowId];

      if (!editRow) {
        return row;
      }

      const newRow: Record<string, any> = { ...row };
      for (const [key, value] of Object.entries(editRow)) {
        newRow[key] = value.value;
      }

      // Return the row, which now contains the latest values from the table
      return newRow;
    }) as IObservationTableRow[];
  }, [_muiDataGridApiRef, modifiedRowIds]);

  /**
   * Fetches measurement definitions from Critterbase for a given itis_tsn number, caching the responses for subsequent
   * calls.
   *
   * @param {number} tsn
   * @return {*}  {(Promise<CBMeasurementSearchByTsnResponse | null | undefined>)}
   */
  const getTsnMeasurementTypeDefinitionMap = useCallback(
    async (tsn: number): Promise<CBMeasurementSearchByTsnResponse | null | undefined> => {
      const currentMap = tsnMeasurementTypeDefinitionMapRef.current;

      if (currentMap[tsn]) {
        // Return cached measurements for tsn
        return currentMap[tsn];
      }

      // Fetch measurements for tsn
      currentMap[String(tsn)] = critterbaseApi.xref.getTaxonMeasurements(tsn).then((response) => response);

      // Update the ref with the new map
      tsnMeasurementTypeDefinitionMapRef.current = currentMap;

      // Return the promise
      return currentMap[tsn];
    },
    [critterbaseApi.xref]
  );

  /**
   * Validates all rows belonging to the table.
   * Returns null if validation passes, otherwise returns the validation model.
   *
   * @return {*}  {(Promise<ObservationTableValidationModel | null>)}
   */
  const _validateRows = useCallback(async (): Promise<ObservationTableValidationModel | null> => {
    const rowsWithEditedValues = _getRowsWithEditedValues();

    const tableColumns = _muiDataGridApiRef.current.getAllColumns?.() ?? [];

    // Kick off all tsn measurement fetches in parallel
    for (const row of rowsWithEditedValues) {
      row.itis_tsn && getTsnMeasurementTypeDefinitionMap(row.itis_tsn);
    }

    const requiredStandardColumns: (keyof IObservationTableRow)[] = [
      'observation_subcount_sign_id',
      'count',
      'latitude',
      'longitude',
      'observation_date',
      'observation_time',
      'itis_tsn'
    ];

    const validationModel: ObservationTableValidationModel = {};

    for (const row of rowsWithEditedValues) {
      // check standard required columns
      const standardColumnErrors = validateObservationTableRow(row, requiredStandardColumns, tableColumns);

      // check any measurement columns found
      const measurementErrors = await validateObservationTableRowMeasurements(
        row,
        measurementColumns,
        getTsnMeasurementTypeDefinitionMap
      );

      const environmentErrors = await validateObservationTableRowEnvironments(row, environmentColumns);

      const totalErrors = [...standardColumnErrors, ...measurementErrors, ...environmentErrors];
      if (totalErrors.length > 0) {
        validationModel[row.id] = totalErrors;
      }
    }

    setValidationModel(validationModel);

    return Object.keys(validationModel).length > 0 ? validationModel : null;
  }, [
    _getRowsWithEditedValues,
    _muiDataGridApiRef,
    environmentColumns,
    measurementColumns,
    getTsnMeasurementTypeDefinitionMap
  ]);

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
          await biohubApi.observation.deleteObservationRecords(projectId, surveyId, savedRowIdsToDelete);
          // Refresh the table after deleting one or more records
          refreshObservationRecords();
        }

        // Remove deleted row IDs from the validation model
        setValidationModel((prevValidationModel) => {
          const newValidationModel = { ...prevValidationModel };
          for (const rowIdToDelete of allRowIdsToDelete) {
            delete newValidationModel[rowIdToDelete];
          }
          return newValidationModel;
        });

        // Update saved rows, removing any deleted rows
        setSavedRows((currentSavedRows) =>
          currentSavedRows.filter((savedRow) => !savedRowIdsToDelete.includes(String(savedRow.id)))
        );

        // Update staged rows, removing any deleted rows
        setStagedRows((currentStagedRows) =>
          currentStagedRows.filter((stagedRow) => !stagedRowIdsToDelete.includes(String(stagedRow.id)))
        );

        // Updated editing rows, removing deleted rows
        setModifiedRowIds((currentModifiedRowIds) =>
          currentModifiedRowIds.filter((modifiedRowId) => !allRowIdsToDelete.includes(modifiedRowId))
        );

        // Updated row modes model, removing deleted rows
        setRowModesModel((currentRowModesModel) => {
          const newRowModesModel = { ...currentRowModesModel };
          for (const rowIdToDelete of allRowIdsToDelete) {
            delete newRowModesModel[rowIdToDelete];
          }
          return newRowModesModel;
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
    [
      savedRows,
      stagedRows,
      setYesNoDialog,
      setSnackbar,
      biohubApi.observation,
      projectId,
      surveyId,
      refreshObservationRecords,
      setErrorDialog
    ]
  );

  /**
   * Deletes the given records from the server and removes them from the table.
   *
   * @param {string[]} measurementIds The critterbase taxon measurement ids to delete.
   * @return {*}  {Promise<void>}
   */
  const _deleteMeasurementColumns = useCallback(
    async (measurementIds: string[]): Promise<void> => {
      if (!measurementIds.length) {
        return;
      }

      try {
        // Delete measurement columns from the database
        await biohubApi.observation.deleteObservationMeasurements(projectId, surveyId, measurementIds);

        // Close yes-no dialog
        setYesNoDialog({ open: false });

        // Show snackbar for successful deletion
        setSnackbar({
          snackbarMessage: (
            <Typography variant="body2" component="div">
              {measurementIds.length === 1
                ? ObservationsTableI18N.deleteSingleMeasurementColumnSuccessSnackbarMessage
                : ObservationsTableI18N.deleteMultipleMeasurementColumnSuccessSnackbarMessage(measurementIds.length)}
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
          dialogTitle: ObservationsTableI18N.removeMeasurementColumnsErrorDialogTitle,
          dialogText: ObservationsTableI18N.removeMeasurementColumnsErrorDialogText,
          open: true
        });
      }
    },
    [setYesNoDialog, setSnackbar, biohubApi.observation, projectId, surveyId, setErrorDialog]
  );

  /**
   * Deletes the given records from the server and removes them from the table.
   *
   * @param {EnvironmentTypeIds} environmentIds The critterbase taxon environment ids to delete.
   * @return {*}  {Promise<void>}
   */
  const _deleteEnvironmentColumns = useCallback(
    async (environmentIds: EnvironmentTypeIds): Promise<void> => {
      const environmentIdsLength =
        environmentIds.qualitative_environments.length + environmentIds.quantitative_environments.length;

      if (!environmentIdsLength) {
        return;
      }

      try {
        // Delete environment columns from the database
        await biohubApi.observation.deleteObservationEnvironments(projectId, surveyId, environmentIds);

        // Close yes-no dialog
        setYesNoDialog({ open: false });

        // Show snackbar for successful deletion
        setSnackbar({
          snackbarMessage: (
            <Typography variant="body2" component="div">
              {environmentIdsLength === 1
                ? ObservationsTableI18N.deleteSingleEnvironmentColumnSuccessSnackbarMessage
                : ObservationsTableI18N.deleteMultipleEnvironmentColumnSuccessSnackbarMessage(environmentIdsLength)}
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
          dialogTitle: ObservationsTableI18N.removeEnvironmentColumnsErrorDialogTitle,
          dialogText: ObservationsTableI18N.removeEnvironmentColumnsErrorDialogText,
          open: true
        });
      }
    },
    [setYesNoDialog, setSnackbar, biohubApi.observation, projectId, surveyId, setErrorDialog]
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
   * Opens the comment dialog
   */
  const openCommentDialog = useCallback((rowId: number) => {
    setCommentDialogRowId(rowId);
  }, []);

  /**
   * Closes the comment dialog
   */
  const closeCommentDialog = useCallback(() => {
    setCommentDialogRowId(null);
  }, []);

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
   * Renders a dialog that prompts the user to delete the given measurement columns (from all observation records).
   *
   * @param {string[]} measurementIds The critterbase taxon measurement ids to delete.
   * @param {() => void} [onSuccess] Optional callback that fires after the user confirms the deletion, and the deletion
   * is successful.
   * @return {*}
   */
  const deleteObservationMeasurementColumns = useCallback(
    (measurementIds: string[], onSuccess?: () => void) => {
      if (!measurementIds.length) {
        return;
      }

      setYesNoDialog({
        dialogTitle:
          measurementIds.length === 1
            ? ObservationsTableI18N.removeSingleMeasurementColumnDialogTitle
            : ObservationsTableI18N.removeMultipleMeasurementColumnsDialogTitle(measurementIds.length),
        dialogText:
          measurementIds.length === 1
            ? ObservationsTableI18N.removeSingleMeasurementColumnDialogText
            : ObservationsTableI18N.removeMultipleMeasurementColumnsDialogText,
        yesButtonProps: {
          color: 'error',
          loading: false
        },
        yesButtonLabel:
          measurementIds.length === 1
            ? ObservationsTableI18N.removeSingleMeasurementColumnButtonText
            : ObservationsTableI18N.removeMultipleMeasurementColumnsButtonText,
        noButtonProps: { color: 'primary', variant: 'outlined', disabled: false },
        noButtonLabel: 'Cancel',
        open: true,
        onYes: async () => {
          await _deleteMeasurementColumns(measurementIds);
          onSuccess?.();
        },
        onClose: () => setYesNoDialog({ open: false }),
        onNo: () => setYesNoDialog({ open: false })
      });
    },
    [_deleteMeasurementColumns, setYesNoDialog]
  );

  /**
   * Renders a dialog that prompts the user to delete the given environment columns (from all observation records).
   *
   * @param {EnvironmentTypeIds} environmentIds The critterbase taxon environment ids to delete.
   * @param {() => void} [onSuccess] Optional callback that fires after the user confirms the deletion, and the deletion
   * is successful.
   * @return {*}
   */
  const deleteObservationEnvironmentColumns = useCallback(
    (environmentIds: EnvironmentTypeIds, onSuccess?: () => void) => {
      const environmentIdsLength =
        environmentIds.qualitative_environments.length + environmentIds.quantitative_environments.length;

      if (!environmentIdsLength) {
        return;
      }

      setYesNoDialog({
        dialogTitle:
          environmentIdsLength === 1
            ? ObservationsTableI18N.removeSingleEnvironmentColumnDialogTitle
            : ObservationsTableI18N.removeMultipleEnvironmentColumnsDialogTitle(environmentIdsLength),
        dialogText:
          environmentIdsLength === 1
            ? ObservationsTableI18N.removeSingleEnvironmentColumnDialogText
            : ObservationsTableI18N.removeMultipleEnvironmentColumnsDialogText,
        yesButtonProps: {
          color: 'error',
          loading: false
        },
        yesButtonLabel:
          environmentIdsLength === 1
            ? ObservationsTableI18N.removeSingleEnvironmentColumnButtonText
            : ObservationsTableI18N.removeMultipleEnvironmentColumnsButtonText,
        noButtonProps: { color: 'primary', variant: 'outlined', disabled: false },
        noButtonLabel: 'Cancel',
        open: true,
        onYes: async () => {
          await _deleteEnvironmentColumns(environmentIds);
          onSuccess?.();
        },
        onClose: () => setYesNoDialog({ open: false }),
        onNo: () => setYesNoDialog({ open: false })
      });
    },
    [_deleteEnvironmentColumns, setYesNoDialog]
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
      observation_subcount_sign_id: null as unknown as number,
      count: null as unknown as number,
      observation_date: '',
      observation_time: '',
      latitude: null as unknown as number,
      longitude: null as unknown as number,
      itis_tsn: null as unknown as number,
      itis_scientific_name: ''
    };

    // Append new record to start of staged rows
    setStagedRows([newRecord, ...stagedRows]);

    // Set edit mode for the new row
    setRowModesModel((current) => ({
      ...current,
      [id]: { mode: GridRowModes.Edit }
    }));

    // Add new row id to modified rows array
    setModifiedRowIds((current) => [...current, id]);
  }, [stagedRows]);

  /**
   * Transition all editable rows from edit mode to view mode.
   */
  const saveObservationRecords = useCallback(async () => {
    if (_isStoppingEdit.current) {
      // Stop edit mode already in progress
      return;
    }

    // Validate rows
    try {
      const validationErrors = await _validateRows();
      if (validationErrors) {
        return;
      }
    } catch (error) {
      setErrorDialog({
        onOk: () => setErrorDialog({ open: false }),
        onClose: () => setErrorDialog({ open: false }),
        dialogTitle: ObservationsTableI18N.fetchingTSNMeasurementErrorDialogTitle,
        dialogText: ObservationsTableI18N.fetchingTSNMeasurementErrorDialogText,
        open: true
      });
      return;
    }

    _isStoppingEdit.current = true;

    if (!modifiedRowIds.length) {
      // No rows in edit mode, nothing to stop or save
      _isStoppingEdit.current = false;
      return;
    }

    // Transition all rows in edit mode to view mode
    setRowModesModel(() => {
      const newModel: GridRowModesModel = {};
      for (const id of modifiedRowIds) {
        newModel[id] = { mode: GridRowModes.View };
      }
      return newModel;
    });
  }, [modifiedRowIds, _validateRows, setErrorDialog]);

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
    // Remove any newly created rows
    setStagedRows([]);
    // Clear any validation errors
    setValidationModel({});
    // Reset row modes model to default (all rows in view mode)
    setRowModesModel(() => {
      const newModel: GridRowModesModel = {};
      for (const id of modifiedRowIds) {
        newModel[id] = { mode: GridRowModes.View, ignoreModifications: true };
      }
      return newModel;
    });
    // Remove any rows from the modified rows array
    setModifiedRowIds([]);
  }, [modifiedRowIds]);

  // True if the data grid contains at least 1 unsaved record
  const hasUnsavedChanges = useDeferredValue(modifiedRowIds.length > 0 || stagedRows.length > 0);

  // True if the taxonomy cache is still initializing or the observations data is still loading
  const isLoading: boolean = useMemo(() => {
    return !taxonomyCacheStatus.isInitialized || isLoadingObservationsData || observationsPageContext.isLoading;
  }, [isLoadingObservationsData, observationsPageContext.isLoading, taxonomyCacheStatus.isInitialized]);

  // True if the save process has started
  const isSaving: boolean = _isSavingData.current || _isStoppingEdit.current;

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

  /**
   * Compiles all measurement columns and their values for the given row.
   *
   * @param {ObservationRecord} row
   * @return {*}
   */
  const _getMeasurementsToSave = useCallback(
    (row: ObservationRecord) => {
      const qualitative: SubcountToSave['qualitative_measurements'] = [];
      const quantitative: SubcountToSave['quantitative_measurements'] = [];

      // For each measurement column in the data grid
      for (const measurementDefinition of measurementColumns) {
        // If the row has a non-null/non-undefined value for the measurement column
        if (row[measurementDefinition.taxon_measurement_id]) {
          // If the measurement column is a qualitative measurement, add it to the qualitative array
          if (isQualitativeMeasurementTypeDefinition(measurementDefinition)) {
            qualitative.push({
              measurement_id: measurementDefinition.taxon_measurement_id,
              measurement_option_id: row[measurementDefinition.taxon_measurement_id]
            });
          }

          // If the measurement column is a quantitative measurement, add it to the quantitative array
          if (isQuantitativeMeasurementTypeDefinition(measurementDefinition)) {
            quantitative.push({
              measurement_id: measurementDefinition.taxon_measurement_id,
              measurement_value: row[measurementDefinition.taxon_measurement_id]
            });
          }
        }
      }

      // Return the qualitative and quantitative arrays
      return { qualitative, quantitative };
    },
    [measurementColumns]
  );

  /**
   * Compiles all environment columns and their values for the given row.
   *
   * @param {ObservationRecord} row
   * @return {*}
   */
  const _getEnvironmentsToSave = useCallback(
    (row: ObservationRecord) => {
      const qualitative: SubcountToSave['qualitative_environments'] = [];
      const quantitative: SubcountToSave['quantitative_environments'] = [];

      // For each qualitative environment column in the data grid
      for (const environmentDefinition of environmentColumns.qualitative_environments) {
        // If the row has a non-null/non-undefined value for the column
        if (row[String(environmentDefinition.environment_qualitative_id)]) {
          qualitative.push({
            environment_qualitative_id: environmentDefinition.environment_qualitative_id,
            environment_qualitative_option_id: row[String(environmentDefinition.environment_qualitative_id)]
          });
        }
      }

      // For each quantitative environment column in the data grid
      for (const environmentDefinition of environmentColumns.quantitative_environments) {
        // If the row has a non-null/non-undefined value for the column
        if (row[String(environmentDefinition.environment_quantitative_id)]) {
          quantitative.push({
            environment_quantitative_id: environmentDefinition.environment_quantitative_id,
            value: row[String(environmentDefinition.environment_quantitative_id)]
          });
        }
      }

      // Return the qualitative and quantitative arrays
      return { qualitative, quantitative };
    },
    [environmentColumns]
  );

  /**
   * Compiles all subcount columns and their values for the given row.
   *
   * @param {ObservationRecord} row
   * @return {*}
   */
  const _getSubcountsToSave = useCallback(
    (row: ObservationRecord) => {
      // Get all populated measurement column values for the row
      const measurementsToSave = _getMeasurementsToSave(row);
      const environmentsToSave = _getEnvironmentsToSave(row);

      // Return the subcount row to save
      return {
        observation_subcount_id: row.observation_subcount_id,
        // Map the observation `count` value to the `subcount` value, for now.
        // Why?: Currently there is no UI support for setting a subcount value.
        // See https://apps.nrs.gov.bc.ca/int/jira/browse/SIMSBIOHUB-534
        subcount: row.count,
        observation_subcount_sign_id: row.observation_subcount_sign_id,
        qualitative_measurements: measurementsToSave.qualitative,
        quantitative_measurements: measurementsToSave.quantitative,
        qualitative_environments: environmentsToSave.qualitative,
        quantitative_environments: environmentsToSave.quantitative
      };
    },
    [_getEnvironmentsToSave, _getMeasurementsToSave]
  );

  /**
   * Compiles the given row into the format expected by the SIMS API.
   *
   * @param {ObservationRecord} row
   * @return {*}  {IObservationTableRowToSave}
   */
  const _getRowToSave = useCallback(
    (row: ObservationRecord): IObservationTableRowToSave => {
      // Get all subcount row data for the observation row
      const subcountsToSave = _getSubcountsToSave(row);

      // Return the observation row to save
      return {
        standardColumns: {
          survey_observation_id: row.survey_observation_id,
          itis_tsn: row.itis_tsn,
          itis_scientific_name: row.itis_scientific_name,
          survey_sample_site_id: row.survey_sample_site_id,
          survey_sample_method_id: row.survey_sample_method_id,
          survey_sample_period_id: row.survey_sample_period_id,
          count: row.count,
          observation_date: row.observation_date,
          observation_time: row.observation_time,
          latitude: row.latitude,
          longitude: row.longitude
        },
        // Set the subcount data for the observation row.
        // Why? Currently the UI only supports 1 subcount record per observation record.
        // See https://apps.nrs.gov.bc.ca/int/jira/browse/SIMSBIOHUB-534
        subcounts: [subcountsToSave]
      };
    },
    [_getSubcountsToSave]
  );

  /**
   * Transforms the raw data grid rows into the format expected by the SIMS API.
   *
   * @return {*}  {IObservationTableRowToSave[]}
   */
  const _getRowsToSave = useCallback((): IObservationTableRowToSave[] => {
    // Get all rows that have been modified
    const modifiedRows: ObservationRecord[] = modifiedRowIds
      .map((rowId) => _muiDataGridApiRef.current.getRow(rowId))
      .filter(Boolean);

    // Transform the modified rows into the format expected by the SIMS API
    const rowsToSave: IObservationTableRowToSave[] = modifiedRows.map((modifiedRow) => _getRowToSave(modifiedRow));

    return rowsToSave;
  }, [_getRowToSave, _muiDataGridApiRef, modifiedRowIds]);

  /**
   * Transforms the raw observation data into the format expected by the observations data grid table.
   *
   * @param {IGetSurveyObservationsResponse} observationsData
   * @return {*}  {IObservationTableRow[]}
   */
  const _getRowsToDisplay = useCallback((observationsData: IGetSurveyObservationsResponse): IObservationTableRow[] => {
    // Spread all subcount rows into separate observation table rows, duplicating the parent observation standard row data
    const rowsToDisplay: IObservationTableRow[] = observationsData.surveyObservations.flatMap((observationRow) => {
      // Return a new row for each subcount, which contains the parent observation standard row data
      return observationRow.subcounts.map((subcountRow) => {
        // This code flattens out the array of subcount rows into a single array of observation rows, where each row
        // contains a copy of the parent observation standard row data, and the unique subcount row data.
        // Note: This code currently assumes that each observation record has exactly 1 subcount record.
        // Why? Currently there is no UI support for handling multiple subcount records per observation record.
        // See https://apps.nrs.gov.bc.ca/int/jira/browse/SIMSBIOHUB-534
        return {
          // Spread the standard observation row data into the row
          id: String(observationRow.survey_observation_id),
          ...observationRow,

          // Add the subcount id to the row
          observation_subcount_id: subcountRow.observation_subcount_id,
          // Add the subcount sign data into the row
          observation_subcount_sign_id: subcountRow.observation_subcount_sign_id,

          // Reduce the array of qualitative measurements into an object and spread into the row
          ...subcountRow.qualitative_measurements.reduce((acc, cur) => {
            return {
              ...acc,
              [cur.critterbase_taxon_measurement_id]: cur.critterbase_measurement_qualitative_option_id
            };
          }, {}),
          // Reduce the array of quantitative measurements into an object and spread into the row
          ...subcountRow.quantitative_measurements.reduce((acc, cur) => {
            return {
              ...acc,
              [cur.critterbase_taxon_measurement_id]: cur.value
            };
          }, {}),
          // Reduce the array of qualitative environments into an object and spread into the row
          ...subcountRow.qualitative_environments.reduce((acc, cur) => {
            return {
              ...acc,
              [cur.environment_qualitative_id]: cur.environment_qualitative_option_id
            };
          }, {}),
          // Reduce the array of quantitative environments into an object and spread into the row
          ...subcountRow.quantitative_environments.reduce((acc, cur) => {
            return {
              ...acc,
              [cur.environment_quantitative_id]: cur.value
            };
          }, {})
        };
      });
    });

    return rowsToDisplay;
  }, []);

  /**
   * Fetch new rows based on sort/ pagination model changes
   */
  useEffect(() => {
    refreshObservationRecords();
    // Should not re-run this effect on `refreshObservationRecords` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel, sortModel]);

  /**
   * Runs when the observations data is loaded or refreshed.
   * Set the measurement and environment columns.
   */
  useEffect(() => {
    if (!observationsData) {
      return;
    }

    setMeasurementColumns(() => {
      // Existing measurement definitions from the observations data
      const existingMeasurementDefinitions = [
        ...observationsData.supplementaryObservationData.qualitative_measurements,
        ...observationsData.supplementaryObservationData.quantitative_measurements
      ];

      // Get all measurement definitions from local storage, if any
      const measurementDefinitionsStringified = sessionStorage.getItem(
        getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS)
      );

      let localStorageMeasurementDefinitions: CBMeasurementType[] = [];
      if (measurementDefinitionsStringified) {
        localStorageMeasurementDefinitions = JSON.parse(measurementDefinitionsStringified) as CBMeasurementType[];
      }

      // Remove any duplicate measurement definitions that already exist in the observations data
      localStorageMeasurementDefinitions = localStorageMeasurementDefinitions.filter((item1) => {
        return !existingMeasurementDefinitions.some(
          (item2) => item2.taxon_measurement_id === item1.taxon_measurement_id
        );
      });

      // Set measurement columns, including both existing and local storage measurement definitions
      return [...existingMeasurementDefinitions, ...localStorageMeasurementDefinitions];
    });

    setEnvironmentColumns(() => {
      // Existing environment definitions from the observations data
      const existingEnvironmentDefinitions = {
        qualitative_environments: observationsData.supplementaryObservationData.qualitative_environments,
        quantitative_environments: observationsData.supplementaryObservationData.quantitative_environments
      };

      // Get all environment definitions from local storage, if any
      const environmentDefinitionsStringified = sessionStorage.getItem(
        getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_ENVIRONMENT_COLUMNS)
      );

      let localStorageEnvironmentDefinitions: EnvironmentType = {
        qualitative_environments: [],
        quantitative_environments: []
      };
      if (environmentDefinitionsStringified) {
        localStorageEnvironmentDefinitions = JSON.parse(environmentDefinitionsStringified) as EnvironmentType;
      }

      // Remove any duplicate environment definitions that already exist in the observations data
      const localStorageEnvironmentQualitativeDefinitions =
        localStorageEnvironmentDefinitions.qualitative_environments.filter((item1) => {
          return !existingEnvironmentDefinitions.qualitative_environments.some(
            (item2) => item2.environment_qualitative_id === item1.environment_qualitative_id
          );
        });

      const localStorageEnvironmentQuantitativeDefinitions =
        localStorageEnvironmentDefinitions.quantitative_environments.filter((item1) => {
          return !existingEnvironmentDefinitions.quantitative_environments.some(
            (item2) => item2.environment_quantitative_id === item1.environment_quantitative_id
          );
        });

      // Set environment columns, including both existing and local storage environment definitions
      return {
        qualitative_environments: [
          ...existingEnvironmentDefinitions.qualitative_environments,
          ...localStorageEnvironmentQualitativeDefinitions
        ],
        quantitative_environments: [
          ...existingEnvironmentDefinitions.quantitative_environments,
          ...localStorageEnvironmentQuantitativeDefinitions
        ]
      };
    });
  }, [observationsData, surveyId]);

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

    // Transform the raw observation data into the format expected by the observations data grid table
    const rowsToDisplay = _getRowsToDisplay(observationsData);

    // Set initial rows for the table context
    setSavedRows(rowsToDisplay);

    // Set initial observations count
    setObservationCount(observationsData.supplementaryObservationData.observationCount);
  }, [observationsData, hasLoadedObservationsData, _getRowsToDisplay]);

  /**
   * Runs onces on initial page load.
   */
  useEffect(() => {
    if (taxonomyCacheStatus.isInitializing || taxonomyCacheStatus.isInitialized) {
      // Taxonomy cache is currently loading, or has already loaded
      return;
    }

    if (!observationsData) {
      // No observation data has loaded
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
      observationsData.surveyObservations.reduce((acc: Set<number>, record) => {
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

    const rowsToSave = _getRowsToSave();

    _saveRecords(rowsToSave);
  }, [_getRowsToSave, _muiDataGridApiRef, _saveRecords, measurementColumns, modifiedRowIds, rowModesModel]);

  const observationsTableContext: IObservationsTableContext = useMemo(
    () => ({
      _muiDataGridApiRef,
      savedRows,
      setSavedRows,
      stagedRows,
      setStagedRows,
      rowModesModel,
      onRowModesModelChange,
      columnVisibilityModel,
      onColumnVisibilityModelChange,
      addObservationRecord,
      saveObservationRecords,
      deleteObservationRecords,
      deleteObservationMeasurementColumns,
      deleteObservationEnvironmentColumns,
      discardChanges,
      refreshObservationRecords,
      getSelectedObservationRecords,
      hasUnsavedChanges,
      onRowEditStart,
      processRowUpdate,
      rowSelectionModel,
      onRowSelectionModelChange: setRowSelectionModel,
      isLoading,
      isSaving,
      validationModel,
      observationCount,
      setPaginationModel,
      paginationModel,
      setSortModel,
      hasError,
      sortModel,
      measurementColumns,
      setMeasurementColumns,
      environmentColumns,
      setEnvironmentColumns,
      isDisabled,
      setIsDisabled,
      openCommentDialog,
      closeCommentDialog,
      commentDialogRowId
    }),
    [
      _muiDataGridApiRef,
      savedRows,
      stagedRows,
      rowModesModel,
      onRowModesModelChange,
      columnVisibilityModel,
      onColumnVisibilityModelChange,
      addObservationRecord,
      saveObservationRecords,
      deleteObservationRecords,
      deleteObservationMeasurementColumns,
      deleteObservationEnvironmentColumns,
      discardChanges,
      refreshObservationRecords,
      getSelectedObservationRecords,
      hasUnsavedChanges,
      processRowUpdate,
      rowSelectionModel,
      isLoading,
      isSaving,
      validationModel,
      observationCount,
      paginationModel,
      hasError,
      sortModel,
      measurementColumns,
      environmentColumns,
      isDisabled,
      openCommentDialog,
      closeCommentDialog,
      commentDialogRowId
    ]
  );

  return (
    <ObservationsTableContext.Provider value={observationsTableContext}>
      {props.children}
    </ObservationsTableContext.Provider>
  );
};
