import { mdiArrowTopRight, mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import {
  Box,
  Collapse,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuProps,
  Stack,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import grey from '@mui/material/colors/grey';
import { GridColDef, GridPaginationModel, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';

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
import SubcollectionDialog from './dialog/SubcollectionDialog';

import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';

import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { SUMMARY_ACTIVE_VIEW_KEY, SUMMARY_ACTIVE_VIEW_VALUE } from 'features/summary/list-data/ListDataTableContainer';
import { APIError } from 'hooks/api/useAxios';
import { ICollection } from 'interfaces/useCollectionApi.interface';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull, getRandomHexColor } from 'utils/Utils';

const pageSizeOptions = [10, 25, 50];

type CollectionDataTableURLParams = {
  p_keyword?: string;
  p_itis_tsn?: number;
  p_system_user_id?: string;
  p_page?: string;
  p_limit?: string;
  p_sort?: string;
  p_order?: 'asc' | 'desc';
};

interface ICollectionsTagContainerProps {
  collection: ICollection;
  showSearch: boolean;
}

const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 10,
  sort: 'collection_id',
  order: 'desc'
};

export const SubcollectionContainer = ({ collection, showSearch }: ICollectionsTagContainerProps) => {
  const biohubApi = useBiohubApi();
  const dialogContext = useDialogContext();
  const history = useHistory();

  const { searchParams, setSearchParams } = useSearchParams<StringValues<CollectionDataTableURLParams>>();

  const [collectionDialogIsOpen, setCollectionDialogIsOpen] = useState(false);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<{
    anchorEl: MenuProps['anchorEl'];
    collectionId: number;
  } | null>(null);

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
      page: paginationModel.page + 1
    }),
    [paginationModel, sort]
  );

  const collectionsDataLoader = useDataLoader((pagination, filters) =>
    biohubApi.collection.findSubcollections(collection.collection_id, pagination, filters)
  );

  useDeepCompareEffect(() => {
    collectionsDataLoader.refresh(paginationSort, advancedFiltersModel);
  }, [paginationSort, advancedFiltersModel]);

  const rows = collectionsDataLoader.data?.collections ?? [];

  const showDeleteDialog = () => {
    if (!actionMenuAnchorEl?.collectionId) {
      return;
    }

    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Project',
      dialogText: 'Are you sure you want to delete this project?',
      yesButtonLabel: 'Delete',
      yesButtonProps: { color: 'error' },
      noButtonLabel: 'Cancel',
      noButtonProps: { color: 'primary', variant: 'outlined' },
      open: true,
      onYes: async () => {
        dialogContext.setYesNoDialog({ open: false });
        try {
          await biohubApi.collection.deleteCollection(actionMenuAnchorEl.collectionId);
          collectionsDataLoader.refresh(paginationSort, advancedFiltersModel);
          history.push(`/admin/summary?${SUMMARY_ACTIVE_VIEW_KEY}=${SUMMARY_ACTIVE_VIEW_VALUE.collections}`);
        } catch (error) {
          showDeleteErrorDialog({ dialogErrorDetails: [(error as APIError).message], open: true });
        } finally {
          setActionMenuAnchorEl(null);
        }
      },
      onNo: () => dialogContext.setYesNoDialog({ open: false }),
      onClose: () => dialogContext.setYesNoDialog({ open: false })
    });
  };

  const handleEdit = () => {
    history.push(`/admin/collections/${actionMenuAnchorEl?.collectionId}/edit`);
    setActionMenuAnchorEl(null);
  };

  const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: 'Error Deleting Project',
      dialogText: 'An error occurred while trying to delete the project.',
      open: true,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps
    });
  };

  const columns: GridColDef<ICollection>[] = [
    {
      field: 'collection_id',
      headerName: 'ID',
      width: 85,
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
      renderCell: (params) => (
        <Stack mb={0.25}>
          <Link
            component={RouterLink}
            to={`/admin/collections/${params.row.collection_id}`}
            underline="always"
            title={params.row.name}
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}>
            {params.row.name}
          </Link>
        </Stack>
      )
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
      field: 'members',
      headerName: 'Members',
      flex: 0.4,
      disableColumnMenu: true,
      renderCell: (params) => {
        const members = params.row.members;
        const visibleMembers = members.slice(0, 5);
        const remainingCount = members.length - visibleMembers.length;

        return (
          <Stack direction="row" alignItems="center" gap={0.5}>
            {visibleMembers.map((member) => (
              <TeamMemberAvatar
                key={member.system_user_id}
                tooltip={member.display_name}
                label={member.display_name
                  .split(',')
                  .map((name) => name.trim()[0].toUpperCase())
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
          onClick={(e) => setActionMenuAnchorEl({ anchorEl: e.currentTarget, collectionId: params.row.collection_id })}>
          <Icon path={mdiDotsVertical} size={1} />
        </IconButton>
      )
    }
  ];

  return (
    <>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h2">
          Subprojects&nbsp;
          <Typography component="span" color="textSecondary" fontSize="inherit" fontWeight={400}>
            ({Number(collectionsDataLoader.data?.pagination?.total ?? 0).toLocaleString()})
          </Typography>
        </Typography>
        <CreateButton label="Add Subproject" onClick={() => setCollectionDialogIsOpen(true)} />
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
          hasNoData={!rows.length}
          hasNoDataFallback={
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '60vh', width: '100%' }}>
              <NoDataOverlay
                minHeight="400px"
                title="Create Subcollections"
                subtitle="There are no subcollections. When you create one, it will appear here."
                icon={mdiArrowTopRight}
                sx={{ flex: 1 }}
              />
            </Box>
          }>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '60vh', width: '100%' }}>
            <StyledDataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row.collection_id}
              rowCount={collectionsDataLoader.data?.pagination.total ?? 0}
              rowHeight={70}
              getRowHeight={() => 'auto'}
              autoHeight={false}
              sx={{ flex: 1 }}
              // Pagination
              paginationMode="server"
              paginationModel={paginationModel}
              pageSizeOptions={pageSizeOptions}
              onPaginationModelChange={(model) => {
                setSearchParams(searchParams.set('p_page', String(model.page)).set('p_limit', String(model.pageSize)));
                setPaginationModel(model);
              }}
              // Sorting
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={(model) => {
                if (model.length) {
                  setSearchParams(searchParams.set('p_sort', model[0].field).set('p_order', model[0].sort ?? 'desc'));
                  setSortModel(model);
                }
              }}
              // Other
              rowSelection={false}
              checkboxSelection={false}
              disableRowSelectionOnClick
              disableColumnSelector
              disableColumnFilter
              disableColumnMenu
              noRowsMessage="No collections found"
              loading={!rows.length && (collectionsDataLoader.isLoading || !collectionsDataLoader.isReady)}
            />
          </Box>
        </LoadingGuard>
      </Box>

      {collectionDialogIsOpen && (
        <SubcollectionDialog
          collection={collection}
          open={collectionDialogIsOpen}
          onClose={() => setCollectionDialogIsOpen(false)}
          onSubmit={() => {
            collectionsDataLoader.refresh(paginationSort, advancedFiltersModel);
            setCollectionDialogIsOpen(false);
          }}
        />
      )}

      <Menu
        open={Boolean(actionMenuAnchorEl)}
        anchorEl={actionMenuAnchorEl?.anchorEl}
        onClose={() => setActionMenuAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Edit Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={showDeleteDialog}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
