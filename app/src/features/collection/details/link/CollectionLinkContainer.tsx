import { mdiLink } from '@mdi/js';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  GridActionsCellItem,
  GridColDef,
  GridPaginationModel,
  GridSortDirection,
  GridSortModel
} from '@mui/x-data-grid';
import { CreateButton } from 'components/buttons/CreateButton';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import { ICollectionLink } from 'interfaces/useCollectionApi.interface';
import { useState } from 'react';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import { useCreateLinkDialog } from './create/CreateLink';
import { useDeleteLinkDialog } from './delete/DeleteLink';
import { useEditLinkDialog } from './edit/EditLink';

type CollectionLinkDataTableURLParams = {
  // pagination
  l_page?: string;
  l_limit?: string;
  l_sort?: string;
  l_order?: 'asc' | 'desc';
};

const pageSizeOptions = [10, 25, 50];

export interface ICollectionLinkContainerProps {
  collectionId: number;
  showSearch?: boolean;
}

// Default pagination parameters
const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 10,
  sort: 'id',
  order: 'desc'
};

/**
 * Displays a list of collection links.
 *
 * @return {*}
 */
export const CollectionLinkContainer = (props: ICollectionLinkContainerProps) => {
  const { collectionId, showSearch = false } = props;

  const biohubApi = useBiohubApi();
  const { deleteLinkDialog } = useDeleteLinkDialog();
  const { openDialog: openCreateDialog, CreateLinkDialog } = useCreateLinkDialog(collectionId, () =>
    collectionLinksDataLoader.refresh(paginationSort)
  );
  const { openDialog: openEditDialog, EditLinkDialog } = useEditLinkDialog(collectionId, () =>
    collectionLinksDataLoader.refresh(paginationSort)
  );

  const { searchParams, setSearchParams } = useSearchParams<StringValues<CollectionLinkDataTableURLParams>>();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Number(searchParams.get('l_limit') ?? initialPaginationParams.limit),
    page: Number(searchParams.get('l_page') ?? initialPaginationParams.page)
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: searchParams.get('l_sort') ?? initialPaginationParams.sort,
      sort: (searchParams.get('l_order') ?? initialPaginationParams.order) as GridSortDirection
    }
  ]);

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    page: paginationModel.page + 1 // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
  };

  const collectionLinksDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.collection.getCollectionLinks(collectionId, pagination)
  );

  // Fetch collection links when pagination or sort changes
  useDeepCompareEffect(() => {
    collectionLinksDataLoader.refresh(paginationSort);
  }, [paginationSort]);

  const rows = collectionLinksDataLoader.data?.links ?? [];

  // Removed: handleEdit

  // Define the columns for the DataGrid
  const columns: GridColDef<ICollectionLink>[] = [
    {
      field: 'collection_link_id',
      headerName: 'ID',
      width: 80, // Increased from 60
      minWidth: 80,
      renderHeader: () => (
        <Typography color={grey[500]} variant="body2" fontWeight={700}>
          ID
        </Typography>
      ),
      renderCell: (params) => (
        <Typography color={grey[500]} variant="body2">
          {params.row.collection_link_id}
        </Typography>
      )
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 270,
      minWidth: 200,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Stack mb={0.25}>
            <Link
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}
              data-testid={params.row.name}
              underline="always"
              title={params.row.name}
              href={params.row.url}
              target="_blank"
              rel="noopener noreferrer">
              {params.row.name}
            </Link>
          </Stack>
        );
      }
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 450,
      minWidth: 200,
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
      field: 'url',
      headerName: 'URL',
      width: 350, // Increased from 180
      minWidth: 180,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title={params.row.url}>
          <Link
            href={params.row.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            color="primary"
            style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.row.url}
          </Link>
        </Tooltip>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100, // Increased back to 100
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={
            <IconButton size="small">
              <Typography variant="body2">Edit</Typography>
            </IconButton>
          }
          label="Edit"
          onClick={() => openEditDialog(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={
            <IconButton size="small" color="error">
              <Typography variant="body2">Delete</Typography>
            </IconButton>
          }
          label="Delete"
          onClick={() =>
            deleteLinkDialog(collectionId, params.row.collection_link_id, () =>
              collectionLinksDataLoader.refresh(paginationSort)
            )
          }
        />
      ]
    }
  ];

  return (
    <>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h2">
          External Resources &zwnj;
          <Typography component="span" color="textSecondary" lineHeight="inherit" fontSize="inherit" fontWeight={400}>
            ({Number(collectionLinksDataLoader.data?.pagination?.total ?? 0).toLocaleString()})
          </Typography>
        </Typography>
        <Stack gap={1} direction="row">
          <CreateButton label="Add Link" onClick={openCreateDialog} />
        </Stack>
      </Toolbar>
      <Divider />

      {showSearch && (
        <Collapse in={showSearch}>
          <Box py={2} px={2}>
            {/* Add search/filter form here if needed */}
          </Box>
          <Divider />
        </Collapse>
      )}

      <Box height="100%">
        <LoadingGuard
          isLoading={!rows.length && (collectionLinksDataLoader.isLoading || !collectionLinksDataLoader.isReady)}
          isLoadingFallback={<SkeletonTable />}
          isLoadingFallbackDelay={100}
          hasNoData={!rows.length}
          hasNoDataFallback={
            <NoDataOverlay
              minHeight="400px"
              title="Create External Resources"
              subtitle={`There are no external resources. When you create one, it will appear here.`}
              icon={mdiLink}
            />
          }
          hasNoDataFallbackDelay={100}>
          <StyledDataGrid
            noRowsMessage="No links found"
            loading={!rows.length && (collectionLinksDataLoader.isLoading || !collectionLinksDataLoader.isReady)}
            // Columns
            columns={columns}
            // Rows
            rows={rows}
            rowCount={collectionLinksDataLoader.data?.pagination.total ?? 0}
            getRowId={(row) => row.collection_link_id} // Changed from collection_links_id
            // Pagination
            paginationMode="server"
            paginationModel={paginationModel}
            pageSizeOptions={pageSizeOptions}
            onPaginationModelChange={(model) => {
              if (!model) {
                return;
              }
              setSearchParams(searchParams.set('l_page', String(model.page)).set('l_limit', String(model.pageSize)));
              setPaginationModel(model);
            }}
            sortingMode="server"
            sortModel={sortModel}
            sortingOrder={['asc', 'desc']}
            onSortModelChange={(model) => {
              if (!model.length) {
                return;
              }
              setSearchParams(searchParams.set('l_sort', model[0].field).set('l_order', model[0].sort ?? 'desc'));
              setSortModel(model);
            }}
            rowSelection={false}
            checkboxSelection={false}
            disableRowSelectionOnClick
            disableColumnSelector
            disableColumnFilter
            disableColumnMenu
            rowHeight={70}
            getRowHeight={() => 'auto'}
            autoHeight={false}
          />
        </LoadingGuard>
      </Box>

      {CreateLinkDialog}
      {EditLinkDialog}
    </>
  );
};

export default CollectionLinkContainer;
