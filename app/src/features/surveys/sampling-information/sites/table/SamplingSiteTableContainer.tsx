import { mdiArrowTopRight, mdiDotsVertical, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import { GridPaginationModel, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import { ISamplingSitePeriodRowData, SamplingPeriodTable } from '../../periods/table/SamplingPeriodTable';
import { SamplingSiteTable } from './SamplingSiteTable';
import { SamplingSiteManageTableView, SamplingSiteTableView } from './view/SamplingSiteTableView';

const pageSizeOptions = [10, 25, 50];

/**
 * Returns a table of sampling sites with edit actions
 *
 * @param props {<ISamplingSiteTableContainerProps>}
 * @returns {*}
 */
export const SamplingSiteTableContainer = () => {
  const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();

  const [headerAnchorEl, setHeaderAnchorEl] = useState<null | HTMLElement>(null);
  const [siteSelection, setSiteSelection] = useState<GridRowSelectionModel>([]);

  // Controls whether sites, methods, or periods are shown
  const [activeView, setActiveView] = useState<SamplingSiteManageTableView>(SamplingSiteManageTableView.SITES);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const samplingSitesDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.samplingSite.getSampleSites(surveyContext.projectId, surveyContext.surveyId, pagination)
  );

  const pagination: ApiPaginationRequestOptions = useMemo(() => {
    const sort = firstOrNull(sortModel);

    return {
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,

      // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
      page: paginationModel.page + 1
    };
  }, [sortModel, paginationModel]);

  // Refresh survey list when pagination or sort changes
  useEffect(() => {
    samplingSitesDataLoader.refresh(pagination);

    // Adding a DataLoader as a dependency causes an infinite rerender loop if a useEffect calls `.refresh`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination]);

  const sampleSites = samplingSitesDataLoader.data?.sampleSites ?? [];

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
      samplingSitesDataLoader.refresh(pagination); // Refresh data
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

      <Toolbar
        disableGutters
        sx={{
          flex: '1 1 auto',
          pl: 3,
          pr: 5.5,
          width: '100%'
        }}>
        {/* Toggle buttons for changing between sites, methods, and periods */}
        <SamplingSiteTableView activeView={activeView} setActiveView={setActiveView} />

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

      {/* Data tables */}
      <Box p={2} height="400px">
        {activeView === SamplingSiteManageTableView.SITES && (
          <LoadingGuard
            isLoading={samplingSitesDataLoader.isLoading || !samplingSitesDataLoader.isReady}
            isLoadingFallback={<SkeletonTable />}
            isLoadingFallbackDelay={100}
            hasNoData={!sampleSites.length}
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
              setPaginationModel={setPaginationModel}
              setSortModel={setSortModel}
              bulkActionSites={siteSelection}
              paginationModel={paginationModel}
              pageSizeOptions={pageSizeOptions}
              rowCount={samplingSitesDataLoader.data?.pagination.total ?? 0}
              sortModel={sortModel}
            />
          </LoadingGuard>
        )}

        {activeView === SamplingSiteManageTableView.PERIODS && (
          <LoadingGuard
            isLoading={samplingSitesDataLoader.isLoading || !samplingSitesDataLoader.isReady}
            isLoadingFallback={<SkeletonTable />}
            isLoadingFallbackDelay={100}
            hasNoData={!samplePeriods.length}
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
    </>
  );
};
