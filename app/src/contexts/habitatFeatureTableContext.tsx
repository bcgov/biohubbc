import { GridColDef } from '@mui/x-data-grid';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { createContext, PropsWithChildren, useEffect, useMemo } from 'react';

export interface IHabitatFeatureRow {
  survey_habitat_feature_id: number;
  survey_id: number;
  habitat_feature_type_id: number;
  count: number;
  latitude: number | null;
  longitude: number | null;
  observed_date: string;
  observed_time: string;
  // TODO: Mac: Add the qualitative / quantitative arrays
}

export interface IHabitatFeatureTableContext {
  columns: GridColDef<IHabitatFeatureRow>[];
  rows: IHabitatFeatureRow[];
  rowCount: number;
  isLoading: boolean;
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
  const biohubApi = useBiohubApi();
  const codesContext = useCodesContext();
  const { projectId, surveyId } = useSurveyContext();

  const habitatFeatureDataLoader = useDataLoader(() =>
    biohubApi.habitatFeatureApi.getSurveyHabitatFeaturesWithSupplementaryData(projectId, surveyId)
  );

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  useEffect(() => {
    habitatFeatureDataLoader.load();
  }, [habitatFeatureDataLoader]);

  // Create a map of habitat feature type IDs to their names
  const habitatFeatureTypeMap: Map<number, string> = useMemo(() => {
    const habitatFeatureTypeMap = new Map();

    // Populate the map with the habitat feature types
    for (const featureType of codesContext.codesDataLoader.data?.habitat_feature_types ?? []) {
      habitatFeatureTypeMap.set(featureType.id, featureType.name);
    }

    return habitatFeatureTypeMap;
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
      count: habitatFeature.count,
      latitude: habitatFeature.latitude,
      longitude: habitatFeature.longitude,
      observed_date: habitatFeature.observed_date,
      observed_time: habitatFeature.observed_time
    }));
  }, [habitatFeatureDataLoader.data]);

  // Create the columns for the table
  const habitatFeatureTableColumns: GridColDef<IHabitatFeatureRow>[] = useMemo(() => {
    const quantitativeColumns: GridColDef<IHabitatFeatureRow>[] =
      habitatFeatureDataLoader.data?.supplementaryData.habitatFeatureQuantitativeDefinitions.map(
        (quantitativeDefintion) => ({
          field: `habitat_feature_quantitative_definition_id`,
          headerName: quantitativeDefintion.name,
          align: 'right'
        })
      ) ?? [];

    const qualitativeColumns: GridColDef<IHabitatFeatureRow>[] =
      habitatFeatureDataLoader.data?.supplementaryData.habitatFeatureQualitativeDefinitions.map(
        (qualitativeDefinition) => ({
          field: `habitat_feature_qualitative_definition_id`,
          headerName: qualitativeDefinition.name,
          align: 'left'
        })
      ) ?? [];

    const standardColumns: GridColDef<IHabitatFeatureRow>[] = [
      {
        field: 'habitat_feature_type_id',
        headerName: 'Habitat Feature',
        align: 'left',
        maxWidth: 200,
        valueGetter: (params) => habitatFeatureTypeMap.get(params.value),
        flex: 1
      },
      {
        field: 'count',
        headerName: 'Count',
        headerAlign: 'right',
        align: 'right',
        maxWidth: 100
      },
      {
        field: 'latitude',
        headerName: 'Lat',
        headerAlign: 'right',
        align: 'right',
        maxWidth: 150
      },
      {
        field: 'longitude',
        headerName: 'Long',
        headerAlign: 'right',
        align: 'right',
        maxWidth: 150
      },
      {
        field: 'observed_date',
        headerName: 'Date',
        maxWidth: 120
      },
      {
        field: 'observed_time',
        headerName: 'Time',
        headerAlign: 'right',
        align: 'right',
        maxWidth: 100
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
      columns: habitatFeatureTableColumns,
      rows: habitatFeatureTableRows,
      rowCount: habitatFeatureDataLoader.data?.pagination.total ?? 0,
      isLoading: habitatFeatureDataLoader.isLoading
    };
  }, [
    habitatFeatureTableColumns,
    habitatFeatureTableRows,
    habitatFeatureDataLoader.data?.pagination.total,
    habitatFeatureDataLoader.isLoading
  ]);

  return (
    <HabitatFeatureTableContext.Provider value={habitatFeatureTableContxt}>
      {props.children}
    </HabitatFeatureTableContext.Provider>
  );
};
