import { mdiArrowTopRight, mdiDotsVertical, mdiImport, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
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
import { GridRowSelectionModel } from '@mui/x-data-grid';
import axios, { AxiosProgressEvent } from 'axios';
import { CSVSingleImportDialog } from 'components/csv/CSVSingleImportDialog';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { FOREIGN_KEY_CONSTRAINT_ERROR } from 'constants/errors';
import { DevicesTable } from 'features/surveys/telemetry/manage/devices/table/DevicesTable';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getDeviceCSVTemplate } from 'utils/csv-templates';
import { downloadFile } from 'utils/file-utils';
import { TelemetryDeviceKeysButton } from '../../device-keys/TelemetryDeviceKeysButton';

export const DevicesContainer = () => {
  const dialogContext = useDialogContext();
  const surveyContext = useSurveyContext();
  const cancelToken = axios.CancelToken.source();
  const [processingRecords, setProcessingRecords] = useState(false);
  const biohubApi = useBiohubApi();

  // State for bulk actions
  const [headerAnchorEl, setHeaderAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);

  const devicesDataLoader = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.telemetryDevice.getDevicesInSurvey(projectId, surveyId)
  );

  useEffect(() => {
    devicesDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
  }, [devicesDataLoader, surveyContext.projectId, surveyContext.surveyId]);

  const devices = devicesDataLoader.data?.devices ?? [];
  const devicesCount = devicesDataLoader.data?.count ?? 0;

  // Handler for bulk delete operation
  const handleBulkDelete = async () => {
    try {
      await biohubApi.telemetryDevice.deleteDevices(
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
              <strong>Error Deleting Devices</strong>
            </Typography>
            {String(error).includes(FOREIGN_KEY_CONSTRAINT_ERROR) ? (
              <Typography variant="body2" component="div">
                You must delete the deployments involving these devices before deleting the devices.
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
      dialogTitle: 'Delete Devices?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Are you sure you want to delete the selected devices?
        </Typography>
      ),
      yesButtonLabel: 'Delete Devices',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'error' },
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      onNo: () => dialogContext.setYesNoDialog({ open: false }),
      open: true,
      onYes: handleBulkDelete
    });
  };

  const onDelete = () => {
    devicesDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
  };

  const [showImportDialog, setShowImportDialog] = useState(false);

  // Handle import for devices in bulk
  const handleImportDeviceCSV = async (file: File, onProgress: (progressEvent: AxiosProgressEvent) => void) => {
    try {
      await biohubApi.telemetryDevice.importTelemetryDeviceCSV(
        surveyContext.projectId,
        surveyContext.surveyId,
        file,
        cancelToken,
        onProgress
      );

      setProcessingRecords(true);

      // Refresh the device data after a successful import
      devicesDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    } finally {
      setProcessingRecords(false);
    }
  };

  return (
    <>
      {/* Bulk action menu */}
      <CSVSingleImportDialog
        open={showImportDialog}
        dialogTitle="Import Devices"
        dialogSummary="Import devices by uploading a CSV file matching the template. Duplicate records are flagged."
        onClose={() => setShowImportDialog(false)}
        onImport={handleImportDeviceCSV}
        onDownloadTemplate={() =>
          downloadFile(getDeviceCSVTemplate(), `SIMS-devices-template-${new Date().getFullYear()}.csv`)
        }
      />
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

      <Toolbar sx={{ flex: '0 0 auto', pr: 3 }}>
        <Typography variant="h3" component="h2" flexGrow={1}>
          Devices &zwnj;
          <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
            ({devicesCount})
          </Typography>
        </Typography>
        <Stack flexDirection="row" alignItems="center" gap={1} overflow="hidden" whiteSpace="nowrap">
          <TelemetryDeviceKeysButton />
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/telemetry/manage/device/create`}
            startIcon={<Icon path={mdiPlus} size={0.8} />}>
            Add
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiImport} size={1} />}
            onClick={() => setShowImportDialog(true)}>
            Import
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
          isLoading={devicesDataLoader.isLoading}
          isLoadingFallback={<SkeletonTable numberOfLines={5} />}
          isLoadingFallbackDelay={100}>
          <Box>
            <LoadingGuard
              isLoading={devicesDataLoader.isLoading || !devicesDataLoader.isReady}
              isLoadingFallback={<SkeletonTable />}
              isLoadingFallbackDelay={100}
              hasNoData={!devicesCount}
              hasNoDataFallback={
                <NoDataOverlay
                  height="200px"
                  title="Add Telemetry Devices"
                  subtitle="Add your telemetry devices, so they can be used in a deployment."
                  icon={mdiArrowTopRight}
                />
              }
              hasNoDataFallbackDelay={100}>
              <DevicesTable
                devices={devices}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                onDelete={onDelete}
                isLoading={processingRecords}
              />
            </LoadingGuard>
          </Box>
        </LoadingGuard>
      </Box>
    </>
  );
};
