import { mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import { IGetSurveyBlock } from 'interfaces/useBlockApi.interface';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export interface IBlockRowData {
  id: number;
  name: string;
  description: string | null;
  sample_block_count: number;
}

interface ISurveyBlocksTableProps {
  blocks: IGetSurveyBlock[];
  selectedRows: GridRowSelectionModel;
  setSelectedRows: (selection: GridRowSelectionModel) => void;
  paginationModel: GridPaginationModel;
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
  setSortModel: React.Dispatch<React.SetStateAction<GridSortModel>>;
  sortModel: GridSortModel;
  pageSizeOptions: number[];
  rowCount: number;
  /**
   * Callback fired when the delete action is triggered.
   */
  onDelete: (surveyBlockId: number) => Promise<void>;
}

/**
 * Returns a table of survey blocks
 *
 * @param props {ISurveyBlocksTableProps}
 * @returns {*}
 */
export const SurveyBlocksTable = (props: ISurveyBlocksTableProps) => {
  const {
    blocks,
    selectedRows,
    setSelectedRows,
    paginationModel,
    setPaginationModel,
    sortModel,
    setSortModel,
    pageSizeOptions,
    rowCount,
    onDelete
  } = props;

  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();

  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<{
    anchorEl: MenuProps['anchorEl'];
    surveyBlockId: number;
  } | null>(null);

  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
  };

  /**
   * Handle the delete action.
   *
   * @return {*}
   */
  const handleDelete = async () => {
    if (!actionMenuAnchorEl) {
      return;
    }

    await onDelete(actionMenuAnchorEl.surveyBlockId)
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setActionMenuAnchorEl(null);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setActionMenuAnchorEl(null);
        dialogContext.setSnackbar({
          snackbarMessage: (
            <>
              <Typography variant="body2" component="div">
                <strong>Error Deleting Sampling Site</strong>
              </Typography>
              <Typography variant="body2" component="div">
                {String(error)}
              </Typography>
            </>
          ),
          open: true
        });
      });
  };

  /**
   * Display the delete sampling site dialog.
   *
   */
  const handlePromptConfirmDelete = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete sampling site?',
      dialogText: 'Are you sure you want to permanently delete this sampling site?',
      yesButtonLabel: 'Delete Site',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'error' },
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      open: true,
      onYes: () => {
        handleDelete();
      }
    });
  };

  const rows: IBlockRowData[] = blocks.map((block) => ({
    id: block.survey_block_id,
    name: block.name,
    description: block.description,
    sample_block_count: block.sample_block_count
  }));

  const columns: GridColDef<IBlockRowData>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1
    },
    {
      field: 'sample_block_count',
      headerName: 'Sampling Sites',
      description: 'The number of sites in the cluster',
      flex: 1
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      width: 10,
      align: 'right',
      renderCell: (params) => {
        return (
          <IconButton
            onClick={(event) => {
              setActionMenuAnchorEl({ anchorEl: event.currentTarget, surveyBlockId: params.row.id });
            }}>
            <Icon path={mdiDotsVertical} size={1} />
          </IconButton>
        );
      }
    }
  ];

  return (
    <>
      {/* ROW ACTION MENU */}
      <Menu
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleCloseActionMenu}
        anchorEl={actionMenuAnchorEl?.anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem
          sx={{
            p: 0,
            '& a': {
              display: 'flex',
              px: 2,
              py: '6px',
              textDecoration: 'none',
              color: 'text.primary',
              borderRadius: 0,
              '&:focus': {
                outline: 'none'
              }
            }
          }}>
          <RouterLink
            to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling/block/${actionMenuAnchorEl?.surveyBlockId}/edit`}>
            <ListItemIcon>
              <Icon path={mdiPencilOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Edit Details</ListItemText>
          </RouterLink>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseActionMenu();
            handlePromptConfirmDelete();
          }}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* DATA TABLE */}
      <StyledDataGrid
        autoHeight={false}
        getRowHeight={() => 'auto'}
        disableColumnMenu
        rows={rows}
        getRowId={(row: IBlockRowData) => row.id}
        columns={columns}
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={setSelectedRows}
        checkboxSelection
        rowCount={rowCount}
        paginationMode="server"
        sortingMode="server"
        sortModel={sortModel}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onSortModelChange={setSortModel}
        initialState={{
          pagination: {
            paginationModel
          }
        }}
        pageSizeOptions={pageSizeOptions}
      />
    </>
  );
};
