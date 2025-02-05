import { mdiArrowTopRight, mdiDotsVertical, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridPaginationModel, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { DualImportButton } from 'components/buttons/DualImportButton';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { FileUploadSingleItemDialog } from 'components/dialog/attachments/FileUploadSingleItemDialog';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { CreateSamplingSiteI18N, SamplePeriodI18N } from 'constants/i18n';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import { SamplingPeriodTable } from './table/SamplingPeriodTable';

const pageSizeOptions = [10, 25, 50];

/**
 * Wrapping component for a table of survey sampling periods, for the Manage Sampling Information page.
 *
 * @return {*}
 */
export const SamplingPeriodContainer = () => {
  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();

  const biohubApi = useBiohubApi();

  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [bulkActionMenuAnchorEl, setBulkActionMenuAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [openBulkImportDialog, setOpenBulkImportDialog] = useState(false);

  const periodsDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.samplingPeriod.findSamplePeriods({ survey_id: surveyContext.surveyId }, pagination)
  );

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

  /**
   * Handle the bulk delete periods API call.
   *
   */
  const handleBulkDeletePeriods = async () => {
    await biohubApi.samplingPeriod
      .deleteSamplePeriods(surveyContext.projectId, surveyContext.surveyId, selectedRows.map(Number))
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setSelectedRows([]);
        setBulkActionMenuAnchorEl(null);
        periodsDataLoader.refresh(periodsPagination);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setSelectedRows([]);
        setBulkActionMenuAnchorEl(null);
        dialogContext.setSnackbar({
          snackbarMessage: (
            <>
              <Typography variant="body2" component="div">
                <strong>Error Deleting Sampling Sites</strong>
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
   * Handle the delete single period API call.
   *
   * @param {number} periodId
   */
  const handleDelete = async (periodId: number) => {
    await biohubApi.samplingPeriod.deleteSamplePeriods(surveyContext.projectId, surveyContext.surveyId, [periodId]);
    periodsDataLoader.refresh(periodsPagination);
  };

  /**
   * Open the delete bulk periods dialog.
   *
   */
  const deleteBulkPeriodsDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: SamplePeriodI18N.bulkDeleteSamplePeriodTitle,
      dialogText: SamplePeriodI18N.bulkDeleteSamplePeriodText,
      yesButtonLabel: 'Yes',
      noButtonLabel: 'No',
      yesButtonProps: { color: 'error' },
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      open: true,
      onYes: () => {
        handleBulkDeletePeriods();
      }
    });
  };

  const handleBulkImportSamplePeriods = async (file: File) => {
    try {
      await biohubApi.survey.importCrittersFromCsv(file, surveyContext.projectId, surveyContext.surveyId);
      surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    } catch (error) {
      const apiError = error as APIError;

      dialogContext.setErrorDialog({
        dialogTitle: CreateSamplingSiteI18N.createErrorTitle,
        dialogText: CreateSamplingSiteI18N.createErrorText,
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors,
        open: true,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        }
      });
    } finally {
      setOpenBulkImportDialog(false);
    }
  };

  useEffect(() => {
    periodsDataLoader.refresh(periodsPagination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodsPagination]);

  // Data
  const periods = periodsDataLoader.data?.periods ?? [];
  const periodsCount = periodsDataLoader.data?.pagination.total ?? 0;

  return (
    <>
      <FileUploadSingleItemDialog
        open={openBulkImportDialog}
        dialogTitle="Import Sample Periods"
        onClose={() => setOpenBulkImportDialog(false)}
        onUpload={handleBulkImportSamplePeriods}
        uploadButtonLabel="Import"
        dropZoneProps={{ acceptedFileExtensions: '.csv' }}
      />
      <Stack
        flexDirection="column"
        height="100%"
        sx={{
          overflow: 'hidden'
        }}>
        <Menu
          open={Boolean(bulkActionMenuAnchorEl)}
          onClose={() => setBulkActionMenuAnchorEl(null)}
          anchorEl={bulkActionMenuAnchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}>
          <MenuItem onClick={deleteBulkPeriodsDialog}>
            <ListItemIcon>
              <Icon path={mdiTrashCanOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        <Toolbar
          disableGutters
          sx={{
            flex: '0 0 auto',
            pr: 3,
            pl: 3
          }}>
          <Typography variant="h3" component="h2" flexGrow={1}>
            Sampling Periods &zwnj;
            <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
              ({periodsCount})
            </Typography>
          </Typography>
          <Stack gap={1} direction="row">
            <HelpButtonDialog markdownType={MarkdownTypeNameEnum.SAMPLING_PERIODS} />
            <DualImportButton
              singleImportButtonProps={{
                component: RouterLink,
                to: 'sampling/period/create'
              }}
              bulkImportButtonProps={{
                onClick: () => setOpenBulkImportDialog(true)
              }}
            />
            <IconButton
              edge="end"
              sx={{
                ml: 1
              }}
              aria-label="header-settings"
              disabled={!selectedRows.length}
              onClick={(event) => setBulkActionMenuAnchorEl(event.currentTarget)}
              title="Bulk Actions">
              <Icon path={mdiDotsVertical} size={1} />
            </IconButton>
          </Stack>
        </Toolbar>

        <Divider flexItem />

        <Box height="400px">
          <LoadingGuard
            isLoading={!periodsDataLoader.data && (periodsDataLoader.isLoading || !periodsDataLoader.isReady)}
            isLoadingFallback={<SkeletonTable />}
            isLoadingFallbackDelay={100}
            hasNoData={!periodsCount}
            hasNoDataFallback={
              <NoDataOverlay
                height="100%"
                width="100%"
                title="Add Periods"
                subtitle="Add periods to indicate when you did a technique at a site"
                icon={mdiArrowTopRight}
              />
            }>
            <SamplingPeriodTable
              periods={periods}
              paginationModel={periodsPaginationModel}
              setPaginationModel={setPeriodsPaginationModel}
              sortModel={periodsSortModel}
              setSortModel={setPeriodsSortModel}
              rowCount={periodsDataLoader.data?.pagination.total ?? 0}
              pageSizeOptions={pageSizeOptions}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              onDelete={handleDelete}
            />
          </LoadingGuard>
        </Box>
      </Stack>
    </>
  );
};
