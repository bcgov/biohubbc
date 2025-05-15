import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IHabitatFeatureRow } from 'contexts/habitatFeatureTableContext';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import {
  FindSurveyHabitatFeatures,
  FindSurveyHabitatFeaturesFilters
} from 'interfaces/useSurveyHabitatFeatureApi.interface';
import { useCallback, useEffect, useState } from 'react';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import {
  HabitatFeaturesListFilterForm,
  SurveyHabitatFeaturesAdvancedFilters,
  SurveyHabitatFeaturesAdvancedFiltersInitialValues
} from './HabitatFeaturesListFilterForm';

// Supported URL parameters
// Note: Prefix 'h_' is used to avoid conflicts with similar query params from other components
type HabitatFeatureDataTableURLParams = {
  // filter
  h_keyword?: string;
  h_habitat_feature_type_id?: number;
  h_itis_tsn?: number;
  h_start_date?: string;
  h_end_date?: string;
  h_start_time?: string;
  h_end_time?: string;
  h_min_count?: string;
  h_system_user_id?: number;
  // pagination
  h_page?: string;
  h_limit?: string;
  h_sort?: string;
  h_order?: 'asc' | 'desc';
};

const pageSizeOptions = [10, 25, 50];

interface IHabitatFeaturesListContainerProps {
  showSearch: boolean;
}

// Default pagination parameters
const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 10,
  sort: 'survey_habitat_feature_id',
  order: 'desc'
};

/**
 * Displays a list of habitat features.
 *
 * @return {*}
 */
const HabitatFeaturesListContainer = (props: IHabitatFeaturesListContainerProps) => {
  const { showSearch } = props;

  const codesContext = useCodesContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const biohubApi = useBiohubApi();

  const { searchParams, setSearchParams } = useSearchParams<StringValues<HabitatFeatureDataTableURLParams>>();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Number(searchParams.get('h_limit') ?? initialPaginationParams.limit),
    page: Number(searchParams.get('h_page') ?? initialPaginationParams.page)
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: searchParams.get('h_sort') ?? initialPaginationParams.sort,
      sort: (searchParams.get('h_order') ?? initialPaginationParams.order) as GridSortDirection
    }
  ]);

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<SurveyHabitatFeaturesAdvancedFilters>({
    keyword: searchParams.get('h_keyword') ?? SurveyHabitatFeaturesAdvancedFiltersInitialValues.keyword,
    habitat_feature_type_id: searchParams.get('h_habitat_feature_type_id')
      ? Number(searchParams.get('h_habitat_feature_type_id'))
      : SurveyHabitatFeaturesAdvancedFiltersInitialValues.habitat_feature_type_id,
    itis_tsn: searchParams.get('h_itis_tsn')
      ? Number(searchParams.get('h_itis_tsn'))
      : SurveyHabitatFeaturesAdvancedFiltersInitialValues.itis_tsn,
    start_date: searchParams.get('h_start_date') ?? SurveyHabitatFeaturesAdvancedFiltersInitialValues.start_date,
    end_date: searchParams.get('h_end_date') ?? SurveyHabitatFeaturesAdvancedFiltersInitialValues.end_date,
    start_time: searchParams.get('h_start_time') ?? SurveyHabitatFeaturesAdvancedFiltersInitialValues.start_time,
    end_time: searchParams.get('h_end_time') ?? SurveyHabitatFeaturesAdvancedFiltersInitialValues.end_time,
    min_count: searchParams.get('h_min_count') ?? SurveyHabitatFeaturesAdvancedFiltersInitialValues.min_count,
    system_user_id: searchParams.get('h_system_user_id')
      ? Number(searchParams.get('h_system_user_id'))
      : SurveyHabitatFeaturesAdvancedFiltersInitialValues.system_user_id
  });

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    page: paginationModel.page + 1 // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
  };

  const habitatFeaturesDataLoader = useDataLoader(
    (pagination: ApiPaginationRequestOptions, filter?: SurveyHabitatFeaturesAdvancedFilters) => {
      const findFilters: FindSurveyHabitatFeaturesFilters = {
        keyword: filter?.keyword,
        habitat_feature_type_ids: filter?.habitat_feature_type_id ? [filter.habitat_feature_type_id] : undefined,
        itis_tsns: filter?.itis_tsn ? [filter.itis_tsn] : undefined,
        start_date: filter?.start_date,
        end_date: filter?.end_date,
        start_time: filter?.start_time,
        end_time: filter?.end_time,
        min_count: filter?.min_count,
        system_user_id: filter?.system_user_id
      };

      return biohubApi.habitatFeature.findSurveyHabitatFeatures(pagination, findFilters);
    }
  );

  useDeepCompareEffect(() => {
    habitatFeaturesDataLoader.refresh(paginationSort, advancedFiltersModel);
  }, [advancedFiltersModel, paginationSort]);

  const getRowsFromHabitatFeatures = useCallback(
    (habitatFeaturesData: FindSurveyHabitatFeatures): IHabitatFeatureRow[] =>
      habitatFeaturesData.surveyHabitatFeatures?.flatMap((habitatFeatureRow) => {
        return {
          id: String(habitatFeatureRow.survey_habitat_feature_id),
          ...habitatFeatureRow,
          survey_habitat_feature_taxons: habitatFeatureRow.survey_habitat_feature_taxons.map(
            (taxon) => taxon.itis_scientific_name
          )
        };
      }),
    []
  );

  const rows = habitatFeaturesDataLoader.data ? getRowsFromHabitatFeatures(habitatFeaturesDataLoader.data) : [];

  const columns: GridColDef<IHabitatFeatureRow>[] = [
    {
      field: 'survey_habitat_feature_id',
      headerName: 'ID',
      width: 85,
      minWidth: 85,
      renderHeader: () => (
        <Typography color={grey[500]} variant="body2" fontWeight={700}>
          ID
        </Typography>
      ),
      renderCell: (params) => (
        <Typography color={grey[500]} variant="body2">
          {params.row.survey_habitat_feature_id}
        </Typography>
      )
    },
    {
      field: 'habitat_feature_type_id',
      headerName: 'Type',
      flex: 1,
      renderCell: (params) => {
        const habitatFeatureTypeCode = codesContext.codesDataLoader.data?.habitat_feature_types.find(
          (item) => item.id === params.row.habitat_feature_type_id
        );

        return <Typography variant="body2">{habitatFeatureTypeCode?.name ?? ''}</Typography>;
      }
    },
    {
      field: 'count',
      headerName: 'Count',
      flex: 1
    },
    {
      field: 'observed_date',
      headerName: 'Date',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">{dayjs(params.row.observed_date).format(DATE_FORMAT.MediumDateFormat)}</Typography>
      )
    },
    {
      field: 'observed_time',
      headerName: 'Time',
      flex: 1,
      renderCell: (params) => <Typography variant="body2">{params.row.observed_time}</Typography>
    },
    {
      field: 'latitude',
      headerName: 'Latitude',
      flex: 1
    },
    {
      field: 'longitude',
      headerName: 'Longitude',
      flex: 1
    }
  ];

  return (
    <>
      <Collapse in={showSearch}>
        <Box py={2} px={2}>
          <HabitatFeaturesListFilterForm
            initialValues={advancedFiltersModel}
            handleSubmit={(values) => {
              setSearchParams(
                searchParams
                  .setOrDelete('h_keyword', values.keyword)
                  .setOrDelete('h_habitat_feature_type_id', values.habitat_feature_type_id)
                  .setOrDelete('h_itis_tsn', values.itis_tsn)
                  .setOrDelete('h_min_count', values.min_count)
                  .setOrDelete('h_start_date', values.start_date)
                  .setOrDelete('h_end_date', values.end_date)
                  .setOrDelete('h_start_time', values.start_time)
                  .setOrDelete('h_end_time', values.end_time)
                  .setOrDelete('h_system_user_id', values.system_user_id)
              );
              setAdvancedFiltersModel(values);
            }}
          />
        </Box>
        <Divider />
      </Collapse>

      <Box height="100vh" maxHeight="800px">
        <LoadingGuard
          isLoading={!rows.length && (habitatFeaturesDataLoader.isLoading || !habitatFeaturesDataLoader.isReady)}
          isLoadingFallback={<SkeletonTable />}
          isLoadingFallbackDelay={100}
          hasNoData={!rows.length}
          hasNoDataFallback={
            <NoDataOverlay
              minHeight="400px"
              height="500px"
              title="Create or Join Surveys to See HabitatFeatures"
              subtitle="You currently have no habitat features data. Once you create or join surveys with habitat features data, it will be displayed here"
              icon={mdiArrowTopRight}
            />
          }
          hasNoDataFallbackDelay={100}>
          <StyledDataGrid
            noRowsMessage="No habitat features found"
            loading={!rows.length && (habitatFeaturesDataLoader.isLoading || !habitatFeaturesDataLoader.isReady)}
            // Columns
            columns={columns}
            // Rows
            rows={rows}
            rowCount={habitatFeaturesDataLoader.data?.pagination.total ?? 0}
            getRowId={(row) => row.id}
            // Pagination
            paginationMode="server"
            paginationModel={paginationModel}
            pageSizeOptions={pageSizeOptions}
            onPaginationModelChange={(model) => {
              if (!model) {
                return;
              }
              setSearchParams(searchParams.set('h_page', String(model.page)).set('h_limit', String(model.pageSize)));
              setPaginationModel(model);
            }}
            // Sorting
            sortingMode="server"
            sortModel={sortModel}
            sortingOrder={['asc', 'desc']}
            onSortModelChange={(model) => {
              if (!model.length) {
                return;
              }
              setSearchParams(searchParams.set('h_sort', model[0].field).set('h_order', model[0].sort ?? 'desc'));
              setSortModel(model);
            }}
            // Row options
            rowSelection={false}
            checkboxSelection={false}
            disableRowSelectionOnClick
            // Column options
            disableColumnSelector
            disableColumnFilter
            disableColumnMenu
            // Styling
            rowHeight={70}
            getRowHeight={() => 'auto'}
            autoHeight={false}
          />
        </LoadingGuard>
      </Box>
    </>
  );
};

export default HabitatFeaturesListContainer;
