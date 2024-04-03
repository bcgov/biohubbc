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
import DataGridValidationAlert from 'components/data-grid/DataGridValidationAlert';
import FileUploadDialog from 'components/dialog/FileUploadDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { TelemetryTableI18N } from 'constants/i18n';
import { getSurveySessionStorageKey, SIMS_TELEMETRY_HIDDEN_COLUMNS } from 'constants/session-storage';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useTelemetryTableContext } from 'hooks/useContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { pluralize as p } from 'utils/Utils';
import ManualTelemetryTable from './ManualTelemetryTable';

const ManualTelemetryTableContainer = () => {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [processingRecords, setProcessingRecords] = useState(false);
  const [showConfirmRemoveAllDialog, setShowConfirmRemoveAllDialog] = useState(false);
  const [contextMenuAnchorEl, setContextMenuAnchorEl] = useState<Element | null>(null);
  const [columnVisibilityMenuAnchorEl, setColumnVisibilityMenuAnchorEl] = useState<Element | null>(null);
  const [hiddenFields, setHiddenFields] = useState<string[]>([]);

  const dialogContext = useContext(DialogContext);
  const telemetryTableContext = useTelemetryTableContext();
  const surveyContext = useContext(SurveyContext);
  const telemetryApi = useTelemetryApi();

  const { hasUnsavedChanges, validationModel, _muiDataGridApiRef } = telemetryTableContext;

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const handleCloseContextMenu = () => {
    setContextMenuAnchorEl(null);
  };

  const handleCloseColumnVisibilityMenu = () => {
    setColumnVisibilityMenuAnchorEl(null);
  };

  /**
   * Toggles visibility for a particular column
   */
  const toggleColumnVisibility = (field: string) => {
    setHiddenFields((prev) => {
      if (prev.includes(field)) {
        return prev.filter((hiddenField) => hiddenField !== field);
      } else {
        return [...prev, field];
      }
    });
  };

  // The array of columns that may be toggled as hidden or visible
  const hideableColumns = useMemo(() => {
    return telemetryTableContext.getColumns().filter((column) => {
      return column && column.type && !['actions', 'checkboxSelection'].includes(column.type) && column.hideable;
    });
  }, [telemetryTableContext.getColumns]);

  /**
   * Toggles whether all columns are hidden or visible.
   */
  const toggleShowHideAll = useCallback(() => {
    if (hiddenFields.length > 0) {
      setHiddenFields([]);
    } else {
      setHiddenFields(hideableColumns.map((column) => column.field));
    }
  }, [hiddenFields]);

  /**
   * Whenever hidden fields updates, trigger an update in visiblity for the table.
   */
  useEffect(() => {
    _muiDataGridApiRef.current.setColumnVisibilityModel({
      ...Object.fromEntries(hideableColumns.map((column) => [column.field, true])),
      ...Object.fromEntries(hiddenFields.map((field) => [field, false]))
    });
  }, [hideableColumns, hiddenFields]);

  /**
   * On first mount, load visibility state from session storage, if it exists.
   */
  useEffect(() => {
    const fieldsJson: string | null = sessionStorage.getItem(
      getSurveySessionStorageKey(surveyId, SIMS_TELEMETRY_HIDDEN_COLUMNS)
    );

    if (!fieldsJson) {
      return;
    }

    try {
      const fields: string[] = JSON.parse(fieldsJson);
      setHiddenFields(fields);
    } catch {
      return;
    }
  }, []);

  /**
   * Persist visibility state in session
   */
  useEffect(() => {
    sessionStorage.setItem(
      getSurveySessionStorageKey(surveyId, SIMS_TELEMETRY_HIDDEN_COLUMNS),
      JSON.stringify(hiddenFields)
    );
  }, [hiddenFields]);

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
        .catch((error) => {
          showSnackBar({
            snackbarMessage: (
              <Typography variant="body2" component="div">
                {error.message}
              </Typography>
            )
          });
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
            <Collapse in={hasUnsavedChanges} orientation="horizontal">
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
            {hideableColumns.length > 0 && (
              <>
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
                  <MenuItem dense onClick={() => toggleShowHideAll()}>
                    <ListItemIcon>
                      <Checkbox
                        sx={{ ml: -1 }}
                        indeterminate={hiddenFields.length > 0 && hiddenFields.length < hideableColumns.length}
                        checked={hiddenFields.length === 0}
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
                    {hideableColumns.map((column) => {
                      return (
                        <MenuItem dense key={column.field} onClick={() => toggleColumnVisibility(column.field)}>
                          <ListItemIcon>
                            <Checkbox sx={{ ml: -1 }} checked={!hiddenFields.includes(column.field)} />
                          </ListItemIcon>
                          <ListItemText>{column.headerName}</ListItemText>
                        </MenuItem>
                      );
                    })}
                  </Box>
                </Menu>
              </>
            )}
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
                  <Typography variant="inherit">Delete {p(numSelectedRows, 'Telemetr', 'y', 'ies')}</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Stack>
        </Toolbar>

        <Divider flexItem></Divider>

        <DataGridValidationAlert validationModel={validationModel} muiDataGridApiRef={_muiDataGridApiRef.current} />

        <Box display="flex" flexDirection="column" flex="1 1 auto" position="relative">
          <Box position="absolute" width="100%" height="100%">
            <ManualTelemetryTable isLoading={processingRecords} />
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default ManualTelemetryTableContainer;
