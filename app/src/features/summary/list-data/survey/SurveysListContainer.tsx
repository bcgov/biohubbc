import { mdiArrowTopRight, mdiTrashCanOutline } from '@mdi/js';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import CustomToggleButtonGroup from 'components/toggle/CustomToggleButtonGroup';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { LinearProgressWithLabel } from 'features/surveys/details/checklist/progress/SurveyChecklistProgressBar';
import { SURVEY_ACTIVE_VIEW_KEY, SURVEY_ACTIVE_VIEW_VALUE } from 'features/surveys/details/SurveyPage';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import { SurveyBasicFieldsObject } from 'interfaces/useSurveyApi.interface';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import { CreateSurveyFilterButton } from './filter/CreateSurveyFilterButton';
import SurveysListFilterForm, {
  ISurveyAdvancedFilters,
  SurveyAdvancedFiltersInitialValues
} from './SurveysListFilterForm';

type ViewType = 'FIXED' | 'CUSTOM';

interface FilterView {
  value: string;
  label: string;
  description?: string | null;
  type: ViewType;
  conditions?: ISurveyAdvancedFilters;
  menu?: { label: string; icon: string; onClick: () => void }[];
}

type SurveyDataTableURLParams = {
  s_keyword?: string;
  s_itis_tsn?: number;
  s_system_user_id?: string;
  s_page?: string;
  s_limit?: string;
  s_sort?: string;
  s_order?: 'asc' | 'desc';
};

const pageSizeOptions = [10, 25, 50];

const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 10,
  sort: 'survey_id',
  order: 'desc'
};

const SurveysListContainer = ({ showSearch }: { showSearch: boolean }) => {
  const biohubApi = useBiohubApi();
  const { searchParams, setSearchParams } = useSearchParams<StringValues<SurveyDataTableURLParams>>();

  const dialogContext = useDialogContext();

  const surveysDataLoader = useDataLoader((pagination?: ApiPaginationRequestOptions, filter?: ISurveyAdvancedFilters) =>
    biohubApi.survey.findSurveys(pagination, filter)
  );

  const filtersDataLoader = useDataLoader(() => biohubApi.filter.getSurveyFilters());

  const [activeView, setActiveView] = useState<string>('All');

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Number(searchParams.get('s_limit') ?? initialPaginationParams.limit),
    page: Number(searchParams.get('s_page') ?? initialPaginationParams.page)
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: searchParams.get('s_sort') ?? initialPaginationParams.sort,
      sort: (searchParams.get('s_order') ?? initialPaginationParams.order) as GridSortDirection
    }
  ]);

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<ISurveyAdvancedFilters>({
    keyword: searchParams.get('s_keyword') ?? undefined,
    itis_tsn: searchParams.get('s_itis_tsn') ? Number(searchParams.get('s_itis_tsn')) : undefined,
    system_user_id: searchParams.get('s_system_user_id') ? Number(searchParams.get('s_system_user_id')) : undefined
  });

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    page: paginationModel.page + 1
  };

  const hasActiveFiltersOrSort = useMemo(
    () =>
      !!(
        advancedFiltersModel.keyword ||
        advancedFiltersModel.itis_tsn ||
        advancedFiltersModel.system_user_id ||
        (sortModel.length > 0 &&
          (sortModel[0].field !== initialPaginationParams.sort || sortModel[0].sort !== initialPaginationParams.order))
      ),
    [advancedFiltersModel, sortModel]
  );

  useEffect(() => {
    filtersDataLoader.load();
  }, [filtersDataLoader]);

  useDeepCompareEffect(() => {
    surveysDataLoader.clearData();
    surveysDataLoader.refresh(paginationSort, advancedFiltersModel);
  }, [paginationSort, advancedFiltersModel]);

  const rows = surveysDataLoader.data?.surveys ?? [];

  const columns: GridColDef<SurveyBasicFieldsObject>[] = [
    {
      field: 'survey_id',
      headerName: 'ID',
      width: 85,
      renderHeader: () => (
        <Typography color={grey[500]} variant="body2">
          ID
        </Typography>
      ),
      renderCell: (params) => (
        <Typography color={grey[500]} variant="body2">
          {params.row.survey_id}
        </Typography>
      )
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Stack mb={0.25}>
          <Link
            underline="always"
            title={params.row.name}
            component={RouterLink}
            to={`/admin/surveys/${params.row.survey_id}/details?${SURVEY_ACTIVE_VIEW_KEY}=${SURVEY_ACTIVE_VIEW_VALUE.overview}`}
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}>
            {params.row.name}
          </Link>
        </Stack>
      )
    },
    {
      field: 'progress_percentage',
      headerName: 'Progress',
      flex: 0.6,
      renderCell: (params) => (
        <Box flex="1 1 auto" mr={5}>
          <LinearProgressWithLabel value={params.row.progress_percentage} />
        </Box>
      )
    },
    {
      field: 'start_date',
      headerName: 'Start Date',
      flex: 0.3,
      renderCell: (params) => (
        <Typography variant="body2">{dayjs(params.row.start_date).format(DATE_FORMAT.MediumDateFormat)}</Typography>
      )
    },
    {
      field: 'end_date',
      headerName: 'End Date',
      flex: 0.3,
      renderCell: (params) =>
        params.row.end_date && (
          <Typography variant="body2">{dayjs(params.row.end_date).format(DATE_FORMAT.MediumDateFormat)}</Typography>
        )
    }
  ];

  const handleDeleteFilter = useCallback(
    async (surveyFilterId: number) => {
      try {
        await biohubApi.filter.deleteSurveyFilter(surveyFilterId);
        filtersDataLoader.refresh();
        dialogContext.setSnackbar({ snackbarMessage: 'Successfully deleted filter' });
      } catch (error) {
        dialogContext.setSnackbar({
          snackbarMessage: `Failed to delete filter: ${(error as APIError).message}`
        });
      }
    },
    [biohubApi.filter, filtersDataLoader, dialogContext]
  );

  const fixedViews: FilterView[] = useMemo(
    () => [
      { value: 'All', label: 'All', type: 'FIXED' },
      { value: 'In progress', label: 'In progress', type: 'FIXED', conditions: { keyword: 'progress' } },
      { value: 'Completed', label: 'PUBLISHED', type: 'FIXED', conditions: { keyword: 'published' } }
    ],
    []
  );

  const customViews: FilterView[] = useMemo(
    () =>
      filtersDataLoader.data?.filters.map((filter) => ({
        value: String(filter.survey_filter_id),
        label: filter.name,
        description: filter.description,
        type: 'CUSTOM',
        conditions: filter.conditions,
        menu: [
          {
            label: 'Delete',
            icon: mdiTrashCanOutline,
            onClick: () => {
              handleDeleteFilter(filter.survey_filter_id);
            }
          }
        ]
      })) ?? [],
    [filtersDataLoader.data?.filters, handleDeleteFilter]
  );

  const mergedViews: FilterView[] = useMemo(() => [...fixedViews, ...customViews], [fixedViews, customViews]);

  const handleViewChange = (viewValue: string) => {
    // surveysDataLoader.clearData();

    setActiveView(viewValue);
    const selected = mergedViews.find((v) => v.value === viewValue);
    const filters = selected?.conditions ?? SurveyAdvancedFiltersInitialValues;

    setSearchParams(
      searchParams
        .setOrDelete('s_keyword', filters.keyword)
        .setOrDelete('s_itis_tsn', filters.itis_tsn)
        .setOrDelete('s_system_user_id', filters.system_user_id)
    );

    setAdvancedFiltersModel(filters);
  };

  return (
    <>
      <Collapse in={showSearch}>
        <Box py={2} px={2}>
          <SurveysListFilterForm
            initialValues={advancedFiltersModel}
            handleSubmit={(values) => {
              setSearchParams(
                searchParams
                  .setOrDelete('s_keyword', values.keyword)
                  .setOrDelete('s_itis_tsn', values.itis_tsn)
                  .setOrDelete('s_system_user_id', values.system_user_id)
              );
              setAdvancedFiltersModel(values);
            }}
          />
        </Box>
        <Divider />
      </Collapse>

      <Stack
        flexDirection="row"
        alignItems="center"
        p={2}
        gap={0.5}
        sx={{
          borderBottom: `1px solid ${grey[300]}`,
          overflowX: 'auto',
          maxWidth: '100%',
          whiteSpace: 'nowrap'
        }}>
        <Box sx={{ flexShrink: 0 }}>
          <CustomToggleButtonGroup
            orientation="horizontal"
            views={mergedViews}
            activeView={activeView}
            onViewChange={handleViewChange}
          />
        </Box>
        <Box sx={{ flexShrink: 0 }}>
          <CreateSurveyFilterButton onSubmit={() => filtersDataLoader.refresh()} />
        </Box>
      </Stack>

      <LoadingGuard
        isLoading={!rows.length && (surveysDataLoader.isLoading || !surveysDataLoader.isReady)}
        isLoadingFallback={<SkeletonTable />}
        hasNoData={!rows.length}
        hasNoDataFallback={
          hasActiveFiltersOrSort ? (
            <NoDataOverlay
              minHeight="400px"
              height="400px"
              title="Create Surveys"
              subtitle="You have no surveys. Once you create or get invited to one, it will show up here."
              icon={mdiArrowTopRight}
            />
          ) : (
            <NoDataOverlay
              minHeight="400px"
              height="400px"
              title="No Surveys Found"
              subtitle="There are no surveys that match your search criteria."
            />
          )
        }>
        <StyledDataGrid
          noRowsMessage="No surveys found"
          loading={!rows.length && surveysDataLoader.isLoading}
          columns={columns}
          rows={rows}
          rowCount={surveysDataLoader.data?.pagination.total ?? 0}
          getRowId={(row) => row.survey_id}
          paginationMode="server"
          paginationModel={paginationModel}
          pageSizeOptions={pageSizeOptions}
          onPaginationModelChange={(model) => {
            setSearchParams(searchParams.set('s_page', String(model.page)).set('s_limit', String(model.pageSize)));
            setPaginationModel(model);
          }}
          sortingMode="server"
          sortModel={sortModel}
          sortingOrder={['asc', 'desc']}
          onSortModelChange={(model) => {
            if (model.length) {
              setSearchParams(searchParams.set('s_sort', model[0].field).set('s_order', model[0].sort ?? 'desc'));
              setSortModel(model);
            }
          }}
          rowSelection={false}
          checkboxSelection={false}
          disableRowSelectionOnClick
          disableColumnSelector
          disableColumnFilter
          disableColumnMenu
          rowHeight={50}
          autoHeight={false}
        />
      </LoadingGuard>
    </>
  );
};

export default SurveysListContainer;
