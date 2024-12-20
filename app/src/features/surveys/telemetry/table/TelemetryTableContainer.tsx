import { mdiCogOutline, mdiDotsVertical, mdiImport, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import axios, { AxiosProgressEvent } from 'axios';
import { CSVErrorsTableContainer } from 'components/csv/CSVErrorsTableContainer';
import DataGridValidationAlert from 'components/data-grid/DataGridValidationAlert';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { FileUploadSingleItem } from 'components/file-upload/FileUploadSingleItem';
import { TelemetryTableI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TelemetryDeviceKeysButton } from 'features/surveys/telemetry/manage/device-keys/TelemetryDeviceKeysButton';
import { TelemetryTable } from 'features/surveys/telemetry/table/TelemetryTable';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useTelemetryTableContext } from 'hooks/useContext';
import { useContext, useDeferredValue, useState } from 'react';
import { CSVError, isCSVValidationError } from 'utils/csv-utils';
import { getAxiosProgress } from 'utils/Utils';

export const TelemetryTableContainer = () => {
  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);
  const telemetryTableContext = useTelemetryTableContext();
  const surveyContext = useContext(SurveyContext);

  const [processingRecords, setProcessingRecords] = useState(false);
  const [showConfirmRemoveAllDialog, setShowConfirmRemoveAllDialog] = useState(false);
  const [contextMenuAnchorEl, setContextMenuAnchorEl] = useState<Element | null>(null);
  const [columnVisibilityMenuAnchorEl, setColumnVisibilityMenuAnchorEl] = useState<Element | null>(null);

  // Telemetry import dialog state
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importCSVErrors, setImportCSVErrors] = useState<CSVError[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadFileStatus>(UploadFileStatus.STAGED);
  const [progress, setProgress] = useState<number>(0);

  const isUploading = uploadStatus === UploadFileStatus.UPLOADING || uploadStatus === UploadFileStatus.FINISHING_UPLOAD;
  const disableImportButton = isUploading || !file || uploadStatus === UploadFileStatus.FAILED;
  const cancelToken = axios.CancelToken.source();

  const deferredUnsavedChanges = useDeferredValue(telemetryTableContext.hasUnsavedChanges);

  const numSelectedRows = telemetryTableContext.rowSelectionModel.length;

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const handleCloseContextMenu = () => {
    setContextMenuAnchorEl(null);
  };

  const handleCloseColumnVisibilityMenu = () => {
    setColumnVisibilityMenuAnchorEl(null);
  };

  const handleResetFileImport = () => {
    setFile(null);
    setImportCSVErrors([]);
    setUploadStatus(UploadFileStatus.STAGED);
    setProgress(0);
  };

  /**
   * Handle the close of the import dialog.
   *
   * @returns {*} {void}
   */
  const handleCloseImportDialog = () => {
    setShowImportDialog(false);
    handleResetFileImport();
  };

  /**
   * Handle the import of telemetry data.
   *
   * Note: This will render a table in the dialog if CSVErrors are present
   * @param {File} file
   * @returns {*} {void}
   */
  const handleImportTelemetry = async (file: File) => {
    try {
      setUploadStatus(UploadFileStatus.UPLOADING);

      await biohubApi.telemetry.importManualTelemetryCSV(
        surveyContext.projectId,
        surveyContext.surveyId,
        file,
        cancelToken,
        async (progressEvent: AxiosProgressEvent) => {
          setProgress(getAxiosProgress(progressEvent));
          if (progressEvent.loaded === progressEvent.total) {
            setUploadStatus(UploadFileStatus.FINISHING_UPLOAD);
          }
        }
      );

      setShowImportDialog(false);

      setProcessingRecords(true);

      showSnackBar({
        snackbarMessage: (
          <Typography variant="body2" component="div">
            Telemetry imported successfully.
          </Typography>
        )
      });

      telemetryTableContext.refreshRecords().then(() => {
        setProcessingRecords(false);
      });
      setUploadStatus(UploadFileStatus.COMPLETE);
    } catch (error) {
      setUploadStatus(UploadFileStatus.FAILED);

      if (isCSVValidationError(error)) {
        setImportCSVErrors(error.errors);
        return;
      }

      const apiError = error as APIError;

      dialogContext.setErrorDialog({
        dialogTitle: TelemetryTableI18N.importRecordsErrorDialogTitle,
        dialogText: TelemetryTableI18N.importRecordsErrorDialogText,
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors,
        open: true,
        onClose: () => {
          setProcessingRecords(false);
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          setProcessingRecords(false);
          dialogContext.setErrorDialog({ open: false });
        }
      });
    }
  };

  return (
    <>
      <YesNoDialog
        dialogTitle={'Import Telemetry'}
        dialogText={''}
        open={showImportDialog}
        yesButtonLabel={'Import'}
        noButtonLabel={'Cancel'}
        onClose={handleCloseImportDialog}
        onNo={handleCloseImportDialog}
        onYes={() => {
          if (file) {
            handleImportTelemetry(file);
          }
        }}
        dialogContent={
          <>
            <FileUploadSingleItem
              file={file}
              status={uploadStatus}
              progress={progress}
              onFile={(file) => setFile(file)}
              onCancel={handleResetFileImport}
            />
            {importCSVErrors.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <CSVErrorsTableContainer errors={importCSVErrors} />
              </Box>
            ) : null}
          </>
        }
        yesButtonProps={{
          loading: isUploading,
          disabled: disableImportButton
        }}
      />

      <YesNoDialog
        dialogTitle={TelemetryTableI18N.removeAllDialogTitle}
        dialogText={TelemetryTableI18N.removeAllDialogText}
        yesButtonProps={{ color: 'error' }}
        yesButtonLabel={'Discard Changes'}
        noButtonProps={{ color: 'primary', variant: 'outlined' }}
        noButtonLabel={'Cancel'}
        open={showConfirmRemoveAllDialog}
        onYes={() => {
          setShowConfirmRemoveAllDialog(false);
          telemetryTableContext.revertRecords();
        }}
        onClose={() => setShowConfirmRemoveAllDialog(false)}
        onNo={() => setShowConfirmRemoveAllDialog(false)}
      />
      <Paper component={Stack} flexDirection="column" flex="1 1 auto" height="100%">
        <Toolbar
          disableGutters
          sx={{
            flex: '0 0 auto',
            pr: 3,
            pl: 2
          }}>
          <Typography variant="h3" component="h2" flexGrow={1}>
            Telemetry &zwnj;
            <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
              ({telemetryTableContext.recordCount})
            </Typography>
          </Typography>

          <Stack flexDirection="row" alignItems="center" gap={1} overflow="hidden" whiteSpace="nowrap">
            <TelemetryDeviceKeysButton />
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon path={mdiImport} size={1} />}
              onClick={() => setShowImportDialog(true)}>
              Import
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon path={mdiPlus} size={1} />}
              onClick={() => telemetryTableContext.addRecord()}
              disabled={telemetryTableContext.isSaving}>
              Add Record
            </Button>
            <Collapse in={deferredUnsavedChanges} orientation="horizontal">
              <Stack flexDirection="row" whiteSpace="nowrap" gap={1}>
                <LoadingButton
                  loading={telemetryTableContext.isSaving}
                  variant="contained"
                  color="primary"
                  onClick={() => telemetryTableContext.saveRecords()}
                  disabled={telemetryTableContext.isSaving}>
                  Save
                </LoadingButton>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowConfirmRemoveAllDialog(true)}
                  disabled={telemetryTableContext.isSaving}>
                  Discard Changes
                </Button>
              </Stack>
            </Collapse>
            <IconButton
              onClick={(event) => setColumnVisibilityMenuAnchorEl(event.currentTarget)}
              disabled={telemetryTableContext.isSaving}>
              <Icon path={mdiCogOutline} size={1} />
            </IconButton>
            <Menu
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              id="survey-observations-table-actions-menu"
              anchorEl={columnVisibilityMenuAnchorEl}
              open={Boolean(columnVisibilityMenuAnchorEl)}
              onClose={handleCloseColumnVisibilityMenu}
              MenuListProps={{
                'aria-labelledby': 'basic-button'
              }}>
              <MenuItem dense onClick={() => telemetryTableContext.toggleColumnsVisibility()}>
                <ListItemIcon>
                  <Checkbox
                    sx={{ ml: -1 }}
                    indeterminate={
                      telemetryTableContext.hiddenColumns.length > 0 &&
                      telemetryTableContext.hiddenColumns.length <
                        telemetryTableContext.getColumns({ hideable: true }).length
                    }
                    checked={telemetryTableContext.hiddenColumns.length === 0}
                  />
                </ListItemIcon>
                <ListItemText sx={{ textTransform: 'uppercase' }}>Show/Hide All</ListItemText>
              </MenuItem>
              <Divider />
              <Box
                sx={{
                  xs: { maxHeight: '300px' },
                  lg: { maxHeight: '400px' }
                }}>
                {telemetryTableContext.getColumns({ hideable: true }).map((column) => {
                  return (
                    <MenuItem
                      dense
                      key={column.field}
                      onClick={() => telemetryTableContext.toggleColumnsVisibility({ columns: [column.field] })}>
                      <ListItemIcon>
                        <Checkbox
                          sx={{ ml: -1 }}
                          checked={!telemetryTableContext.hiddenColumns.includes(column.field)}
                        />
                      </ListItemIcon>
                      <ListItemText>{column.headerName}</ListItemText>
                    </MenuItem>
                  );
                })}
              </Box>
            </Menu>
            <Box>
              <IconButton
                onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                  setContextMenuAnchorEl(event.currentTarget);
                }}
                size="small"
                disabled={numSelectedRows === 0}
                aria-label="telemetry options">
                <Icon size={1} path={mdiDotsVertical} />
              </IconButton>
              <Menu
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                id="manual-telemetry-table-actions-menu"
                anchorEl={contextMenuAnchorEl}
                open={Boolean(contextMenuAnchorEl)}
                onClose={handleCloseContextMenu}
                MenuListProps={{
                  'aria-labelledby': 'basic-button'
                }}>
                <MenuItem
                  onClick={() => {
                    telemetryTableContext.deleteSelectedRecords();
                    handleCloseContextMenu();
                  }}
                  disabled={telemetryTableContext.isSaving}>
                  <ListItemIcon>
                    <Icon path={mdiTrashCanOutline} size={1} />
                  </ListItemIcon>
                  <Typography variant="inherit">Delete Telemetry</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Stack>
        </Toolbar>

        <Divider flexItem></Divider>

        <DataGridValidationAlert
          validationModel={telemetryTableContext.validationModel}
          muiDataGridApiRef={telemetryTableContext._muiDataGridApiRef.current}
        />

        <Box display="flex" flexDirection="column" flex="1 1 auto" position="relative">
          <Box position="absolute" width="100%" height="100%">
            <TelemetryTable isLoading={processingRecords} />
          </Box>
        </Box>
      </Paper>
    </>
  );
};
