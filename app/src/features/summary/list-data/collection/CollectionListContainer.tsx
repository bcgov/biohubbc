import { mdiArrowTopRight, mdiDotsVertical, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IconButton, ListItemIcon, ListItemText } from '@mui/material';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import { TeamMemberAvatar } from 'components/avatar/TeamMemberAvatar';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import { ICollection } from 'interfaces/useCollectionApi.interface';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull, getRandomHexColor } from 'utils/Utils';
import CollectionsListFilterForm, {
  CollectionAdvancedFiltersInitialValues,
  ICollectionAdvancedFilters
} from './CollectionListFilterForm';

// Supported URL parameters
// Note: Prefix 'p_' is used to avoid conflicts with similar query params from other components
type CollectionDataTableURLParams = {
  // filter
  p_keyword?: string;
  p_itis_tsn?: number;
  p_system_user_id?: string;
  p_parent_collection_id?: number | null;
  // pagination
  p_page?: string;
  p_limit?: string;
  p_sort?: string;
  p_order?: 'asc' | 'desc';
};

const pageSizeOptions = [10, 25, 50];

interface ICollectionsListContainerProps {
  showSearch: boolean;
}

// Default pagination parameters
const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 10,
  sort: 'collection_id',
  order: 'desc'
};

/**
 * Displays a list of collections.
 *
 * @return {*}
 */
const CollectionsListContainer = (props: ICollectionsListContainerProps) => {
  const { showSearch } = props;

  const biohubApi = useBiohubApi();

  const { searchParams, setSearchParams } = useSearchParams<StringValues<CollectionDataTableURLParams>>();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Number(searchParams.get('p_limit') ?? initialPaginationParams.limit),
    page: Number(searchParams.get('p_page') ?? initialPaginationParams.page)
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: searchParams.get('p_sort') ?? initialPaginationParams.sort,
      sort: (searchParams.get('p_order') ?? initialPaginationParams.order) as GridSortDirection
    }
  ]);

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<ICollectionAdvancedFilters>({
    keyword: searchParams.get('p_keyword') ?? CollectionAdvancedFiltersInitialValues.keyword,
    itis_tsn: searchParams.get('p_itis_tsn')
      ? Number(searchParams.get('p_itis_tsn'))
      : CollectionAdvancedFiltersInitialValues.itis_tsn,
    system_user_id: searchParams.get('p_system_user_id') ?? CollectionAdvancedFiltersInitialValues.system_user_id,
    parent_collection_id: searchParams.get('p_parent_collection_id')
      ? Number(searchParams.get('p_parent_collection_id'))
      : CollectionAdvancedFiltersInitialValues.parent_collection_id
  });

  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<{
    anchorEl: MenuProps['anchorEl'];
    collectionId: number;
  } | null>(null);

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = useMemo(
    () => ({
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,
      page: paginationModel.page + 1 // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
    }),
    [paginationModel.page, paginationModel.pageSize, sort?.field, sort?.sort]
  );

  const collectionsDataLoader = useDataLoader(
    (pagination: ApiPaginationRequestOptions, filter?: ICollectionAdvancedFilters) =>
      biohubApi.collection.findCollections(pagination, filter)
  );

  // Fetch collections when either the pagination, sort, or advanced filters change
  useDeepCompareEffect(() => {
    collectionsDataLoader.refresh(paginationSort, advancedFiltersModel);
  }, [advancedFiltersModel, paginationSort]);

  const rows = collectionsDataLoader.data?.collections ?? [];

  // Define the columns for the DataGrid
  const columns: GridColDef<ICollection>[] = [
    {
      field: 'collection_id',
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
          {params.row.collection_id}
        </Typography>
      )
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 0.3,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Stack mb={0.25}>
            <Link
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}
              data-testid={params.row.name}
              underline="always"
              title={params.row.name}
              component={RouterLink}
              to={`/admin/collections/${params.row.collection_id}`}
              children={params.row.name}
            />
          </Stack>
        );
      }
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 0.4,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title={params.row.description}>
          <Typography color="textSecondary" variant="body2">
            {params.row.description}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'participants',
      headerName: 'Members',
      flex: 0.4,
      disableColumnMenu: true,
      renderCell: (params) => {
        const members = params.row.participants;
        const visibleMembers = members.slice(0, 5);
        const remainingCount = members.length - visibleMembers.length;

        return (
          <Stack gap={0.5} flexDirection="row" alignItems="center">
            {visibleMembers.map((member) => (
              <TeamMemberAvatar
                key={member.system_user_id}
                tooltip={member.display_name}
                label={member.display_name
                  .split(',')
                  .map((name) => name.trim().slice(0, 1).toUpperCase())
                  .reverse()
                  .join('')}
                color={getRandomHexColor(member.system_user_id)}
              />
            ))}
            {remainingCount > 0 && (
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>
                +{remainingCount}
              </Box>
            )}
          </Stack>
        );
      }
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      width: 10,
      align: 'right',
      renderCell: (params) => (
        <IconButton
          onClick={(event) => {
            setActionMenuAnchorEl({ anchorEl: event.currentTarget, collectionId: params.row.collection_id });
          }}>
          <Icon path={mdiDotsVertical} size={1} />
        </IconButton>
      )
    }
  ];

  const handleCloseActionMenu = () => setActionMenuAnchorEl(null);

  const handleDelete = async () => {
    if (!actionMenuAnchorEl?.collectionId) {
      handleCloseActionMenu();
      return;
    }
    try {
      await biohubApi.collection.deleteCollection(actionMenuAnchorEl.collectionId);
      collectionsDataLoader.refresh(paginationSort, advancedFiltersModel);
    } catch (_error) {
      // error handling optional
    }
    handleCloseActionMenu();
  };

  return (
    <>
      <Collapse in={showSearch}>
        <Box py={2} px={2}>
          <CollectionsListFilterForm
            initialValues={advancedFiltersModel}
            handleSubmit={(values) => {
              setSearchParams(
                searchParams
                  .setOrDelete('p_keyword', values.keyword)
                  .setOrDelete('p_itis_tsn', values.itis_tsn)
                  .setOrDelete('p_system_user_id', values.system_user_id)
              );
              setAdvancedFiltersModel(values);
            }}
          />
        </Box>
        <Divider />
      </Collapse>

      <LoadingGuard
        isLoading={!rows.length && (collectionsDataLoader.isLoading || !collectionsDataLoader.isReady)}
        isLoadingFallback={<SkeletonTable />}
        isLoadingFallbackDelay={100}
        hasNoData={!rows.length}
        hasNoDataFallback={
          <NoDataOverlay
            title="Create or Join Projects"
            subtitle="You currently have no collections. Once you create or get invited to collections, they will be displayed here"
            icon={mdiArrowTopRight}
          />
        }
        hasNoDataFallbackDelay={100}>
        <StyledDataGrid
          noRowsMessage="No projects found"
          loading={!rows.length && (collectionsDataLoader.isLoading || !collectionsDataLoader.isReady)}
          // Columns
          columns={columns}
          // Rows
          rows={rows}
          rowCount={collectionsDataLoader.data?.pagination.total ?? 0}
          getRowId={(row) => row.collection_id}
          // Pagination
          paginationMode="server"
          paginationModel={paginationModel}
          pageSizeOptions={pageSizeOptions}
          onPaginationModelChange={(model) => {
            if (!model) {
              return;
            }
            setSearchParams(searchParams.set('p_page', String(model.page)).set('p_limit', String(model.pageSize)));
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
            setSearchParams(searchParams.set('p_sort', model[0].field).set('p_order', model[0].sort ?? 'desc'));
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
      <Menu
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleCloseActionMenu}
        anchorEl={actionMenuAnchorEl?.anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default CollectionsListContainer;
