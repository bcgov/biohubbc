import { mdiDotsVertical, mdiImport, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import { ListItemIcon } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import DataGridValidationAlert from 'components/data-grid/DataGridValidationAlert';
import FileUploadDialog from 'components/dialog/FileUploadDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { TelemetryTableI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TelemetryTableContext } from 'contexts/telemetryTableContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useContext, useState } from 'react';
import { pluralize as p } from 'utils/Utils';
import ManualTelemetryTable from './ManualTelemetryTable';

const ManualTelemetryComponent = () => {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [processingRecords, setProcessingRecords] = useState(false);
  const [showConfirmRemoveAllDialog, setShowConfirmRemoveAllDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const dialogContext = useContext(DialogContext);
  const telemetryTableContext = useContext(TelemetryTableContext);
  const surveyContext = useContext(SurveyContext);
  const telemetryApi = useTelemetryApi();
  const { hasUnsavedChanges, validationModel, _muiDataGridApiRef } = telemetryTableContext;

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const { projectId, surveyId } = surveyContext;
  const handleFileImport = async (file: File) => {
    telemetryApi.uploadCsvForImport(projectId, surveyId, file).then((response) => {
      setShowImportDialog(false);
      setProcessingRecords(true);
      telemetryApi
        .processTelemetryCsvSubmission(response.submission_id)
        .then(() => {
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
        })
        .catch(() => {
          setProcessingRecords(false);
        });
    });
  };

  const numSelectedRows = telemetryTableContext.rowSelectionModel.length;
  return (
    <>
      <FileUploadDialog
        open={showImportDialog}
        dialogTitle="Import Telemetry CSV"
        onClose={() => setShowImportDialog(false)}
        onUpload={handleFileImport}
        FileUploadProps={{
          dropZoneProps: { maxNumFiles: 1, acceptedFileExtensions: '.csv' },
          status: UploadFileStatus.STAGED
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
      <Box
        display="flex"
        flexDirection="column"
        flex="1 1 auto"
        height="100%"
        sx={{
          overflow: 'hidden',
          background: grey[100]
        }}>
        <Paper square elevation={0}>
          <Toolbar>
            <Typography
              sx={{
                flexGrow: '1',
                fontSize: '1.125rem',
                fontWeight: 700
              }}>
              Telemetry &zwnj;
              <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
                ({telemetryTableContext.recordCount})
              </Typography>
            </Typography>

            <Box display={'flex'} overflow={'hidden'} gap={1} whiteSpace={'nowrap'}>
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
              <Collapse in={hasUnsavedChanges} orientation="horizontal" sx={{ mr: -1 }}>
                <Box whiteSpace="nowrap" display="flex" sx={{ gap: 1, pr: 1 }}>
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
                </Box>
              </Collapse>
              <Box>
                <IconButton
                  onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    setAnchorEl(event.currentTarget);
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
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button'
                  }}>
                  <MenuItem
                    onClick={() => {
                      telemetryTableContext.deleteSelectedRecords();
                      handleCloseMenu();
                    }}
                    disabled={telemetryTableContext.isSaving}>
                    <ListItemIcon>
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </ListItemIcon>
                    <Typography variant="inherit">Delete {p(numSelectedRows, 'Telemetr', 'y', 'ies')}</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Toolbar>
        </Paper>
        <DataGridValidationAlert validationModel={validationModel} muiDataGridApiRef={_muiDataGridApiRef.current} />
        <Box
          display="flex"
          flexDirection="column"
          flex="1 1 auto"
          position="relative"
          sx={{
            background: grey[100]
          }}>
          <Box position="absolute" width="100%" height="100%" p={1}>
            <ManualTelemetryTable isLoading={processingRecords} />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ManualTelemetryComponent;
