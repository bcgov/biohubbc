import { mdiArrowTopRight, mdiCalendarRange, mdiDotsVertical, mdiMapMarker, mdiTrashCanOutline } from '@mdi/js';
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
import { GridPaginationModel, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { SamplingPeriodTable } from 'features/surveys/sampling-information/periods/table/SamplingPeriodTable';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import { SamplingSiteTable } from './SamplingSiteTable';

const pageSizeOptions = [10, 25, 50];

export enum SamplingViews {
  SITES = 'SITES',
  PERIODS = 'PERIODS'
}

export interface ISamplingPeriodRowData {
  id: number;
  sample_site: string;
  sample_method: string;
  method_response_metric_id: number;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
}

/**
 * Returns a table of sampling sites with edit actions
 *
 * @returns {*}
 */
export const SamplingSiteTableContainer = () => {
  const dialogContext = useDialogContext();
  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();

  // Action menu
  const [headerAnchorEl, setHeaderAnchorEl] = useState<null | HTMLElement>(null);

  // Views
  const [activeView, setActiveView] = useState<SamplingViews>(SamplingViews.SITES);

  const views = [
    { value: SamplingViews.SITES, label: 'Sampling Sites', icon: mdiMapMarker },
    { value: SamplingViews.PERIODS, label: 'Sampling Periods', icon: mdiCalendarRange }
  ];

  // Sites
  const [selectedSites, setSelectedSites] = useState<GridRowSelectionModel>([]);

  const [sitesPaginationModel, setSitesPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });

  const [sitesSortModel, setSitesSortModel] = useState<GridSortModel>([]);

  const sitesPagination: ApiPaginationRequestOptions = useMemo(() => {
    const sort = firstOrNull(sitesSortModel);

    return {
      limit: sitesPaginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,

      // API sitesPagination pages begin at 1, but MUI DataGrid sitesPagination begins at 0.
      page: sitesPaginationModel.page + 1
    };
  }, [sitesSortModel, sitesPaginationModel]);

  const samplingSitesDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.samplingSite.getSampleSites(surveyContext.projectId, surveyContext.surveyId, { pagination })
  );

  // Periods
  const [selectedPeriods, setSelectedPeriods] = useState<GridRowSelectionModel>([]);

  const [periodsPaginationModel, setPeriodsPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });

  const [periodsSortModel, setPeriodsSortModel] = useState<GridSortModel>([]);

  const periodsPagination: ApiPaginationRequestOptions = useMemo(() => {
    const sort = firstOrNull(periodsSortModel);
    return {
      limit: periodsPaginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,
      page: periodsPaginationModel.page + 1
    };
  }, [periodsSortModel, periodsPaginationModel]);

  const samplingPeriodsDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.samplingSite.findSamplePeriods({ survey_id: surveyContext.surveyId }, pagination)
  );

  useEffect(() => {
    // Refresh active view data loader when switching to the view for the first time
    if (activeView === SamplingViews.SITES && !samplingSitesDataLoader.data) {
      samplingSitesDataLoader.refresh(sitesPagination);
    }

    if (activeView === SamplingViews.PERIODS && !samplingPeriodsDataLoader.data) {
      samplingPeriodsDataLoader.refresh(periodsPagination);
    }
    // Including data loaders in the dependency array causes infinite reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  useEffect(() => {
    if (activeView === SamplingViews.SITES && Number(samplingSitesDataLoader.data?.pagination.total) !== 0) {
      samplingSitesDataLoader.refresh(sitesPagination);
    }
    // Including data loaders in the dependency array causes infinite reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sitesPagination]);

  useEffect(() => {
    if (activeView === SamplingViews.PERIODS && Number(samplingPeriodsDataLoader.data?.pagination.total) !== 0) {
      samplingPeriodsDataLoader.refresh(periodsPagination);
    }
    // Including data loaders in the dependency array causes infinite reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodsPagination]);

  // Data
  const sampleSites = samplingSitesDataLoader.data?.sampleSites ?? [];
  const samplePeriods = samplingPeriodsDataLoader.data?.periods ?? [];

  // Handler for bulk delete operation
  const handleBulkDelete = async () => {
    try {
      await biohubApi.samplingSite.deleteSampleSites(
        surveyContext.projectId,
        surveyContext.surveyId,
        selectedSites.map((site) => Number(site)) // Convert GridRowId to number[]
      );
      dialogContext.setYesNoDialog({ open: false }); // Close confirmation dialog
      setSelectedSites([]); // Clear selection
      samplingSitesDataLoader.refresh(sitesPagination); // Refresh data
    } catch (error) {
      dialogContext.setYesNoDialog({ open: false }); // Close confirmation dialog on error
      setSelectedSites([]); // Clear selection
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

  const handleDelete = async (sampleSiteId: number) => {
    await biohubApi.samplingSite.deleteSampleSite(surveyContext.projectId, surveyContext.surveyId, sampleSiteId);
    samplingSitesDataLoader.refresh(sitesPagination); // Refresh data
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
          pl: 2,
          pr: 5.5,
          width: '100%'
        }}>
        {/* Toggle buttons for changing between sites, methods, and periods */}
        <CustomToggleButtonGroup
          views={views}
          activeView={activeView}
          onViewChange={(view) => setActiveView(view)}
          orientation="horizontal"
        />

        <IconButton
          edge="end"
          sx={{ ml: 1 }}
          aria-label="header-settings"
          disabled={activeView === SamplingViews.PERIODS}
          onClick={handleHeaderMenuClick}
          title="Bulk Actions">
          <Icon path={mdiDotsVertical} size={1} />
        </IconButton>
      </Toolbar>

      <Divider flexItem />

      {/* Data tables */}
      <Box height="400px">
        {activeView === SamplingViews.SITES && (
          <LoadingGuard
            isLoading={
              !samplingSitesDataLoader.data && (samplingSitesDataLoader.isLoading || !samplingSitesDataLoader.isReady)
            }
            isLoadingFallback={<SkeletonTable />}
            isLoadingFallbackDelay={100}
            hasNoData={!sampleSites.length}
            hasNoDataFallback={
              <NoDataOverlay
                height="100%"
                title="Add Sampling Sites"
                subtitle="Apply your techniques to sampling sites to show where you collected data"
                icon={mdiArrowTopRight}
              />
            }
            hasNoDataFallbackDelay={100}>
            <SamplingSiteTable
              sites={sampleSites}
              selectedRows={selectedSites}
              setSelectedRows={setSelectedSites}
              paginationModel={sitesPaginationModel}
              setPaginationModel={setSitesPaginationModel}
              sortModel={sitesSortModel}
              setSortModel={setSitesSortModel}
              pageSizeOptions={pageSizeOptions}
              rowCount={samplingSitesDataLoader.data?.pagination.total ?? 0}
              onDelete={handleDelete}
            />
          </LoadingGuard>
        )}

        {activeView === SamplingViews.PERIODS && (
          <LoadingGuard
            isLoading={
              !samplingPeriodsDataLoader.data &&
              (samplingPeriodsDataLoader.isLoading || !samplingPeriodsDataLoader.isReady)
            }
            isLoadingFallback={<SkeletonTable />}
            isLoadingFallbackDelay={100}
            hasNoData={!samplePeriods.length}
            hasNoDataFallback={
              <NoDataOverlay
                height="100%"
                title="Add Periods"
                subtitle="Add periods when you create sampling sites to show when you collected species observations"
                icon={mdiArrowTopRight}
              />
            }
            hasNoDataFallbackDelay={100}>
            <SamplingPeriodTable
              periods={samplePeriods}
              selectedRows={selectedPeriods}
              setSelectedRows={setSelectedPeriods}
              paginationModel={periodsPaginationModel}
              setPaginationModel={setPeriodsPaginationModel}
              sortModel={periodsSortModel}
              setSortModel={setPeriodsSortModel}
              pageSizeOptions={pageSizeOptions}
              rowCount={samplingPeriodsDataLoader.data?.pagination.total ?? 0}
            />
          </LoadingGuard>
        )}
      </Box>
    </>
  );
};
