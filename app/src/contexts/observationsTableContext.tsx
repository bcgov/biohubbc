import Typography from '@mui/material/Typography';
import {
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRenderEditCellParams,
  GridRowId,
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
import { useBiohubApi } from 'hooks/useBioHubApi';
import {
  useDialogContext,
  useObservationsContext,
  useObservationsPageContext,
  useTaxonomyContext
} from 'hooks/useContext';
import { CBMeasurementSearchByTsnResponse, CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { IGetSurveyFlattenedObservationsResponse, ObservationRecord } from 'interfaces/useObservationApi.interface';
import { EnvironmentType } from 'interfaces/useReferenceApi.interface';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { firstOrNull } from 'utils/Utils';
import { SIMS_OBSERVATIONS_HIDDEN_COLUMNS } from '../constants/session-storage';
import { SurveyContext } from './surveyContext';

export type TsnMeasurementTypeDefinitionMap = Record<
  string,
  CBMeasurementSearchByTsnResponse | Promise<CBMeasurementSearchByTsnResponse>
>;

export interface IObservationTableRow extends Partial<ObservationRecord> {
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
   * Sets the previously saved rows.
   */
  setRows: React.Dispatch<React.SetStateAction<IObservationTableRow[]>>;
  /**
   * The column visibility model, which defines which columns are visible or hidden.
   */
  columnVisibilityModel: GridColumnVisibilityModel;
  /**
   * Callback that must be provided to the MUI DataGrid component to handle column visibility changes.
   */
  onColumnVisibilityModelChange: (model: GridColumnVisibilityModel) => void;
  /**
   * Deletes all of the given records and removes them from the Observation table.
   */
  deleteRows: (observationRecords: IObservationTableRow[]) => void;
  /**
   * Refreshes the Observation Table with already existing records
   */
  refreshRows: () => Promise<IGetSurveyFlattenedObservationsResponse | undefined>;
  /**
   * Returns all of the observation table records that have been selected
   */
  getSelectedRows: () => IObservationTableRow[];
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
   * User-added environment columns that are not part of the default observation table columns.
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
   * The row Id of the observation being commented on
   */
  commentDialogParams: GridRenderEditCellParams | null;
  /**
   * Sets the row Id of the observation being commented on
   */
  setCommentDialogParams: React.Dispatch<React.SetStateAction<GridRenderEditCellParams | null>>;
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

  const { cacheSpeciesTaxonomyByIds } = useTaxonomyContext();

  const { setYesNoDialog, setSnackbar, setErrorDialog } = useDialogContext();

  const biohubApi = useBiohubApi();

  // Existing rows
  const [rows, setRows] = useState<IObservationTableRow[]>([]);

  // Stores the currently selected row ids
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);

  // Status of the taxonomy cache
  const [taxonomyCacheStatus, setTaxonomyCacheStatus] = useState({ isInitializing: false, isInitialized: false });

  // Stores the current count of observations for this survey
  const [observationCount, setObservationCount] = useState<number>(0);

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
  const [commentDialogParams, setCommentDialogParams] = useState<GridRenderEditCellParams | null>(null);

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
    pageSize: 25
  });

  // Sort model
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'observation_date', sort: 'desc' }]);

  // True if the taxonomy cache is still initializing or the observations data is still loading
  const isLoading: boolean = useMemo(() => {
    return !taxonomyCacheStatus.isInitialized || isLoadingObservationsData || observationsPageContext.isLoading;
  }, [isLoadingObservationsData, observationsPageContext.isLoading, taxonomyCacheStatus.isInitialized]);

  /**
   * Refreshes the observations table with the latest records from the server.
   *
   * @return {*}
   */
  const refreshRows = useCallback(async () => {
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
   * Returns all of the rows that have been selected.
   *
   * @return {*}
   */
  const getSelectedRows: () => IObservationTableRow[] = useCallback(() => {
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
      const savedRowIdsToDelete = allRowIdsToDelete.filter((id) => rows.map((item) => item.id).includes(id));

      try {
        if (savedRowIdsToDelete.length) {
          // Delete previously saved records from the server, if any
          await biohubApi.observation.deleteRows(projectId, surveyId, savedRowIdsToDelete);
          // Refresh the table after deleting one or more records
          refreshRows();
        }

        // Update saved rows, removing any deleted rows
        setRows((currentSavedRows) =>
          currentSavedRows.filter((savedRow) => !savedRowIdsToDelete.includes(String(savedRow.id)))
        );

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
    [rows, setYesNoDialog, setSnackbar, biohubApi.observation, projectId, surveyId, refreshRows, setErrorDialog]
  );

  /**
   * Renders a dialog that prompts the user to delete the given records.
   *
   * @param {IObservationTableRow[]} observationRecords
   * @return {*}
   */
  const deleteRows = useCallback(
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
   * Transforms the raw observation data into the format expected by the observations data grid table.
   *
   * @param {IGetSurveyObservationsResponse} observationsData
   * @return {*}  {IObservationTableRow[]}
   */
  const _getRowsToDisplay = useCallback(
    (observationsData: IGetSurveyFlattenedObservationsResponse): IObservationTableRow[] => {
      // Spread all subcount rows into separate observation table rows, duplicating the parent observation standard row data
      const rowsToDisplay: IObservationTableRow[] = observationsData.surveyObservations.flatMap((observationRow) => {
        const { subcount, qualitative_environments, quantitative_environments, ...restObservation } = observationRow;
        const { qualitative_measurements, quantitative_measurements, ...restSubcount } = subcount;
        return {
          // Set the required datagrid row id
          id: String(restSubcount.observation_subcount_id),

          // Spread the standard observation row data into the row
          ...restObservation,

          // Reduce the array of observation qualitative environments into an object and spread into the row
          ...qualitative_environments.reduce((acc, cur) => {
            return {
              ...acc,
              [cur.environment_qualitative_id]: cur.environment_qualitative_option_id
            };
          }, {}),
          // Reduce the array of observation quantitative environments into an object and spread into the row
          ...quantitative_environments.reduce((acc, cur) => {
            return {
              ...acc,
              [cur.environment_quantitative_id]: cur.value
            };
          }, {}),

          // Spread the standard subcount data into the row
          ...restSubcount,

          // Reduce the array of subcount qualitative measurements into an object and spread into the row
          ...qualitative_measurements.reduce((acc, cur) => {
            return {
              ...acc,
              [cur.critterbase_taxon_measurement_id]: cur.critterbase_measurement_qualitative_option_id
            };
          }, {}),

          // Reduce the array of subcount quantitative measurements into an object and spread into the row
          ...quantitative_measurements.reduce((acc, cur) => {
            return {
              ...acc,
              [cur.critterbase_taxon_measurement_id]: cur.value
            };
          }, {})
        };
      });

      return rowsToDisplay;
    },
    []
  );

  /**
   * Fetch new rows based on sort/ pagination model changes
   */
  useEffect(() => {
    refreshRows();
    // Should not re-run this effect on `refreshRows` changes
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
    setRows(rowsToDisplay);

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

  const observationsTableContext: IObservationsTableContext = useMemo(
    () => ({
      _muiDataGridApiRef,
      rows,
      setRows,
      columnVisibilityModel,
      onColumnVisibilityModelChange,
      deleteRows,
      refreshRows,
      getSelectedRows,
      rowSelectionModel,
      onRowSelectionModelChange: setRowSelectionModel,
      isLoading,
      observationCount,
      setPaginationModel,
      paginationModel,
      setSortModel,
      sortModel,
      measurementColumns,
      setMeasurementColumns,
      environmentColumns,
      setEnvironmentColumns,
      isDisabled,
      setIsDisabled,
      commentDialogParams,
      setCommentDialogParams
    }),
    [
      _muiDataGridApiRef,
      rows,
      columnVisibilityModel,
      onColumnVisibilityModelChange,
      deleteRows,
      refreshRows,
      getSelectedRows,
      rowSelectionModel,
      isLoading,
      observationCount,
      paginationModel,
      sortModel,
      measurementColumns,
      environmentColumns,
      isDisabled,
      commentDialogParams
    ]
  );

  return (
    <ObservationsTableContext.Provider value={observationsTableContext}>
      {props.children}
    </ObservationsTableContext.Provider>
  );
};
