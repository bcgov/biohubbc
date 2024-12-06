import { mdiArrowTopRight, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
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
import { SamplingSiteTable } from '../../SamplingSiteTable';

const pageSizeOptions = [10, 25, 50];

export interface ISamplingSitePeriodRowData {
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
  const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();

  const [headerAnchorEl, setHeaderAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const samplingSitesDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.samplingSite.getSampleSites(surveyContext.projectId, surveyContext.surveyId, { pagination })
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

  const sampleSites = useMemo(() => samplingSitesDataLoader.data?.sampleSites ?? [], [samplingSitesDataLoader.data]);

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
      samplingSitesDataLoader.refresh(pagination); // Refresh data
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

  const handleDelete = async (sampleSiteId: number) => {
    await biohubApi.samplingSite.deleteSampleSite(surveyContext.projectId, surveyContext.surveyId, sampleSiteId);
    samplingSitesDataLoader.refresh(pagination); // Refresh data
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
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          sortModel={sortModel}
          setSortModel={setSortModel}
          rowCount={samplingSitesDataLoader.data?.pagination.total ?? 0}
          pageSizeOptions={pageSizeOptions}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          onDelete={handleDelete}
        />
      </LoadingGuard>
    </>
  );
};
