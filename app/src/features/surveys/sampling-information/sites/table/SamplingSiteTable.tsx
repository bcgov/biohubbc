import { mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { CustomTooltip } from 'components/tooltip/CustomTooltip';
import { getSamplingSiteIcon } from 'features/surveys/observations/sampling-sites/site/utils/SamplingSiteUtils';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import { IGetSampleSiteRecordExtendedNonSpatial } from 'interfaces/useSamplingSiteApi.interface';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export interface ISamplingSiteRowData {
  id: number;
  name: string;
  description: string;
  geometry_type: 'Point' | 'LineString' | 'Polygon';
  blocks: string[];
  stratums: string[];
}

interface ISamplingSiteTableProps {
  sites: IGetSampleSiteRecordExtendedNonSpatial[];
  selectedRows: GridRowSelectionModel;
  setSelectedRows: (selection: GridRowSelectionModel) => void;
  paginationModel: GridPaginationModel;
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
  sortModel: GridSortModel;
  setSortModel: React.Dispatch<React.SetStateAction<GridSortModel>>;
  pageSizeOptions: number[];
  rowCount: number;
  /**
   * Callback fired when the delete action is triggered.
   */
  onDelete: (sampleSiteId: number) => Promise<void>;
}

/**
 * Returns a table of sampling sites with edit actions
 *
 * @param {ISamplingSiteTableProps} props
 * @returns {*}
 */
export const SamplingSiteTable = (props: ISamplingSiteTableProps) => {
  const {
    sites,
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
    sampleSiteId: number;
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

    await onDelete(actionMenuAnchorEl.sampleSiteId)
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
                <strong>Error Deleting SamplingSite</strong>
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
   * Display the delete samplingSite dialog.
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

  const rows: ISamplingSiteRowData[] = sites.map((site) => ({
    id: site.survey_sample_site_id,
    name: site.name,
    geometry_type: site.geometry_type,
    description: site.description || '',
    blocks: site.blocks.map((block) => block.name),
    stratums: site.stratums.map((stratum) => stratum.name)
  }));

  const columns: GridColDef<ISamplingSiteRowData>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      renderCell: (params) => {
        const icon = getSamplingSiteIcon(params.row.geometry_type);
        return (
          <>
            <CustomTooltip tooltip={params.row.description}>{params.row.name}</CustomTooltip>
            <Box sx={{ minWidth: '20px', display: 'flex', alignItems: 'center', ml: 1.5 }}>
              <Icon size={0.8} color={grey[400]} title={icon.title} path={icon.path} />
            </Box>
          </>
        );
      }
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
              setActionMenuAnchorEl({ anchorEl: event.currentTarget, sampleSiteId: params.row.id });
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
          <RouterLink to={`/admin/surveys/${surveyContext.surveyId}/sampling/${actionMenuAnchorEl?.sampleSiteId}/edit`}>
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
        rowHeight={52}
        disableColumnMenu
        rows={rows}
        getRowId={(row: ISamplingSiteRowData) => row.id}
        columns={columns}
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={setSelectedRows}
        checkboxSelection
        disableRowSelectionOnClick
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
