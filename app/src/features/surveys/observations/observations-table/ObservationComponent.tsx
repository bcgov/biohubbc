import { mdiDotsVertical, mdiFilter, mdiImport, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import { Checkbox, ListItemText } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
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
import { ObservationsTableI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { ObservationsTableContext } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import ObservationsTable from 'features/surveys/observations/observations-table/ObservationsTable';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useMemo, useState } from 'react';
import { pluralize as p } from 'utils/Utils';

const ObservationComponent = () => {
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  const [columnVisibilityMenuAnchorEl, setColumnVisibilityMenuAnchorEl] = useState<Element | null>(null);
  const [hiddenFields, setHiddenFields] = useState<string[]>([]);
  const [processingRecords, setProcessingRecords] = useState<boolean>(false);
  const [contextMenuAnchorEl, setContextMenuAnchorEl] = useState<Element | null>(null);
  const [showConfirmRemoveAllDialog, setShowConfirmRemoveAllDialog] = useState<boolean>(false);
  const observationsTableContext = useContext(ObservationsTableContext);
  const surveyContext = useContext(SurveyContext);
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const handleCloseContextMenu = () => {
    setContextMenuAnchorEl(null);
  };

  const handleCloseColumnVisibilityMenu = () => {
    setColumnVisibilityMenuAnchorEl(null);
  };

  const { projectId, surveyId } = surveyContext;

  const handleImportObservations = async (file: File) => {
    return biohubApi.observation.uploadCsvForImport(projectId, surveyId, file).then((response) => {
      setShowImportDialog(false);
      setProcessingRecords(true);
      biohubApi.observation
        .processCsvSubmission(projectId, surveyId, response.submissionId)
        .then(() => {
          showSnackBar({
            snackbarMessage: (
              <Typography variant="body2" component="div">
                Observations imported successfully.
              </Typography>
            )
          });
          observationsTableContext.refreshObservationRecords().then(() => {
            setProcessingRecords(false);
          });
        })
        .catch(() => {
          setProcessingRecords(false);
        });
    });
  };

  const hideableColumns = useMemo(() => {
    return observationsTableContext
      .getColumns()
      .filter((column) => {
        return column &&
          column.type &&
          !(['actions', 'checkboxSelection'].includes(column.type)) &&
          column.hideable
      });
  }, [observationsTableContext.getColumns]);

  const toggleColumnVisibility = (field: string) => {
    setHiddenFields((prev) => {
      if (prev.includes(field)) {
        _muiDataGridApiRef.current.setColumnVisibility(field, true)
        return prev.filter((hiddenField) => hiddenField !== field);
      } else {
        _muiDataGridApiRef.current.setColumnVisibility(field, false)
        return [...prev, field];
      }
    });
  }

  // Whenever visible fields have updated, propogate the changes up to the datagrid ref
  // useEffect(() => {
  //   // console.log('effect', Object.fromEntries(visibleFields.map((field) => [field, true])))
  //   _muiDataGridApiRef.current.setColumnVisibilityModel(Object.fromEntries(visibleFields.map((field) => [field, true])))
  // }, [visibleFields]);

  console.log(hiddenFields)

  const { hasUnsavedChanges, validationModel, _muiDataGridApiRef } = observationsTableContext;
  const numSelectedRows = observationsTableContext.rowSelectionModel.length;

  return (
    <>
      <FileUploadDialog
        open={showImportDialog}
        dialogTitle="Import Observation CSV"
        onClose={() => setShowImportDialog(false)}
        onUpload={handleImportObservations}
        FileUploadProps={{
          dropZoneProps: { maxNumFiles: 1, acceptedFileExtensions: '.csv' },
          status: UploadFileStatus.STAGED
        }}></FileUploadDialog>
      <YesNoDialog
        dialogTitle={ObservationsTableI18N.removeAllDialogTitle}
        dialogText={ObservationsTableI18N.removeAllDialogText}
        yesButtonProps={{ color: 'error' }}
        yesButtonLabel={'Discard Changes'}
        noButtonProps={{ color: 'primary', variant: 'outlined' }}
        noButtonLabel={'Cancel'}
        open={showConfirmRemoveAllDialog}
        onYes={() => {
          setShowConfirmRemoveAllDialog(false);
          observationsTableContext.revertObservationRecords();
        }}
        onClose={() => setShowConfirmRemoveAllDialog(false)}
        onNo={() => setShowConfirmRemoveAllDialog(false)}
      />
      <Paper component={Stack} flexDirection="column" flex="1 1 auto" height="100%">
        <Toolbar
          disableGutters
          sx={{
            pl: 2,
            pr: 3
          }}>
          <Typography
            sx={{
              flexGrow: '1',
              fontSize: '1.125rem',
              fontWeight: 700
            }}>
            Observations &zwnj;
            <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
              ({observationsTableContext.observationCount})
            </Typography>
          </Typography>

          <Stack flexDirection="row" alignItems="center" gap={1} whiteSpace="nowrap">
            {hideableColumns.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Icon path={mdiFilter} size={1} />}
                  onClick={(event) => setColumnVisibilityMenuAnchorEl(event.currentTarget)}
                  disabled={observationsTableContext.isSaving}>
                  Column Visibility
                </Button>
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
                  }}
                  slotProps={{
                    paper: {
                      sx: {
                        maxHeight: '416px'
                      }
                    }
                  }}>
                  {hideableColumns.map((column) => {
                    return (
                      <MenuItem key={column.field} onClick={() => toggleColumnVisibility(column.field)}>
                        <ListItemIcon>
                          <Checkbox sx={{ pl: 0 }} checked={!hiddenFields.includes(column.field)} />
                        </ListItemIcon>
                        <ListItemText>{column.headerName}</ListItemText>
                      </MenuItem>
                    )
                  })}
                  <Stack direction='row' gap={4} px={1}>
                    <Button onClick={() => {throw new Error('Not implemented yet.')}}>Show All</Button>
                    <Button onClick={() => {throw new Error('Not implemented yet.')}}>Hide All</Button>
                  </Stack>
                </Menu>
              </>
            )}
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
              onClick={() => observationsTableContext.addObservationRecord()}
              disabled={observationsTableContext.isSaving}>
              Add Record
            </Button>
            <Collapse in={hasUnsavedChanges} orientation="horizontal" sx={{ mr: -1 }}>
              <Box whiteSpace="nowrap" display="flex" sx={{ gap: 1, pr: 1 }}>
                <LoadingButton
                  loading={observationsTableContext.isSaving}
                  variant="contained"
                  color="primary"
                  onClick={() => observationsTableContext.saveObservationRecords()}
                  disabled={observationsTableContext.isSaving}>
                  Save
                </LoadingButton>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowConfirmRemoveAllDialog(true)}
                  disabled={observationsTableContext.isSaving}>
                  Discard Changes
                </Button>
              </Box>
            </Collapse>
            <Box>
              <IconButton
                onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                  setContextMenuAnchorEl(event.currentTarget);
                }}
                edge="end"
                disabled={numSelectedRows === 0}
                aria-label="observation options">
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
                id="survey-observations-table-actions-menu"
                anchorEl={contextMenuAnchorEl}
                open={Boolean(contextMenuAnchorEl)}
                onClose={handleCloseContextMenu}
                MenuListProps={{
                  'aria-labelledby': 'basic-button'
                }}>
                <MenuItem
                  onClick={() => {
                    observationsTableContext.deleteSelectedObservationRecords();
                    handleCloseContextMenu();
                  }}
                  disabled={observationsTableContext.isSaving}>
                  <ListItemIcon>
                    <Icon path={mdiTrashCanOutline} size={1} />
                  </ListItemIcon>
                  <Typography variant="inherit">Delete {p(numSelectedRows, 'Observation')}</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Stack>
        </Toolbar>

        <Divider flexItem></Divider>

        <DataGridValidationAlert validationModel={validationModel} muiDataGridApiRef={_muiDataGridApiRef.current} />

        <Box display="flex" flexDirection="column" flex="1 1 auto" position="relative">
          <Box position="absolute" width="100%" height="100%">
            <ObservationsTable isLoading={processingRecords} />
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default ObservationComponent;
