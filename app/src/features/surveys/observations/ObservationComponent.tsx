import { mdiImport, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import FileUploadDialog from 'components/dialog/FileUploadDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { ObservationsTableI18N } from 'constants/i18n';
import { ObservationsContext } from 'contexts/observationsContext';
import { SurveyContext } from 'contexts/surveyContext';
import ObservationsTable from 'features/surveys/observations/ObservationsTable';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useState } from 'react';

const ObservationComponent = () => {
  const [showImportDiaolog, setShowImportDiaolog] = useState<boolean>(false);
  const [processingRecords, setProcessingRecords] = useState<boolean>(false);
  const observationsContext = useContext(ObservationsContext);
  const surveyContext = useContext(SurveyContext);
  const biohubApi = useBiohubApi();

  const { projectId, surveyId } = surveyContext;

  const handleImportObservations = async (file: File) => {
    return biohubApi.observation.uploadCsvForImport(projectId, surveyId, file).then((response) => {
      setShowImportDiaolog(false);
      setProcessingRecords(true);
      biohubApi.observation
        .processCsvSubmission(projectId, surveyId, response.submissionId)
        .then(() => {
          observationsContext.refreshRecords().then(() => {
            setProcessingRecords(false);
          });
        })
        .catch(() => {
          setProcessingRecords(false);
        });
    });
  };

  const hasUnsavedChanges = observationsContext.hasUnsavedChanges();
  const [showConfirmRemoveAllDialog, setShowConfirmRemoveAllDialog] = useState<boolean>(false);

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
        <Toolbar
          sx={{
            flex: '0 0 auto',
            '& button': {
              minWidth: '6rem'
            },
            '& button + button': {
              ml: 1
            }
          }}>
          <Typography
            sx={{
              flexGrow: '1',
              fontSize: '1.125rem',
              fontWeight: 700
            }}>
            Observations
          </Typography>

          <Box
            sx={{
              '& div:first-of-type': {
                display: 'flex',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }
            }}>
            <Box display="flex" overflow="hidden">
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
              <Collapse in={hasUnsavedChanges} orientation="horizontal">
                <Box ml={1} whiteSpace="nowrap">
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
