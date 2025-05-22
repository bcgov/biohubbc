import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import { TeamMemberAvatar } from 'components/avatar/TeamMemberAvatar';
import { CreateButton } from 'components/buttons/CreateButton';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import CollectionsListFilterForm, {
  CollectionAdvancedFiltersInitialValues,
  ICollectionAdvancedFilters
} from 'features/summary/list-data/collection/CollectionListFilterForm';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import { ICollection } from 'interfaces/useCollectionApi.interface';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull, getRandomHexColor } from 'utils/Utils';
import SubcollectionDialog from './dialog/SubcollectionDialog';

// Supported URL parameters
// Note: Prefix 'p_' is used to avoid conflicts with similar query params from other components
type CollectionDataTableURLParams = {
  // filter
  p_keyword?: string;
  p_itis_tsn?: number;
  p_system_user_id?: string;
  // pagination
  p_page?: string;
  p_limit?: string;
  p_sort?: string;
  p_order?: 'asc' | 'desc';
};

const pageSizeOptions = [10, 25, 50];

interface ICollectionsTagContainerProps {
  collection: ICollection;
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
export const SubcollectionContainer = (props: ICollectionsTagContainerProps) => {
  const { collection, showSearch } = props;

  const biohubApi = useBiohubApi();

  const { searchParams, setSearchParams } = useSearchParams<StringValues<CollectionDataTableURLParams>>();
  const [collectionDialogIsOpen, setCollectionDialogIsOpen] = useState(false);

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
    parent_collection_id: collection.parent_collection_id
  });

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
      biohubApi.collection.findSubcollections(collection.collection_id, pagination, filter)
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
    }
  ];

  return (
    <>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h2">
          Subcollections &zwnj;
          <Typography component="span" color="textSecondary" lineHeight="inherit" fontSize="inherit" fontWeight={400}>
            ({Number(collectionsDataLoader.data?.pagination?.total ?? 0).toLocaleString()})
          </Typography>
        </Typography>
        <Stack gap={1} direction="row">
          <CreateButton
            label="Add Subcollection"
            onClick={() => {
              setCollectionDialogIsOpen(true);
            }}
          />
        </Stack>
      </Toolbar>
      <Divider />

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

      <Box height="100%">
        <LoadingGuard
          isLoading={!rows.length && (collectionsDataLoader.isLoading || !collectionsDataLoader.isReady)}
          isLoadingFallback={<SkeletonTable />}
          isLoadingFallbackDelay={100}
          hasNoData={!rows.length}
          hasNoDataFallback={
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '60vh', width: '100%' }}>
              <Box sx={{ flex: 1, display: 'flex' }}>
                <NoDataOverlay
                  minHeight="400px"
                  title="Create Subcollections"
                  subtitle={`There are no subcollections. When you create one, it will appear here.`}
                  icon={mdiArrowTopRight}
                  sx={{ width: '100%', height: '100%', m: 0 }}
                />
              </Box>
            </Box>
          }
          hasNoDataFallbackDelay={100}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '60vh', width: '100%' }}>
            <StyledDataGrid
              noRowsMessage="No collections found"
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
              sx={{ flex: 1 }}
            />
          </Box>
        </LoadingGuard>
      </Box>

      {collectionDialogIsOpen && (
        <SubcollectionDialog
          collection={collection}
          onSubmit={() => {
            collectionsDataLoader.refresh(paginationSort, advancedFiltersModel);
            setCollectionDialogIsOpen(false);
          }}
          onClose={() => {
            setCollectionDialogIsOpen(false);
          }}
          open={collectionDialogIsOpen}
        />
      )}
    </>
  );
};
