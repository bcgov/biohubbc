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
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useTelemetryTableContext } from 'hooks/useContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useContext, useState } from 'react';
import { pluralize as p } from 'utils/Utils';
import ManualTelemetryTable from './ManualTelemetryTable';

const ManualTelemetryTableContainer = () => {
  // Api
  const telemetryApi = useTelemetryApi();

  // State
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [processingRecords, setProcessingRecords] = useState(false);
  const [showConfirmRemoveAllDialog, setShowConfirmRemoveAllDialog] = useState(false);
  const [contextMenuAnchorEl, setContextMenuAnchorEl] = useState<Element | null>(null);
  const [columnVisibilityMenuAnchorEl, setColumnVisibilityMenuAnchorEl] = useState<Element | null>(null);

  // Contexts
  const dialogContext = useContext(DialogContext);
  const telemetryTableContext = useTelemetryTableContext();
  const surveyContext = useContext(SurveyContext);

  const { projectId, surveyId } = surveyContext;

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const handleCloseContextMenu = () => {
    setContextMenuAnchorEl(null);
  };

  const handleCloseColumnVisibilityMenu = () => {
    setColumnVisibilityMenuAnchorEl(null);
  };

  // /**
  //  * Toggles visibility for a particular column
  //  */
  // const toggleColumnVisibility = (field: string) => {
  //   const fields = [...hiddenFields];
  //   if (fields.includes(field)) {
  //     setHiddenFields(fields.filter((hiddenField) => hiddenField !== field));
  //     return;
  //   }
  //
  //   setHiddenFields([...fields, field]);
  // };
  //
  // // The array of columns that may be toggled as hidden or visible
  // const hideableColumns = useMemo(() => {
  //   return telemetryTableContext.getColumns().filter((column) => {
  //     return column && column.type && !['actions', 'checkboxSelection'].includes(column.type) && column.hideable;
  //   });
  // }, [telemetryTableContext]);
  //
  // /**
  //  * Toggles whether all columns are hidden or visible.
  //  */
  // const toggleShowHideAll = useCallback(() => {
  //   if (hiddenFields.length > 0) {
  //     setHiddenFields([]);
  //   } else {
  //     setHiddenFields(hideableColumns.map((column) => column.field));
  //   }
  // }, [hiddenFields, hideableColumns, setHiddenFields]);
  //
  // /**
  //  * Whenever hidden fields updates, trigger an update in visiblity for the table.
  //  */
  // useEffect(() => {
  //   telemetryTableContext._muiDataGridApiRef.current.setColumnVisibilityModel({
  //     ...Object.fromEntries(hideableColumns.map((column) => [column.field, true])),
  //     ...Object.fromEntries(hiddenFields.map((field) => [field, false]))
  //   });
  // }, [hideableColumns, hiddenFields, telemetryTableContext._muiDataGridApiRef]);

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
        uploadButtonLabel="Import"
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
            <Collapse in={telemetryTableContext.hasUnsavedChanges} orientation="horizontal">
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
                  <Typography variant="inherit">Delete {p(numSelectedRows, 'Telemetr', 'y', 'ies')}</Typography>
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
            <ManualTelemetryTable isLoading={processingRecords} />
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default ManualTelemetryTableContainer;
