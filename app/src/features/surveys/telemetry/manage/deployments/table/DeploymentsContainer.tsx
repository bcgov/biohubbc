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
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { FOREIGN_KEY_CONSTRAINT_ERROR } from 'constants/errors';
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

  const deploymentsDataLoader = useDataLoader((surveyId: number) =>
    biohubApi.telemetryDeployment.getDeploymentsInSurvey(surveyId)
  );

  useEffect(() => {
    deploymentsDataLoader.load(surveyContext.surveyId);
  }, [deploymentsDataLoader, surveyContext.projectId, surveyContext.surveyId]);

  const deployments = deploymentsDataLoader.data?.deployments ?? [];
  const deploymentsCount = deploymentsDataLoader.data?.count ?? 0;

  // Handler for bulk delete operation
  const handleBulkDelete = async () => {
    try {
      await biohubApi.telemetryDeployment.deleteDeployments(
        surveyContext.projectId,
        surveyContext.surveyId,
        selectedRows.map((id) => Number(id))
      );
      dialogContext.setYesNoDialog({ open: false }); // Close confirmation dialog
      setSelectedRows([]); // Clear selection
      onDelete(); // Refresh data
    } catch (error) {
      dialogContext.setYesNoDialog({ open: false }); // Close confirmation dialog on error
      setSelectedRows([]); // Clear selection
      // Show snackbar with error message
      dialogContext.setSnackbar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              <strong>Error Deleting Deployments</strong>
            </Typography>
            {String(error).includes(FOREIGN_KEY_CONSTRAINT_ERROR) ? (
              <Typography variant="body2" component="div">
                You must delete telemetry data from these deployments before deleting the deployments.
              </Typography>
            ) : (
              <Typography variant="body2" component="div">
                {String(error)}
              </Typography>
            )}
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
      dialogTitle: 'Delete Deployments?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Are you sure you want to delete the selected deployments?
        </Typography>
      ),
      yesButtonLabel: 'Delete Deployments',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'error' },
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      onNo: () => dialogContext.setYesNoDialog({ open: false }),
      open: true,
      onYes: handleBulkDelete
    });
  };

  const onDelete = () => {
    deploymentsDataLoader.refresh(surveyContext.surveyId);
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
          isLoading={deploymentsDataLoader.isLoading}
          isLoadingFallback={<SkeletonTable numberOfLines={5} />}
          isLoadingFallbackDelay={100}>
          <Box>
            <LoadingGuard
              isLoading={deploymentsDataLoader.isLoading || !deploymentsDataLoader.isReady}
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
                onDelete={onDelete}
              />
            </LoadingGuard>
          </Box>
        </LoadingGuard>
      </Box>
    </>
  );
};
