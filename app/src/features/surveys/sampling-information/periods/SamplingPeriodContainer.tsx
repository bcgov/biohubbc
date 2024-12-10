import { mdiArrowTopRight, mdiDotsVertical, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { SamplePeriodI18N } from 'constants/i18n';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import { ISamplingSitePeriodRowData, SamplingPeriodTable } from './table/SamplingPeriodTable';

const pageSizeOptions = [10, 25, 50];

/**
 * Renders a table of periods in the Survey.
 *
 * @return {*}
 */
export const SamplingPeriodContainer = () => {
  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();

  const biohubApi = useBiohubApi();

  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [bulkActionMenuAnchorEl, setBulkActionMenuAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const periodsDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.period.findSamplePeriods({ survey_id: surveyContext.surveyId }, pagination)
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

  const handleBulkDeletePeriods = async () => {
    await biohubApi.period
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

  const handleDelete = async (periodId: number) => {
    await biohubApi.period.deleteSamplePeriods(surveyContext.projectId, surveyContext.surveyId, [periodId]);
    periodsDataLoader.refresh(periodsPagination);
  };

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

  useEffect(() => {
    periodsDataLoader.refresh(periodsPagination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodsPagination]);

  const periodCount = periodsDataLoader.data?.pagination.total ?? 0;

  const rows: ISamplingSitePeriodRowData[] = useMemo(() => {
    const periods = periodsDataLoader.data?.periods ?? []; // Extract periods directly within the memo

    const data: ISamplingSitePeriodRowData[] = [];
    for (const period of periods) {
      data.push({
        survey_sample_period_id: period.survey_sample_period_id,
        sample_site: period.sample_site.name,
        sample_method: period.method_technique.name,
        method_response_metric_id: period.sample_method.method_response_metric_id,
        start_date: period.start_date,
        end_date: period.end_date,
        start_time: period.start_time,
        end_time: period.end_time
      });
    }

    return data;
  }, [periodsDataLoader.data]);

  return (
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
            ({periodCount})
          </Typography>
        </Typography>
        <Stack gap={1} direction="row">
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.TECHNIQUES} />
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to={'sampling/period/create'}
            startIcon={<Icon path={mdiPlus} size={0.8} />}>
            Add
          </Button>
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
          hasNoData={!rows.length}
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
            periods={rows}
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
  );
};
