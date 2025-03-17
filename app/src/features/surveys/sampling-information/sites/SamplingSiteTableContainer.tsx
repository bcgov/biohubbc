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
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridPaginationModel, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonMap, SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { useSamplingSiteStaticLayer } from 'features/surveys/view/survey-spatial/components/map/useSamplingSiteStaticLayer';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import { SamplingSiteTable } from './table/tabs/sites/SamplingSiteTable';

const pageSizeOptions = [10, 25, 50];

/**
 * Component for managing sampling sites, methods, and periods.
 * Returns a map and data grids displaying sampling information.
 *
 * @returns {*}
 */
export const SamplingSiteContainer = () => {
  const biohubApi = useBiohubApi();
  const samplingSiteStaticLayer = useSamplingSiteStaticLayer();

  const dialogContext = useDialogContext();
  const surveyContext = useSurveyContext();

  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [headerAnchorEl, setHeaderAnchorEl] = useState<null | HTMLElement>(null);

  const techniquesDataLoader = useDataLoader(() =>
    biohubApi.technique.getTechniquesForSurvey(surveyContext.projectId, surveyContext.surveyId)
  );

  useEffect(() => {
    techniquesDataLoader.load();
  }, [techniquesDataLoader]);

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

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([]);

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

  const samplingSitesDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.samplingSite.getSampleSites(surveyContext.projectId, surveyContext.surveyId, { pagination })
  );

  useEffect(() => {
    samplingSitesDataLoader.refresh(pagination);

    // Adding a DataLoader as a dependency causes an infinite rerender loop if a useEffect calls `.refresh`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination]);

  const sampleSites = useMemo(() => samplingSitesDataLoader.data?.sampleSites ?? [], [samplingSitesDataLoader.data]);

  const handleDelete = async (sampleSiteId: number) => {
    await biohubApi.samplingSite.deleteSampleSite(surveyContext.projectId, surveyContext.surveyId, sampleSiteId);
    samplingSitesDataLoader.refresh(pagination); // Refresh data
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
        <Typography variant="h3" component="h2" flexGrow={1}>
          Sampling Sites &zwnj;
          <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
            ({samplingSitesDataLoader.data?.pagination.total ?? 0})
          </Typography>
        </Typography>
        <Stack gap={1} direction="row">
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.SAMPLING_SITES} />
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling/create`}
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
        </Stack>
      </Toolbar>

      <Divider flexItem />

      <Box>
        <LoadingGuard
          isLoading={false}
          isLoadingFallback={
            <Box height="300px">
              <SkeletonMap />
              <SkeletonTable numberOfLines={5} />
            </Box>
          }
          isLoadingFallbackDelay={100}>
          <Box height="400px" flex="1 1 auto">
            <SurveyMap staticLayers={[samplingSiteStaticLayer]} isLoading={false} />
          </Box>
        </LoadingGuard>
      </Box>

      {/* Data tables */}
      <Box height="400px">
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
      </Box>
    </>
  );
};
