import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import blue from '@mui/material/colors/blue';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import { CreateButton } from 'components/buttons/CreateButton';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { COLLECTION_ROLE } from 'constants/roles';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import { ICollectionMember, ICollectionMembersAdvancedFilters } from 'interfaces/useCollectionApi.interface';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useState } from 'react';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull, getCodesName } from 'utils/Utils';
import CollectionMemberDialog from './dialog/CollectionMemberDialog';
import CollectionMembersFilterForm, {
  CollectionMembersAdvancedFiltersInitialValues
} from './filter/CollectionMembersFilterForm';

const pageSizeOptions = [10, 25, 50];

// Supported URL parameters
// Note: Prefix 'c_' is used to avoid conflicts with similar query params from other components
type SurveyDataTableURLParams = {
  // filter
  c_keyword?: string;
  c_itic_tsn?: number;
  c_system_user_id?: string;
  // pagination
  c_page?: string;
  c_limit?: string;
  c_sort?: string;
  c_order?: 'asc' | 'desc';
};

interface ICollectionMembersContainerProps {
  collectionId: number;
}

// Default pagination parameters
const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 10,
  sort: 'collection_id',
  order: 'desc'
};

/**
 * List of Surveys belonging to a Project.
 *
 * @return {*}
 */
const CollectionMembersContainer = (props: ICollectionMembersContainerProps) => {
  const { collectionId } = props;

  const biohubApi = useBiohubApi();
  const codesContext = useCodesContext();

  const { searchParams, setSearchParams } = useSearchParams<StringValues<SurveyDataTableURLParams>>();
  const [participantDialogIsOpen, setParticipantDialogIsOpen] = useState(false);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Number(searchParams.get('c_limit') ?? initialPaginationParams.limit),
    page: Number(searchParams.get('c_page') ?? initialPaginationParams.page)
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: searchParams.get('c_sort') ?? initialPaginationParams.sort,
      sort: (searchParams.get('c_order') ?? initialPaginationParams.order) as GridSortDirection
    }
  ]);

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<ICollectionMembersAdvancedFilters>({
    keyword: searchParams.get('c_keyword') ?? CollectionMembersAdvancedFiltersInitialValues.keyword,
    system_user_id: searchParams.get('c_system_user_id')
      ? Number(searchParams.get('c_system_user_id'))
      : CollectionMembersAdvancedFiltersInitialValues.system_user_id
  });

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    page: paginationModel.page + 1 // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
  };

  const collectionMembersDataLoader = useDataLoader(
    (pagination?: ApiPaginationRequestOptions, filter?: ICollectionMembersAdvancedFilters) =>
      biohubApi.collection.getParticipants(collectionId, pagination, filter)
  );

  // Fetch collectionMemberss when either the pagination, sort, or advanced filters change
  useDeepCompareEffect(() => {
    collectionMembersDataLoader.refresh(paginationSort, advancedFiltersModel);
  }, [advancedFiltersModel, paginationSort]);

  const columns: GridColDef<ICollectionMember>[] = [
    {
      field: 'collection_member_id',
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
          {params.row.collection_member_id}
        </Typography>
      )
    },
    {
      field: 'display_name',
      headerName: 'Name',
      flex: 1,
      disableColumnMenu: true
    },
    {
      field: 'collection_role_id',
      headerName: 'Role',
      flex: 1,
      renderCell: (params) => {
        const role = getCodesName(
          codesContext.codesDataLoader.data,
          'collection_roles',
          params.row.collection_role_id
        ) as COLLECTION_ROLE;
        return <ColouredRectangleChip label={role} colour={role === COLLECTION_ROLE.ADMIN ? blue : grey} />;
      }
    }
  ];

  const collectionMembers = collectionMembersDataLoader.data?.members ?? [];

  return (
    <>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h2">
          Members &zwnj;
          <Typography component="span" color="textSecondary" lineHeight="inherit" fontSize="inherit" fontWeight={400}>
            ({Number(collectionMembersDataLoader.data?.pagination?.total ?? 0).toLocaleString()})
          </Typography>
        </Typography>
        <Stack gap={1} direction="row">
          <CreateButton
            label="Invite Members"
            onClick={() => {
              setParticipantDialogIsOpen(true);
            }}
          />
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.SURVEYS} />
        </Stack>
      </Toolbar>

      <Divider />

      <Box py={2} px={2}>
        <CollectionMembersFilterForm
          initialValues={advancedFiltersModel}
          handleSubmit={(values) => {
            setSearchParams(
              searchParams
                .setOrDelete('c_keyword', values.keyword)
                .setOrDelete('c_system_user_id', values.system_user_id)
            );
            setAdvancedFiltersModel(values);
          }}
        />
      </Box>

      <Divider />

      <LoadingGuard
        isLoading={collectionMembersDataLoader.isLoading || !collectionMembersDataLoader.isReady}
        isLoadingFallback={<SkeletonTable data-testid="collection-participant-list-skeleton" />}
        isLoadingFallbackDelay={100}
        hasNoData={!collectionMembers.length}
        hasNoDataFallback={
          <NoDataOverlay
            title="Invite Members"
            subtitle="Surveys added to this collection will appear here"
            icon={mdiArrowTopRight}
            data-testid="collection-participant-list-no-data-overlay"
          />
        }
        hasNoDataFallbackDelay={100}>
        <StyledDataGrid
          noRowsMessage="No participants found"
          loading={
            !collectionMembers.length && (collectionMembersDataLoader.isLoading || !collectionMembersDataLoader.isReady)
          }
          // Columns
          columns={columns}
          // Rows
          rows={collectionMembers}
          rowCount={collectionMembersDataLoader.data?.pagination.total ?? 0}
          getRowId={(row) => row.collection_member_id}
          // Pagination
          paginationMode="server"
          paginationModel={paginationModel}
          pageSizeOptions={pageSizeOptions}
          onPaginationModelChange={(model) => {
            if (!model) {
              return;
            }
            setSearchParams(searchParams.set('c_page', String(model.page)).set('c_limit', String(model.pageSize)));
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
            setSearchParams(searchParams.set('c_sort', model[0].field).set('c_order', model[0].sort ?? 'desc'));
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
          rowHeight={52}
          getRowHeight={() => 'auto'}
          autoHeight={false}
        />
      </LoadingGuard>

      <CollectionMemberDialog
        collectionId={collectionId}
        onSubmit={() => {
          collectionMembersDataLoader.refresh(paginationSort, advancedFiltersModel);
          setParticipantDialogIsOpen(false);
        }}
        onClose={() => {
          setParticipantDialogIsOpen(false);
        }}
        open={participantDialogIsOpen}
      />
    </>
  );
};

export default CollectionMembersContainer;
