import { mdiArrowTopRight, mdiDotsVertical, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
import { getCollectionRoleColour } from 'constants/colours';
import { COLLECTION_ROLE } from 'constants/roles';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import { ICollectionMember, ICollectionMembersAdvancedFilters } from 'interfaces/useCollectionApi.interface';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useState } from 'react';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull, getCodesName } from 'utils/Utils';
import CollectionMemberDialog from './dialog/CollectionMemberDialog';
import MembersFilterForm from './filter/CollectionMembersFilterForm';

const pageSizeOptions = [10, 25, 50];

// Supported URL parameters
// Note: Prefix 'c_' is used to avoid conflicts with similar query params from other components
type SurveyDataTableURLParams = {
  // filter
  c_keyword?: string;
  c_itis_tsn?: number;
  c_system_user_id?: string;
  // pagination
  c_page?: string;
  c_limit?: string;
  c_sort?: string;
  c_order?: 'asc' | 'desc';
};

interface ICollectionMembersTableContainerProps {
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
export const CollectionMembersTableContainer = (props: ICollectionMembersTableContainerProps) => {
  const { collectionId } = props;

  const biohubApi = useBiohubApi();
  const codesContext = useCodesContext();
  const dialogContext = useDialogContext();

  const { searchParams, setSearchParams } = useSearchParams<StringValues<SurveyDataTableURLParams>>();
  const [memberDialogIsOpen, setmemberDialogIsOpen] = useState(false);

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
    keyword: searchParams.get('c_keyword') ?? undefined,
    system_user_id: searchParams.get('c_system_user_id') ? Number(searchParams.get('c_system_user_id')) : undefined
  });

  const [actionMenuEl, setActionMenuEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<ICollectionMember | null>(null);

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    page: paginationModel.page + 1 // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
  };

  const collectionMembersDataLoader = useDataLoader(
    (pagination?: ApiPaginationRequestOptions, filter?: ICollectionMembersAdvancedFilters) =>
      biohubApi.collection.getMembers(collectionId, pagination, filter)
  );

  // Fetch collectionMemberss when either the pagination, sort, or advanced filters change
  useDeepCompareEffect(() => {
    collectionMembersDataLoader.refresh(paginationSort, advancedFiltersModel);
  }, [advancedFiltersModel, paginationSort]);

  const handleOpenActionMenu = (event: React.MouseEvent, member: ICollectionMember) => {
    setActionMenuEl(event.currentTarget as HTMLElement);
    setSelectedMember(member);
  };

  const handleCloseActionMenu = () => {
    setActionMenuEl(null);
    setSelectedMember(null);
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) {
      return;
    }
    handleCloseActionMenu();

    dialogContext.setYesNoDialog({
      dialogTitle: 'Remove Member',
      dialogText: `Are you sure you want to remove ${selectedMember.display_name} from this collection?`,
      yesButtonLabel: 'Remove',
      yesButtonProps: { color: 'error' },
      noButtonLabel: 'Cancel',
      open: true,
      onYes: async () => {
        dialogContext.setYesNoDialog({ open: false });
        try {
          await biohubApi.collection.deleteMember(collectionId, selectedMember.collection_member_id);
          collectionMembersDataLoader.refresh(paginationSort, advancedFiltersModel);
        } catch (error) {
          dialogContext.setErrorDialog({
            dialogTitle: 'Error Removing Member',
            dialogText: (error as APIError).message,
            open: true,
            onClose: () => dialogContext.setErrorDialog({ open: false }),
            onOk: () => dialogContext.setErrorDialog({ open: false })
          });
        }
      },
      onNo: () => dialogContext.setYesNoDialog({ open: false }),
      onClose: () => dialogContext.setYesNoDialog({ open: false })
    });
  };

  // Add actions column
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
        return <ColouredRectangleChip label={role} colour={getCollectionRoleColour(role)} />;
      }
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 50,
      align: 'right',
      renderCell: (params) => (
        <>
          <IconButton onClick={(event) => handleOpenActionMenu(event, params.row)}>
            <Icon path={mdiDotsVertical} size={1} />
          </IconButton>
        </>
      )
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

        <Stack flexDirection="row" gap={1}>
          <Box>
            <MembersFilterForm
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
          <CreateButton
            label="Invite Members"
            onClick={() => {
              setmemberDialogIsOpen(true);
            }}
          />
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.SURVEYS} />
        </Stack>
      </Toolbar>

      <Divider />

      <LoadingGuard
        isLoading={collectionMembersDataLoader.isLoading || !collectionMembersDataLoader.isReady}
        isLoadingFallback={<SkeletonTable data-testid="collection-member-list-skeleton" />}
        isLoadingFallbackDelay={100}
        hasNoData={!collectionMembers.length}
        hasNoDataFallback={
          <Box sx={{ width: '100%', height: '60vh', display: 'flex', flex: 1 }}>
            <NoDataOverlay
              title="Invite Members"
              subtitle="Members added to this collection will appear here"
              icon={mdiArrowTopRight}
              data-testid="collection-member-list-no-data-overlay"
              sx={{ width: '100%', height: '100%', m: 0 }}
            />
          </Box>
        }
        hasNoDataFallbackDelay={100}>
        <StyledDataGrid
          noRowsMessage="No members found"
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

      <Menu
        open={Boolean(actionMenuEl)}
        onClose={handleCloseActionMenu}
        anchorEl={actionMenuEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={handleDeleteMember}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <CollectionMemberDialog
        collectionId={collectionId}
        onSubmit={() => {
          collectionMembersDataLoader.refresh(paginationSort, advancedFiltersModel);
          setmemberDialogIsOpen(false);
        }}
        onClose={() => {
          setmemberDialogIsOpen(false);
        }}
        open={memberDialogIsOpen}
      />
    </>
  );
};
