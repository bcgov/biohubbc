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
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import FileUploadDialog from 'components/dialog/FileUploadDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { ObservationsTableI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { ObservationsContext } from 'contexts/observationsContext';
import { SurveyContext } from 'contexts/surveyContext';
import ObservationsTable from 'features/surveys/observations/ObservationsTable';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useState } from 'react';
import { pluralize as p } from 'utils/Utils';

const ObservationComponent = () => {
  const [showImportDiaolog, setShowImportDiaolog] = useState<boolean>(false);
  const [processingRecords, setProcessingRecords] = useState<boolean>(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<Element | null>(null);
  const [showConfirmRemoveAllDialog, setShowConfirmRemoveAllDialog] = useState<boolean>(false);
  const observationsContext = useContext(ObservationsContext);
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
                Imported survey observations successfully.
              </Typography>
            )
          });
          observationsContext.refreshRecords().then(() => {
            setProcessingRecords(false);
          });
        })
        .catch(() => {
          setProcessingRecords(false);
        });
    });
  };

  const handleDeleteSelectedObservations = () => {
    const selectedRecords = observationsContext.getSelectedObservations();
    observationsContext.deleteObservationRecords(selectedRecords);
  };

  const hasUnsavedChanges = observationsContext.hasUnsavedChanges();
  const numSelectedRows = observationsContext.rowSelectionModel.length;
  const observationCount =
    observationsContext.observationsDataLoader?.data?.supplementaryObservationData?.observationCount ?? 0;

  return (
    <>
      <FileUploadDialog
        open={showImportDiaolog}
        dialogTitle="Import Observation CSV"
        onClose={() => setShowImportDiaolog(false)}
        onUpload={handleImportObservations}
        FileUploadProps={{
          fileHandler: (file) => {
            console.log(file);
          },
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
          observationsContext.revertRecords();
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
          overflow: 'hidden'
        }}>
        <Toolbar>
          <Typography
            sx={{
              flexGrow: '1',
              fontSize: '1.125rem',
              fontWeight: 700
            }}>
            Observations &zwnj;
            <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
              ({observationCount})
            </Typography>
          </Typography>


          <Box
            display="flex"
            overflow="hidden"
            gap={1}
            whiteSpace='nowrap'>
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
              onClick={() => observationsContext.createNewRecord()}
              disabled={observationsContext.isSaving}>
              Add Record
            </Button>
            <Collapse in={hasUnsavedChanges} orientation="horizontal" sx={{ mr: -1 }}>
              <Box whiteSpace="nowrap" display="flex" sx={{ gap: 1, pr: 1 }}>
                <LoadingButton
                  loading={observationsContext.isSaving}
                  variant="contained"
                  color="primary"
                  onClick={() => observationsContext.stopEditAndSaveRows()}
                  disabled={observationsContext.isSaving}>
                  Save
                </LoadingButton>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowConfirmRemoveAllDialog(true)}
                  disabled={observationsContext.isSaving}>
                  Discard Changes
                </Button>
              </Box>
            </Collapse>
            <Box>
              <IconButton
                onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                  setMenuAnchorEl(event.currentTarget);
                }}
                size='small'
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
                    handleDeleteSelectedObservations();
                    handleCloseMenu();
                  }}>
                  <ListItemIcon>
                    <Icon path={mdiTrashCanOutline} size={1} />
                  </ListItemIcon>
                  <Typography variant="inherit">Delete {p(numSelectedRows, 'Observation')}</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>

        </Toolbar>
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
