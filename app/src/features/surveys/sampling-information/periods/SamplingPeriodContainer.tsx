import { mdiDotsVertical, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
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
import { DeletePeriodsBulkI18N } from 'constants/i18n';
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
 * Renders a list of periods.
 *
 * @return {*}
 */
export const SamplingPeriodContainer = () => {
  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();

  const biohubApi = useBiohubApi();

  // Periods
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

  // Multi-select row action menu
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [bulkActionMenuAnchorEl, setBulkActionMenuAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const periodsDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.samplingSite.findSamplePeriods({ survey_id: surveyContext.surveyId }, pagination)
  );

  useEffect(() => {
    periodsDataLoader.refresh(periodsPagination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyContext.projectId, surveyContext.surveyId]);

  const periodCount = periodsDataLoader.data?.pagination.total ?? 0;
  const periods = periodsDataLoader.data?.periods ?? [];

  const handleBulkDeletePeriods = async () => {
    await biohubApi.samplingSite
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
    await biohubApi.samplingSite.deleteSamplePeriods(surveyContext.projectId, surveyContext.surveyId, [periodId]);
    periodsDataLoader.refresh(periodsPagination);
  };

  const deleteBulkPeriodsDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: DeletePeriodsBulkI18N.deleteTitle,
      dialogText: DeletePeriodsBulkI18N.deleteText,
      yesButtonLabel: DeletePeriodsBulkI18N.yesButtonLabel,
      noButtonLabel: DeletePeriodsBulkI18N.noButtonLabel,
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
            to={'sampling/periods/create'}
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

      <Divider flexItem></Divider>

      <LoadingGuard
        isLoading={!periodsDataLoader.data && (periodsDataLoader.isLoading || !periodsDataLoader.isReady)}
        isLoadingFallback={<SkeletonTable />}
        isLoadingFallbackDelay={100}>
        <Box height="400px">
          <SamplingPeriodTable
            periods={periods}
            paginationModel={periodsPaginationModel}
            setPaginationModel={setPeriodsPaginationModel}
            sortModel={periodsSortModel}
            setSortModel={setPeriodsSortModel}
            rowCount={periodsDataLoader.data?.pagination.total ?? 0}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            onDelete={handleDelete}
          />
        </Box>
      </LoadingGuard>
    </Stack>
  );
};
