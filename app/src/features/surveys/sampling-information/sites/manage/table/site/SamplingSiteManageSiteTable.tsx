import { mdiArrowTopRight, mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import { blueGrey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { GridColDef, GridOverlay, GridRowSelectionModel } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { Feature } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import { IGetSampleLocationDetails } from 'interfaces/useSamplingSiteApi.interface';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getSamplingSiteSpatialType } from 'utils/spatial-utils';

export interface ISamplingSiteRowData {
  id: number;
  name: string;
  description: string;
  geojson: Feature;
  blocks: string[];
  stratums: string[];
}

interface ISamplingSiteManageSiteTableProps {
  sites: IGetSampleLocationDetails[];
  bulkActionSites: GridRowSelectionModel;
  setBulkActionSites: (selection: GridRowSelectionModel) => void;
}

/**
 * Returns a table of sampling sites with edit actions
 *
 * @param props {<ISamplingSiteManageSiteTableProps>}
 * @returns {*}
 */
export const SamplingSiteManageSiteTable = (props: ISamplingSiteManageSiteTableProps) => {
  const { sites, bulkActionSites, setBulkActionSites } = props;

  const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();

  const [actionMenuSite, setActionMenuSite] = useState<number | undefined>();
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
  };

  const handleDeleteSamplingSite = async () => {
    await biohubApi.samplingSite
      .deleteSampleSite(surveyContext.projectId, surveyContext.surveyId, Number(actionMenuSite))
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setActionMenuAnchorEl(null);
        surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
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
  const deleteSamplingSiteDialog = () => {
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
        handleDeleteSamplingSite();
      }
    });
  };

  const rows: ISamplingSiteRowData[] = sites.map((site) => ({
    id: site.survey_sample_site_id,
    name: site.name,
    description: site.description || '',
    geojson: site.geojson,
    blocks: site.blocks.map((block) => block.name),
    stratums: site.stratums.map((stratum) => stratum.name)
  }));

  const columns: GridColDef<ISamplingSiteRowData>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1
    },
    {
      field: 'geometry_type',
      headerName: 'Geometry',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <ColouredRectangleChip
            label={getSamplingSiteSpatialType(params.row.geojson) ?? 'Unknown'}
            colour={blueGrey}
          />
        </Box>
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1
    },

    {
      field: 'blocks',
      headerName: 'Blocks',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {params.row.blocks.map((block) => (
            <Box key={block} mr={1} mb={1}>
              <ColouredRectangleChip label={block} colour={blueGrey} />
            </Box>
          ))}
        </Box>
      )
    },
    {
      field: 'stratums',
      headerName: 'Strata',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {params.row.stratums.map((stratum) => (
            <Box key={stratum} mr={1} mb={1}>
              <ColouredRectangleChip label={stratum} colour={blueGrey} />
            </Box>
          ))}
        </Box>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      width: 10,
      align: 'right',
      renderCell: (params) => {
        return (
          <Box position="fixed">
            <IconButton
              onClick={(event) => {
                setActionMenuSite(params.row.id);
                setActionMenuAnchorEl(event.currentTarget);
              }}>
              <Icon path={mdiDotsVertical} size={1} />
            </IconButton>
          </Box>
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
        anchorEl={actionMenuAnchorEl}
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
            to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling/${actionMenuSite}/edit`}>
            <ListItemIcon>
              <Icon path={mdiPencilOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Edit Details</ListItemText>
          </RouterLink>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseActionMenu();
            deleteSamplingSiteDialog();
          }}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* DATA TABLE */}
      <StyledDataGrid
        autoHeight
        getRowHeight={() => 'auto'}
        disableColumnMenu
        rows={rows}
        getRowId={(row: ISamplingSiteRowData) => row.id}
        columns={columns}
        rowSelectionModel={bulkActionSites}
        onRowSelectionModelChange={setBulkActionSites}
        checkboxSelection
        noRowsOverlay={
          <GridOverlay>
            <NoDataOverlay
              title="Add Sampling Sites"
              subtitle="Sampling sites show where techniques were implemented"
              icon={mdiArrowTopRight}
            />
          </GridOverlay>
        }
        sx={{
          '& .MuiDataGrid-virtualScroller': {
            height: rows.length === 0 ? '250px' : 'unset',
            overflowY: 'auto !important',
            overflowX: 'hidden'
          }
        }}
      />
    </>
  );
};
