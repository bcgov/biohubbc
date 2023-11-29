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
import { ObservationsTableI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { ObservationsTableContext } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import ObservationsTable from 'features/surveys/observations/observations-table/ObservationsTable';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useState } from 'react';
import { pluralize as p } from 'utils/Utils';

const ObservationComponent = () => {
  const [showImportDiaolog, setShowImportDiaolog] = useState<boolean>(false);
  const [processingRecords, setProcessingRecords] = useState<boolean>(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<Element | null>(null);
  const [showConfirmRemoveAllDialog, setShowConfirmRemoveAllDialog] = useState<boolean>(false);
  const observationsTableContext = useContext(ObservationsTableContext);
  const surveyContext = useContext(SurveyContext);
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const { projectId, surveyId } = surveyContext;

  const handleImportObservations = async (file: File) => {
    return biohubApi.observation.uploadCsvForImport(projectId, surveyId, file).then((response) => {
      setShowImportDiaolog(false);
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

  const { hasUnsavedChanges, validationModel, _muiDataGridApiRef } = observationsTableContext;
  const numSelectedRows = observationsTableContext.rowSelectionModel.length;

  return (
    <>
      <FileUploadDialog
        open={showImportDiaolog}
        dialogTitle="Import Observation CSV"
        onClose={() => setShowImportDiaolog(false)}
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
              Observations &zwnj;
              <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
                ({observationsTableContext.observationCount})
              </Typography>
            </Typography>

            <Box display="flex" overflow="hidden" gap={1} whiteSpace="nowrap">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Icon path={mdiImport} size={1} />}
                onClick={() => setShowImportDiaolog(true)}>
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
                    setMenuAnchorEl(event.currentTarget);
                  }}
                  size="small"
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
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl)}
                  onClose={handleCloseMenu}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button'
                  }}>
                  <MenuItem
                    onClick={() => {
                      observationsTableContext.deleteSelectedObservationRecords();
                      handleCloseMenu();
                    }}
                    disabled={observationsTableContext.isSaving}>
                    <ListItemIcon>
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </ListItemIcon>
                    <Typography variant="inherit">Delete {p(numSelectedRows, 'Observation')}</Typography>
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
            <ObservationsTable isLoading={processingRecords} />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ObservationComponent;
