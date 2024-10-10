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
import {
  ISamplingSitePeriodRowData,
  SamplingPeriodTable
} from 'features/surveys/sampling-information/periods/table/SamplingPeriodTable';
import { SamplingSiteMapContainer } from 'features/surveys/sampling-information/sites/map/SamplingSiteMapContainer';
import { SamplingSiteTable } from 'features/surveys/sampling-information/sites/table/SamplingSiteTable';
import {
  SamplingSiteManageTableView,
  SamplingSiteTabs
} from 'features/surveys/sampling-information/sites/table/SamplingSiteTabs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Component for managing sampling sites, methods, and periods.
 * Returns a map and data grids displaying sampling information.
 *
 * @returns {*}
 */
const SamplingSiteContainer = () => {
  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();
  const biohubApi = useBiohubApi();

  // State for bulk actions
  const [headerAnchorEl, setHeaderAnchorEl] = useState<null | HTMLElement>(null);
  const [siteSelection, setSiteSelection] = useState<GridRowSelectionModel>([]);

  // Controls whether sites, methods, or periods are shown
  const [activeView, setActiveView] = useState<SamplingSiteManageTableView>(SamplingSiteManageTableView.SITES);

  const sampleSites = useMemo(
    () => surveyContext.sampleSiteDataLoader.data?.sampleSites ?? [],
    [surveyContext.sampleSiteDataLoader.data?.sampleSites]
  );
  const sampleSiteCount = surveyContext.sampleSiteDataLoader.data?.pagination.total ?? 0;

  const samplePeriods: ISamplingSitePeriodRowData[] = useMemo(() => {
    const data: ISamplingSitePeriodRowData[] = [];

    for (const site of sampleSites) {
      for (const method of site.sample_methods) {
        for (const period of method.sample_periods) {
          data.push({
            id: period.survey_sample_period_id,
            sample_site: site.name,
            sample_method: method.technique.name,
            method_response_metric_id: method.method_response_metric_id,
            start_date: period.start_date,
            end_date: period.end_date,
            start_time: period.start_time,
            end_time: period.end_time
          });
        }
      }
    }

    return data;
  }, [sampleSites]);

  useEffect(() => {
    surveyContext.sampleSiteDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
  }, [surveyContext.sampleSiteDataLoader, surveyContext.projectId, surveyContext.surveyId]);

  // Handler for bulk delete operation
  const handleBulkDelete = async () => {
    try {
      await biohubApi.samplingSite.deleteSampleSites(
        surveyContext.projectId,
        surveyContext.surveyId,
        siteSelection.map((site) => Number(site)) // Convert GridRowId to number[]
      );
      dialogContext.setYesNoDialog({ open: false }); // Close confirmation dialog
      setSiteSelection([]); // Clear selection
      surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId); // Refresh data
    } catch (error) {
      dialogContext.setYesNoDialog({ open: false }); // Close confirmation dialog on error
      setSiteSelection([]); // Clear selection
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

  // Counts for the toggle button labels
  const viewCounts = {
    [SamplingSiteManageTableView.SITES]: sampleSiteCount,
    [SamplingSiteManageTableView.PERIODS]: samplePeriods.length
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
          Sampling Sites &zwnj;
          <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
            ({sampleSiteCount})
          </Typography>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          disabled={Boolean(!surveyContext.techniqueDataLoader.data?.count)}
          component={RouterLink}
          to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling/create`}
          startIcon={<Icon path={mdiPlus} size={0.8} />}>
          Add
        </Button>
        <IconButton
          edge="end"
          sx={{ ml: 1 }}
          aria-label="header-settings"
          disabled={!siteSelection.length}
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
          <SamplingSiteMapContainer />

          {/* Toggle buttons for changing between sites, methods, and periods */}
          <SamplingSiteTabs activeView={activeView} setActiveView={setActiveView} viewCounts={viewCounts} />

          <Divider flexItem />

          {/* Data tables */}
          <Box p={2}>
            {activeView === SamplingSiteManageTableView.SITES && (
              <LoadingGuard
                isLoading={surveyContext.sampleSiteDataLoader.isLoading || !surveyContext.sampleSiteDataLoader.isReady}
                isLoadingFallback={<SkeletonTable />}
                isLoadingFallbackDelay={100}
                hasNoData={!viewCounts[SamplingSiteManageTableView.SITES]}
                hasNoDataFallback={
                  <NoDataOverlay
                    height="200px"
                    title="Add Sampling Sites"
                    subtitle="Apply your techniques to sampling sites to show where you collected data"
                    icon={mdiArrowTopRight}
                  />
                }
                hasNoDataFallbackDelay={100}>
                <SamplingSiteTable
                  sites={sampleSites}
                  setBulkActionSites={setSiteSelection}
                  bulkActionSites={siteSelection}
                />
              </LoadingGuard>
            )}

            {activeView === SamplingSiteManageTableView.PERIODS && (
              <LoadingGuard
                isLoading={surveyContext.sampleSiteDataLoader.isLoading || !surveyContext.sampleSiteDataLoader.isReady}
                isLoadingFallback={<SkeletonTable />}
                isLoadingFallbackDelay={100}
                hasNoData={!viewCounts[SamplingSiteManageTableView.PERIODS]}
                hasNoDataFallback={
                  <NoDataOverlay
                    height="200px"
                    title="Add Periods"
                    subtitle="Add periods when you create sampling sites to show when you collected species observations"
                    icon={mdiArrowTopRight}
                  />
                }
                hasNoDataFallbackDelay={100}>
                <SamplingPeriodTable periods={samplePeriods} />
              </LoadingGuard>
            )}
          </Box>
        </LoadingGuard>
      </Box>
    </>
  );
};

export default SamplingSiteContainer;
