import { mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FileUploadDialog from 'components/dialog/FileUploadDialog';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { ObservationsTableI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useState } from 'react';

export interface IImportObservationsButtonProps {
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
  onFinish?: () => void;
}

export const ImportObservationsButton = (props: IImportObservationsButtonProps) => {
  const { onStart, onSuccess, onError, onFinish } = props;

  const biohubApi = useBiohubApi();

  const surveyContext = useContext(SurveyContext);
  const { projectId, surveyId } = surveyContext;

  const dialogContext = useContext(DialogContext);

  const [open, setOpen] = useState<boolean>(false);

  /**
   * Callback fired when the user attempts to import observations.
   *
   * @param {File} file
   * @return {*}
   */
  const handleImportObservations = async (file: File) => {
    return biohubApi.observation.uploadCsvForImport(projectId, surveyId, file).then((response) => {
      setOpen(false);

      onStart?.();

      biohubApi.observation
        .processCsvSubmission(projectId, surveyId, response.submissionId)
        .then(() => {
          dialogContext.setSnackbar({
            snackbarMessage: (
              <Typography variant="body2" component="div">
                {ObservationsTableI18N.importRecordsSuccessSnackbarMessage}
              </Typography>
            ),
            open: true
          });

          onSuccess?.();
        })
        .catch((apiError: any) => {
          dialogContext.setErrorDialog({
            dialogTitle: ObservationsTableI18N.importRecordsErrorDialogTitle,
            dialogText: ObservationsTableI18N.importRecordsErrorDialogText,
            dialogErrorDetails: [apiError.message],
            open: true,
            onClose: () => {
              dialogContext.setErrorDialog({ open: false });
            },
            onOk: () => {
              dialogContext.setErrorDialog({ open: false });
            }
          });

          onError?.();
        })
        .finally(() => {
          onFinish?.();
        });
    });
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Icon path={mdiImport} size={1} />}
        onClick={() => setOpen(true)}>
        Import
      </Button>
      <FileUploadDialog
        open={open}
        dialogTitle="Import Observation CSV"
        onClose={() => setOpen(false)}
        onUpload={handleImportObservations}
        FileUploadProps={{
          dropZoneProps: { maxNumFiles: 1, acceptedFileExtensions: '.csv' },
          status: UploadFileStatus.STAGED
        }}
      />
    </>
  );
};
