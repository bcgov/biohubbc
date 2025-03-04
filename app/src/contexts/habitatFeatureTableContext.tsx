import { GridColDef, GridColumnVisibilityModel, useGridApiRef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { SIMS_HABITAT_FEATURES_HIDDEN_COLUMNS } from 'constants/session-storage';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { usePersistentState } from 'hooks/usePersistentState';
import { createContext, PropsWithChildren, useCallback, useEffect, useMemo } from 'react';

export interface IHabitatFeatureRow {
  survey_habitat_feature_id: number;
  survey_id: number;
  habitat_feature_type_id: number;
  habitat_feature_taxons: string[];
  count: number;
  latitude: number | null;
  longitude: number | null;
  observed_date: string;
  observed_time: string;
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
   * Toggle a columns visibility
   */
  toggleColumnVisibility: (column: string) => void;
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
  const { projectId, surveyId } = useSurveyContext();

  // Stores the column visibility state in local storage
  const [columnVisibilityModel, setColumnVisibilityModel] = usePersistentState<GridColumnVisibilityModel>(
    SIMS_HABITAT_FEATURES_HIDDEN_COLUMNS,
    {}
  );

  const habitatFeatureDataLoader = useDataLoader(() =>
    biohubApi.habitatFeature.getSurveyHabitatFeaturesWithSupplementaryData(projectId, surveyId)
  );

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  useEffect(() => {
    habitatFeatureDataLoader.load();
  }, [habitatFeatureDataLoader]);

  // Columns hidden from table view
  const hiddenColumns = useMemo(() => {
    const columns = Object.keys(columnVisibilityModel);
    return columns.filter((column) => !columnVisibilityModel[column]);
  }, [columnVisibilityModel]);

  /**
   * Toggle the table columns visibility
   *
   * @param {{columns: string[]}} [config] - Array of columns to hide
   * @returns {void}
   */
  const toggleColumnsVisibility = useCallback(
    (column: string) => {
      const updatedVisibilityModel = { ...columnVisibilityModel };

      updatedVisibilityModel[column] = !updatedVisibilityModel[column];

      setColumnVisibilityModel(updatedVisibilityModel);
    },
    [columnVisibilityModel, setColumnVisibilityModel]
  );

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
      habitat_feature_taxons: habitatFeature.survey_habitat_feature_taxons.map((taxon) => taxon.itis_scientific_name),
      count: habitatFeature.count,
      latitude: habitatFeature.latitude,
      longitude: habitatFeature.longitude,
      observed_date: habitatFeature.observed_date,
      observed_time: habitatFeature.observed_time
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
          align: 'right' // Quantitative columns are numeric
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
        headerName: 'Habitat Feature',
        align: 'left',
        minWidth: 200,
        valueGetter: (params) => habitatFeatureTypeMap.get(params.value),
        flex: 1
      },
      {
        field: 'habitat_feature_taxons',
        headerName: 'Species',
        align: 'left',
        valueGetter: (params) => params.row.habitat_feature_taxons.join(', '),
        flex: 1
      },
      {
        field: 'survey_sample_site_id',
        headerName: 'Sample Site',
        align: 'left',
        flex: 1
      },
      {
        field: 'count',
        headerName: 'Count',
        headerAlign: 'right',
        align: 'right',
        minWidth: 100,
        flex: 1
      },
      {
        field: 'latitude',
        headerName: 'Lat',
        headerAlign: 'right',
        align: 'right',
        minWidth: 150,
        flex: 1
      },
      {
        field: 'longitude',
        headerName: 'Long',
        headerAlign: 'right',
        align: 'right',
        minWidth: 150,
        flex: 1
      },
      {
        field: 'observed_date',
        headerName: 'Date',
        minWidth: 120,
        flex: 1
      },
      {
        field: 'observed_time',
        headerName: 'Time',
        headerAlign: 'right',
        align: 'right',
        minWidth: 120,
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
      columnVisibilityModel: columnVisibilityModel,
      onColumnVisibilityModelChange: setColumnVisibilityModel,
      hiddenColumns: hiddenColumns,
      toggleColumnVisibility: toggleColumnsVisibility
    };
  }, [
    _muiDataGridApiRef,
    habitatFeatureTableColumns,
    habitatFeatureTableRows,
    habitatFeatureDataLoader.data?.pagination.total,
    habitatFeatureDataLoader.isLoading,
    columnVisibilityModel,
    setColumnVisibilityModel,
    hiddenColumns,
    toggleColumnsVisibility
  ]);

  return (
    <HabitatFeatureTableContext.Provider value={habitatFeatureTableContxt}>
      {props.children}
    </HabitatFeatureTableContext.Provider>
  );
};
