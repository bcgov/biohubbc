import {
  GridColDef,
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRowSelectionModel,
  GridSortModel,
  useGridApiRef
} from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { SIMS_HABITAT_FEATURES_HIDDEN_COLUMNS } from 'constants/session-storage';
import { HABITAT_FEATURE_TABLE_PAGE_SIZES } from 'features/surveys/habitat-features/components/tables/SurveyHabitatFeatureTable';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { usePersistentState } from 'hooks/usePersistentState';
import { getSurveyHabitatFeaturesWithSupplementaryData } from 'interfaces/useSurveyHabitatFeatureApi.interface';
import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';

export interface IHabitatFeatureRow {
  survey_habitat_feature_id: number;
  survey_id: number;
  habitat_feature_type_id: number;
  survey_habitat_feature_taxons: string[];
  count: number;
  latitude: number | null;
  longitude: number | null;
  observed_date: string | null;
  observed_time: string | null;
  survey_sample_period_id: number | null;
  survey_sample_period_start_datetime: string | null;
  survey_sample_site_name: string | null;
  method_technique_name: string | null;
  [habitatFeatureDefinitionUuid: string]: number | string | unknown;
}

export interface IHabitatFeatureTableContext {
  /**
   * API ref used to interface with an MUI DataGrid representing the habitat feature records
   */
  _muiDataGridApiRef: React.MutableRefObject<GridApiCommunity>;
  /**
   * The columns of the table
   */
  columns: GridColDef<IHabitatFeatureRow>[];
  /**
   * The columns that are currently hidden
   */
  hiddenColumns: string[];
  /**
   * The rows of the table
   */
  rows: IHabitatFeatureRow[];
  /**
   * The total number of rows the server has
   */
  rowCount: number;
  /**
   * Indicates if the data is currently loading
   */
  isLoading: boolean;
  /**
   * The column visibility model, which defines which columns are visible
   */
  columnVisibilityModel: GridColumnVisibilityModel;
  /**
   * Callback fired when column visibility model changes
   */
  onColumnVisibilityModelChange: (model: GridColumnVisibilityModel) => void;
  /**
   * The row selection model - an array of row ids
   */
  rowSelectionModel: GridRowSelectionModel;
  /**
   * Callback fired when row selection model changes
   */
  onRowSelectionModelChange: (model: GridRowSelectionModel) => void;
  /**
   * The pagination model, which defines which observation records to fetch and load in the table.
   */
  paginationModel: GridPaginationModel;
  /**
   * Sets the pagination model.
   */
  onPaginationModelChange: (model: GridPaginationModel) => void;
  /**
   * The sort model, which defines the sorting of the table
   */
  sortModel: GridSortModel;
  /**
   * Sets the sort model
   */
  onSortModelChange: (model: GridSortModel) => void;
  /**
   * Toggle a columns visibility
   */
  toggleColumnVisibility: (column: string) => void;
  /**
   * Refresh the data in the table
   */
  refreshHabitatFeatureRecords: () => Promise<getSurveyHabitatFeaturesWithSupplementaryData | undefined>;
}

type IHabitatFeatureTableContextProviderProps = PropsWithChildren;

export const HabitatFeatureTableContext = createContext<IHabitatFeatureTableContext | undefined>(undefined);

/**
 * Provider for the Habitat Feature Table context.
 *
 * @param {IHabitatFeatureTableContextProviderProps} props
 * @returns {*}
 */
export const HabitatFeatureTableContextProvider = (props: IHabitatFeatureTableContextProviderProps) => {
  const _muiDataGridApiRef = useGridApiRef();

  const biohubApi = useBiohubApi();
  const codesContext = useCodesContext();
  const { surveyId } = useSurveyContext();

  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);

  // Stores the column visibility state in local storage
  const [columnVisibilityModel, setColumnVisibilityModel] = usePersistentState<GridColumnVisibilityModel>(
    SIMS_HABITAT_FEATURES_HIDDEN_COLUMNS,
    {}
  );

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: HABITAT_FEATURE_TABLE_PAGE_SIZES[0]
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'observed_date', sort: 'desc' }]);

  const habitatFeatureDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.habitatFeature.getSurveyHabitatFeaturesWithSupplementaryData(surveyId, pagination)
  );

  /**
   * Refreshes the observations table with the latest records from the server.
   *
   * @param {GridPaginationModel} paginationModel
   * @param {GridSortModel} sortModel
   * @return {*} {Promise<getSurveyHabitatFeaturesWithSupplementaryData | undefined>}
   */
  const refreshPaginatedHabitatFeatureRecords = useCallback(
    async (paginationModel: GridPaginationModel, sortModel: GridSortModel) => {
      const sort = firstOrNull(sortModel);

      return habitatFeatureDataLoader.refresh({
        limit: paginationModel.pageSize,
        sort: sort?.field || undefined,
        order: sort?.sort || undefined,

        // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
        page: paginationModel.page + 1
      });
    },
    [habitatFeatureDataLoader]
  );

  /**
   * Refreshes the observations table with the latest records from the server.
   *
   * @return {*} {Promise<getSurveyHabitatFeaturesWithSupplementaryData | undefined>}
   */
  const refreshHabitatFeatureRecords = useCallback(async () => {
    return refreshPaginatedHabitatFeatureRecords(paginationModel, sortModel);
  }, [paginationModel, refreshPaginatedHabitatFeatureRecords, sortModel]);

  // Load the codes and habitat feature data
  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  // Load the habitat feature data
  useEffect(() => {
    if (habitatFeatureDataLoader.hasLoaded || habitatFeatureDataLoader.isLoading) {
      return;
    }

    refreshHabitatFeatureRecords();
  }, [habitatFeatureDataLoader.hasLoaded, habitatFeatureDataLoader.isLoading, refreshHabitatFeatureRecords]);

  /**
   * Toggle the table columns visibility
   *
   * @param {{columns: string[]}} [config] - Array of columns to hide
   * @returns {void}
   */
  const toggleColumnsVisibility = useCallback(
    (column: string) => {
      const updatedVisibilityModel = { ...columnVisibilityModel };

      updatedVisibilityModel[column] =
        updatedVisibilityModel[column] === undefined ? false : !updatedVisibilityModel[column];

      setColumnVisibilityModel(updatedVisibilityModel);
    },
    [columnVisibilityModel, setColumnVisibilityModel]
  );

  // Columns hidden from table view
  const hiddenColumns = useMemo(() => {
    const columns = Object.keys(columnVisibilityModel);
    return columns.filter((column) => !columnVisibilityModel[column]);
  }, [columnVisibilityModel]);

  // Create a map of habitat feature type ids to their respective names
  const habitatFeatureTypeMap: Map<number, string> = useMemo(() => {
    return new Map(
      codesContext.codesDataLoader.data?.habitat_feature_types.map((featureType) => [featureType.id, featureType.name])
    );
  }, [codesContext.codesDataLoader.data?.habitat_feature_types]);

  // Create the rows for the table
  const habitatFeatureTableRows: IHabitatFeatureRow[] = useMemo(() => {
    if (!habitatFeatureDataLoader.data) {
      return [];
    }

    return habitatFeatureDataLoader.data.surveyHabitatFeatures.map((habitatFeature) => ({
      survey_habitat_feature_id: habitatFeature.survey_habitat_feature_id,
      survey_id: habitatFeature.survey_id,
      habitat_feature_type_id: habitatFeature.habitat_feature_type_id,
      survey_habitat_feature_taxons: habitatFeature.survey_habitat_feature_taxons.map(
        (taxon) => taxon.itis_scientific_name
      ),
      count: habitatFeature.count,
      latitude: habitatFeature.latitude,
      longitude: habitatFeature.longitude,
      observed_date: habitatFeature.observed_date,
      observed_time: habitatFeature.observed_time,
      survey_sample_period_id: habitatFeature.survey_sample_period_id,
      survey_sample_period_start_datetime: habitatFeature.survey_sample_period_start_datetime,
      survey_sample_site_name: habitatFeature.survey_sample_site_name,
      method_technique_name: habitatFeature.method_technique_name
      // TODO: Mac: Add the qualitative and quantitative data to the row
    }));
  }, [habitatFeatureDataLoader.data]);

  // Create the columns for the table
  const habitatFeatureTableColumns: GridColDef<IHabitatFeatureRow>[] = useMemo(() => {
    const quantitativeColumns: GridColDef<IHabitatFeatureRow>[] =
      habitatFeatureDataLoader.data?.supplementaryData.habitatFeatureQuantitativeDefinitions.map(
        (quantitativeDefintion) => ({
          field: quantitativeDefintion.habitat_feature_quantitative_definition_id,
          headerName: quantitativeDefintion.name,
          align: 'left' // Quantitative columns are numeric
        })
      ) ?? [];

    const qualitativeColumns: GridColDef<IHabitatFeatureRow>[] =
      habitatFeatureDataLoader.data?.supplementaryData.habitatFeatureQualitativeDefinitions.map(
        (qualitativeDefinition) => ({
          field: qualitativeDefinition.habitat_feature_qualitative_definition_id,
          headerName: qualitativeDefinition.name,
          align: 'left' // Qualitative columns are text
        })
      ) ?? [];

    const standardColumns: GridColDef<IHabitatFeatureRow>[] = [
      {
        field: 'habitat_feature_type_id',
        headerName: 'Feature',
        align: 'left',
        flex: 1,
        valueGetter: (params) => habitatFeatureTypeMap.get(params.value)
      },
      {
        field: 'survey_habitat_feature_taxons',
        headerName: 'Species',
        align: 'left',
        flex: 1,
        sortable: false, // Not supported by the API
        valueGetter: (params) => params.row.survey_habitat_feature_taxons.join(', ')
      },
      {
        field: 'survey_sample_site_name',
        headerName: 'Site',
        align: 'left',
        flex: 1
      },
      {
        field: 'method_technique_name',
        headerName: 'Technique',
        align: 'left',
        flex: 1
      },
      {
        field: 'survey_sample_period_start_datetime',
        headerName: 'Period',
        align: 'left',

        flex: 1
      },
      {
        field: 'count',
        headerName: 'Count',
        headerAlign: 'left',
        align: 'left',

        flex: 1
      },
      {
        field: 'latitude',
        headerName: 'Lat',
        headerAlign: 'left',
        align: 'left',

        flex: 1
      },
      {
        field: 'longitude',
        headerName: 'Long',
        headerAlign: 'left',
        align: 'left',

        flex: 1
      },
      {
        field: 'observed_date',
        headerName: 'Date',

        flex: 1
      },
      {
        field: 'observed_time',
        headerName: 'Time',
        headerAlign: 'left',
        align: 'left',

        flex: 1
      }
    ];

    return standardColumns.concat(quantitativeColumns).concat(qualitativeColumns);
  }, [
    habitatFeatureDataLoader.data?.supplementaryData.habitatFeatureQualitativeDefinitions,
    habitatFeatureDataLoader.data?.supplementaryData.habitatFeatureQuantitativeDefinitions,
    habitatFeatureTypeMap
  ]);

  // Create the memoized context object
  const habitatFeatureTableContxt: IHabitatFeatureTableContext = useMemo(() => {
    return {
      _muiDataGridApiRef: _muiDataGridApiRef,
      columns: habitatFeatureTableColumns,
      rows: habitatFeatureTableRows,
      rowCount: habitatFeatureDataLoader.data?.pagination.total ?? 0,
      isLoading: habitatFeatureDataLoader.isLoading,
      rowSelectionModel: rowSelectionModel,
      onRowSelectionModelChange: setRowSelectionModel,
      columnVisibilityModel: columnVisibilityModel,
      onColumnVisibilityModelChange: setColumnVisibilityModel,
      paginationModel: paginationModel,
      onPaginationModelChange: (newPaginationModel) => {
        setPaginationModel(newPaginationModel);
        refreshPaginatedHabitatFeatureRecords(newPaginationModel, sortModel);
      },
      sortModel: sortModel,
      onSortModelChange: (newSortModel) => {
        setSortModel(newSortModel);
        refreshPaginatedHabitatFeatureRecords(paginationModel, newSortModel);
      },
      hiddenColumns: hiddenColumns,
      toggleColumnVisibility: toggleColumnsVisibility,
      refreshHabitatFeatureRecords: refreshHabitatFeatureRecords
    };
  }, [
    _muiDataGridApiRef,
    habitatFeatureTableColumns,
    habitatFeatureTableRows,
    habitatFeatureDataLoader.data?.pagination.total,
    habitatFeatureDataLoader.isLoading,
    rowSelectionModel,
    columnVisibilityModel,
    setColumnVisibilityModel,
    paginationModel,
    sortModel,
    hiddenColumns,
    toggleColumnsVisibility,
    refreshHabitatFeatureRecords,
    refreshPaginatedHabitatFeatureRecords
  ]);

  return (
    <HabitatFeatureTableContext.Provider value={habitatFeatureTableContxt}>
      {props.children}
    </HabitatFeatureTableContext.Provider>
  );
};
