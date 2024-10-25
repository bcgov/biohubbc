import { mdiArrowTopRight, mdiDotsVertical, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridRowSelectionModel } from '@mui/x-data-grid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonMap, SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { DeploymentsTable } from 'features/surveys/telemetry/manage/deployments/table/DeploymentsTable';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export const DeploymentsContainer = () => {
  const dialogContext = useDialogContext();
  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();

  // State for bulk actions
  const [headerAnchorEl, setHeaderAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);

  const deploymentDataLoader = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.telemetryDeployment.getDeploymentsInSurvey(projectId, surveyId)
  );

  useEffect(() => {
    deploymentDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
  }, [deploymentDataLoader, surveyContext.projectId, surveyContext.surveyId]);

  const deployments = deploymentDataLoader.data?.deployments ?? [];
  const deploymentsCount = deploymentDataLoader.data?.count ?? 0;

  // Handler for bulk delete operation
  const handleBulkDelete = async () => {
    try {
      await biohubApi.samplingSite.deleteSampleSites(
        surveyContext.projectId,
        surveyContext.surveyId,
        selectedRows.map((site) => Number(site)) // Convert GridRowId to number[]
      );
      dialogContext.setYesNoDialog({ open: false }); // Close confirmation dialog
      setSelectedRows([]); // Clear selection
      surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId); // Refresh data
    } catch (error) {
      dialogContext.setYesNoDialog({ open: false }); // Close confirmation dialog on error
      setSelectedRows([]); // Clear selection
      // Show snackbar with error message
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

  // Handler for clicking on header menu (bulk actions)
  const handleHeaderMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setHeaderAnchorEl(event.currentTarget);
  };

  // Handler for confirming bulk delete operation
  const handlePromptConfirmBulkDelete = () => {
    setHeaderAnchorEl(null); // Close header menu
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Sampling Sites?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Are you sure you want to delete the selected sampling sites?
        </Typography>
      ),
      yesButtonLabel: 'Delete Sampling Sites',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'error' },
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      onNo: () => dialogContext.setYesNoDialog({ open: false }),
      open: true,
      onYes: handleBulkDelete
    });
  };

  return (
    <>
      {/* Bulk action menu */}
      <Menu
        open={Boolean(headerAnchorEl)}
        onClose={() => setHeaderAnchorEl(null)}
        anchorEl={headerAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={handlePromptConfirmBulkDelete}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Toolbar sx={{ flex: '0 0 auto', pr: 3, pl: 2 }}>
        <Typography variant="h3" component="h2" flexGrow={1}>
          Deployments &zwnj;
          <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
            ({deploymentsCount})
          </Typography>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/telemetry/manage/deployment/create`}
          startIcon={<Icon path={mdiPlus} size={0.8} />}>
          Add
        </Button>
        <IconButton
          edge="end"
          sx={{ ml: 1 }}
          aria-label="header-settings"
          disabled={!selectedRows.length}
          onClick={handleHeaderMenuClick}
          title="Bulk Actions">
          <Icon path={mdiDotsVertical} size={1} />
        </IconButton>
      </Toolbar>

      <Divider flexItem />

      <Box>
        <LoadingGuard
          isLoading={surveyContext.sampleSiteDataLoader.isLoading}
          isLoadingFallback={
            <>
              <SkeletonMap />
              <SkeletonTable numberOfLines={5} />
            </>
          }
          isLoadingFallbackDelay={100}>
          <Divider flexItem />
          <Box p={2}>
            <LoadingGuard
              isLoading={surveyContext.sampleSiteDataLoader.isLoading || !surveyContext.sampleSiteDataLoader.isReady}
              isLoadingFallback={<SkeletonTable />}
              isLoadingFallbackDelay={100}
              hasNoData={!deploymentsCount}
              hasNoDataFallback={
                <NoDataOverlay
                  height="200px"
                  title="Add Telemetry Deployments"
                  subtitle="Add telemetry deployments, which associate an animal to a telemetry device."
                  icon={mdiArrowTopRight}
                />
              }
              hasNoDataFallbackDelay={100}>
              <DeploymentsTable
                deployments={deployments}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
              />
            </LoadingGuard>
          </Box>
        </LoadingGuard>
      </Box>
    </>
  );
};
