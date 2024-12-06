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
import { SurveyBlocksTable } from './SurveyBlocksTable';

const pageSizeOptions = [10, 25, 50];

export interface IBlockPeriodRowData {
  id: number;
  block_name: string;
  sample_method: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
}

export const SurveyBlocksTableContainer = () => {
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

  const blocksDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.block.getSurveyBlocks(surveyContext.projectId, surveyContext.surveyId, { pagination })
  );

  const pagination: ApiPaginationRequestOptions = useMemo(() => {
    const sort = firstOrNull(sortModel);

    return {
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,
      page: paginationModel.page + 1 // Adjust for API pagination starting at 1
    };
  }, [sortModel, paginationModel]);

  useEffect(() => {
    blocksDataLoader.refresh(pagination);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination]);

  const blocks = useMemo(() => blocksDataLoader.data?.blocks ?? [], [blocksDataLoader.data]);

  const handleBulkDelete = async () => {
    try {
      await biohubApi.block.deleteBlocks(
        surveyContext.projectId,
        surveyContext.surveyId,
        selectedRows.map((block) => Number(block)) // Convert GridRowId to number[]
      );
      dialogContext.setYesNoDialog({ open: false });
      setSelectedRows([]);
      blocksDataLoader.refresh(pagination);
    } catch (error) {
      dialogContext.setYesNoDialog({ open: false });
      setSelectedRows([]);
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

  const handleDelete = async (blockId: number) => {
    await biohubApi.block.deleteBlocks(surveyContext.projectId, surveyContext.surveyId, [blockId]);
    blocksDataLoader.refresh(pagination);
  };

  const handlePromptConfirmBulkDelete = () => {
    setHeaderAnchorEl(null);
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Blocks?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Are you sure you want to delete the selected blocks?
        </Typography>
      ),
      yesButtonLabel: 'Delete Blocks',
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
        isLoading={!blocksDataLoader.data && (blocksDataLoader.isLoading || !blocksDataLoader.isReady)}
        isLoadingFallback={<SkeletonTable />}
        isLoadingFallbackDelay={100}
        hasNoData={!blocks.length}
        hasNoDataFallback={
          <NoDataOverlay
            height="100%"
            title="Add Clusters"
            subtitle="Clusters let you group related sampling sites"
            icon={mdiArrowTopRight}
          />
        }
        hasNoDataFallbackDelay={100}>
        <SurveyBlocksTable
          blocks={blocks}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          sortModel={sortModel}
          setSortModel={setSortModel}
          rowCount={blocksDataLoader.data?.pagination.total ?? 0}
          pageSizeOptions={pageSizeOptions}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          onDelete={handleDelete}
        />
      </LoadingGuard>
    </>
  );
};
