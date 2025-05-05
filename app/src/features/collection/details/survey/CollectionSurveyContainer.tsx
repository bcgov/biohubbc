import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import { CreateButton } from 'components/buttons/CreateButton';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import SurveysListFilterForm, {
  ISurveyAdvancedFilters,
  SurveyAdvancedFiltersInitialValues
} from 'features/summary/list-data/survey/SurveysListFilterForm';
import { SurveyProgressChip } from 'features/surveys/components/SurveyProgressChip';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import { ICollection } from 'interfaces/useCollectionApi.interface';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { SurveyBasicFieldsObject } from 'interfaces/useSurveyApi.interface';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull, getFormattedDate } from 'utils/Utils';
import SurveyCollectionDialog from './dialog/SurveyCollectionDialog';

const pageSizeOptions = [10, 25, 50];

// Supported URL parameters
// Note: Prefix 's_' is used to avoid conflicts with similar query params from other components
type SurveyDataTableURLParams = {
  // filter
  s_keyword?: string;
  s_itis_tsn?: number;
  s_system_user_id?: string;
  // pagination
  s_page?: string;
  s_limit?: string;
  s_sort?: string;
  s_order?: 'asc' | 'desc';
};

interface ICollectionSurveyContainerProps {
  collection: ICollection;
  showSearch: boolean;
}

// Default pagination parameters
const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 10,
  sort: 'survey_id',
  order: 'desc'
};

/**
 * List of Surveys belonging to a Project.
 *
 * @return {*}
 */
const CollectionSurveyContainer = (props: ICollectionSurveyContainerProps) => {
  const { collection, showSearch } = props;

  const biohubApi = useBiohubApi();

  const { searchParams, setSearchParams } = useSearchParams<StringValues<SurveyDataTableURLParams>>();
  const [collectionDialogIsOpen, setCollectionDialogIsOpen] = useState(false);

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
    keyword: searchParams.get('s_keyword') ?? SurveyAdvancedFiltersInitialValues.keyword,
    itis_tsn: searchParams.get('s_itis_tsn')
      ? Number(searchParams.get('s_itis_tsn'))
      : SurveyAdvancedFiltersInitialValues.itis_tsn,
    system_user_id: searchParams.get('s_system_user_id')
      ? Number(searchParams.get('s_system_user_id'))
      : SurveyAdvancedFiltersInitialValues.system_user_id
  });

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    page: paginationModel.page + 1 // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
  };

  const surveysDataLoader = useDataLoader((pagination?: ApiPaginationRequestOptions, filter?: ISurveyAdvancedFilters) =>
    biohubApi.collection.getSurveysInCollection(collection.collection_id, pagination, filter)
  );

  // Fetch surveyss when either the pagination, sort, or advanced filters change
  useDeepCompareEffect(() => {
    surveysDataLoader.refresh(paginationSort, advancedFiltersModel);
  }, [advancedFiltersModel, paginationSort]);

  const columns: GridColDef<SurveyBasicFieldsObject>[] = [
    {
      field: 'survey_id',
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
        <Link
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}
          data-testid={params.row.name}
          underline="always"
          title={params.row.name}
          component={RouterLink}
          to={`/admin/surveys/${params.row.survey_id}/details`}
          children={params.row.name}
        />
      )
    },
    {
      field: 'progress',
      headerName: 'Progress',
      flex: 0.25,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box>
          <SurveyProgressChip progress_id={params.row.progress_id} />
        </Box>
      )
    },
    {
      field: 'start_date',
      headerName: 'Start Date',
      flex: 0.3,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Typography variant="body2">{getFormattedDate(DATE_FORMAT.MediumDateFormat, params.row.start_date)}</Typography>
      )
    },
    {
      field: 'end_date',
      headerName: 'End Date',
      flex: 0.3,
      disableColumnMenu: true,
      renderCell: (params) =>
        params.row.end_date ? (
          <Typography variant="body2">{getFormattedDate(DATE_FORMAT.MediumDateFormat, params.row.end_date)}</Typography>
        ) : (
          <Typography variant="body2" color="textSecondary">
            None
          </Typography>
        )
    }
  ];

  const surveys = surveysDataLoader.data?.surveys ?? [];

  return (
    <>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h2">
          Surveys &zwnj;
          <Typography component="span" color="textSecondary" lineHeight="inherit" fontSize="inherit" fontWeight={400}>
            ({Number(surveysDataLoader.data?.pagination?.total ?? 0).toLocaleString()})
          </Typography>
        </Typography>
        <Stack gap={1} direction="row">
          <CreateButton
            label="Add Surveys"
            onClick={() => {
              setCollectionDialogIsOpen(true);
            }}
          />
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.SURVEYS} />
        </Stack>
      </Toolbar>

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

      <Divider />

      <LoadingGuard
        isLoading={surveysDataLoader.isLoading || !surveysDataLoader.isReady}
        isLoadingFallback={<SkeletonTable data-testid="survey-list-skeleton" />}
        isLoadingFallbackDelay={100}
        hasNoData={!surveys.length}
        hasNoDataFallback={
          <NoDataOverlay
            height="200px"
            title="Add Surveys to Collection"
            subtitle="Surveys added to this collection will appear here"
            icon={mdiArrowTopRight}
            data-testid="survey-list-no-data-overlay"
          />
        }
        hasNoDataFallbackDelay={100}>
        <StyledDataGrid
          noRowsMessage="No surveys found"
          loading={!surveys.length && (surveysDataLoader.isLoading || !surveysDataLoader.isReady)}
          // Columns
          columns={columns}
          // Rows
          rows={surveys}
          rowCount={surveysDataLoader.data?.pagination.total ?? 0}
          getRowId={(row) => row.survey_id}
          // Pagination
          paginationMode="server"
          paginationModel={paginationModel}
          pageSizeOptions={pageSizeOptions}
          onPaginationModelChange={(model) => {
            if (!model) {
              return;
            }
            setSearchParams(searchParams.set('s_page', String(model.page)).set('s_limit', String(model.pageSize)));
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
            setSearchParams(searchParams.set('s_sort', model[0].field).set('s_order', model[0].sort ?? 'desc'));
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

      <SurveyCollectionDialog
        collection={collection}
        onSubmit={() => {
          surveysDataLoader.refresh(paginationSort, advancedFiltersModel);
          setCollectionDialogIsOpen(false);
        }}
        onClose={() => {
          setCollectionDialogIsOpen(false);
        }}
        open={collectionDialogIsOpen}
      />
    </>
  );
};

export default CollectionSurveyContainer;
