import { mdiDotsVertical, mdiMapMarker, mdiTrashCanOutline, mdiViewGridPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridRowSelectionModel } from '@mui/x-data-grid';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import { useState } from 'react';
import { SamplingSiteTableContainer } from './tabs/sites/SamplingSiteTableContainer';

export enum SamplingSiteManageTableView {
  SITES = 'SITES',
  CLUSTER = 'CLUSTERS'
}

/**
 * Returns a container for changing which table is viewed, toggling between sampling sites and survey blocks,
 * and controls bulk actions for deleting sampling sites and blocks selected in either table
 *
 * @returns {*}
 */
export const SamplingSiteTabsContainer = () => {
  const [activeView, setActiveView] = useState<SamplingSiteManageTableView>(SamplingSiteManageTableView.SITES);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);

  // Arbitrary number used to trigger refreshes in children
  const [siteRefreshKey, setSiteRefreshKey] = useState(0);

  const dialogContext = useDialogContext();
  const { surveyId, projectId } = useSurveyContext();
  const biohubApi = useBiohubApi();

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleBulkDeleteBlocks = async () => {
    try {
      await biohubApi.block.deleteBlocks(
        projectId,
        surveyId,
        selectedRows.map((site) => Number(site))
      );
      dialogContext.setYesNoDialog({ open: false });
      setSelectedRows([]);
      // // Trigger data refresh
      // setBlockRefreshKey((prev) => prev + 1);
    } catch (error) {
      dialogContext.setYesNoDialog({ open: false });
      setSelectedRows([]);
      dialogContext.setSnackbar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              <strong>Error Deleting Clusters</strong>
            </Typography>
            <Typography variant="body2" component="div">
              {String(error)}
            </Typography>
          </>
        ),
        open: true
      });
    }
  };

  const handlePromptConfirmBulkDeleteBlocks = () => {
    setMenuAnchorEl(null);
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Cluster?',
      dialogContent: (
        <Typography component="div" color="textSecondary">
          Are you sure you want to delete the selected clusters?
        </Typography>
      ),
      yesButtonLabel: 'Delete Clusters',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'error' },
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      onNo: () => dialogContext.setYesNoDialog({ open: false }),
      open: true,
      onYes: handleBulkDeleteBlocks
    });
  };

  const handleBulkDeleteSites = async () => {
    try {
      await biohubApi.samplingSite.deleteSampleSites(
        projectId,
        surveyId,
        selectedRows.map((site) => Number(site))
      );
      dialogContext.setYesNoDialog({ open: false });
      setSelectedRows([]);
      // Trigger data refresh
      setSiteRefreshKey((prev) => prev + 1);
    } catch (error) {
      dialogContext.setYesNoDialog({ open: false });
      setSelectedRows([]);
      dialogContext.setSnackbar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              <strong>Error Deleting Items</strong>
            </Typography>
            <Typography variant="body2" component="div">
              {String(error)}
            </Typography>
          </>
        ),
        open: true
      });
    }
  };

  // Handler for confirming bulk delete operation
  const handlePromptConfirmBulkDeleteSites = () => {
    setMenuAnchorEl(null);
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Sampling Sites?',
      dialogContent: (
        <Typography component="div" color="textSecondary">
          Are you sure you want to delete the selected sampling sites?
        </Typography>
      ),
      yesButtonLabel: 'Delete Sampling Sites',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'error' },
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      onNo: () => dialogContext.setYesNoDialog({ open: false }),
      open: true,
      onYes: handleBulkDeleteSites
    });
  };

  // Controls which confirmation dialog to show, based on whether sites or clusters is selected
  const handleDeleteSelected = () => {
    if (activeView === SamplingSiteManageTableView.SITES) {
      handlePromptConfirmBulkDeleteSites();
    }
    if (activeView === SamplingSiteManageTableView.CLUSTER) {
      handlePromptConfirmBulkDeleteBlocks();
    }
  };

  return (
    <>
      {/* Bulk action context menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={handleDeleteSelected}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Delete Selected</ListItemText>
        </MenuItem>
      </Menu>

      <Toolbar
        disableGutters
        sx={{
          flex: '1 1 auto',
          pl: 2,
          pr: 5.5,
          width: '100%'
        }}>
        <CustomToggleButtonGroup
          views={[
            { value: SamplingSiteManageTableView.SITES, icon: mdiMapMarker, label: SamplingSiteManageTableView.SITES },
            {
              value: SamplingSiteManageTableView.CLUSTER,
              icon: mdiViewGridPlus,
              label: SamplingSiteManageTableView.CLUSTER
            }
          ]}
          activeView={activeView}
          onViewChange={(view) => setActiveView(view)}
          orientation="horizontal"
        />

        <IconButton
          edge="end"
          sx={{ ml: 1 }}
          aria-label="header-settings"
          // disabled={activeView === SamplingSiteTabViews.}
          onClick={handleMenuOpen}
          title="Bulk Actions">
          <Icon path={mdiDotsVertical} size={1} />
        </IconButton>
      </Toolbar>

      <Divider flexItem />

      <Box height="400px">
        {/* Render child components based on the active view */}
        {activeView === SamplingSiteManageTableView.SITES && (
          // <Stack flexDirection="row" height="100%">
          <SamplingSiteTableContainer
            refreshKey={siteRefreshKey}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
          />
        )}
      </Box>
    </>
  );
};
