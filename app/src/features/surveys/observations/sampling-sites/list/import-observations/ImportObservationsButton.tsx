import { mdiImport } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FileUploadDialog from 'components/dialog/FileUploadDialog';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { ObservationsTableI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useState } from 'react';

export interface IImportObservationsButtonProps {
  /**
   * If true, the button will be disabled.
   *
   * @type {boolean}
   * @memberof IImportObservationsButtonProps
   */
  disabled?: boolean;
  /**
   * Callback fired when the import process is started.
   *
   * @memberof IImportObservationsButtonProps
   */
  onStart?: () => void;
  /**
   * Callback fired when the import process is successful.
   *
   * @memberof IImportObservationsButtonProps
   */
  onSuccess?: () => void;
  /**
   * Callback fired when the import process encounters an error.
   *
   * @memberof IImportObservationsButtonProps
   */
  onError?: () => void;
  /**
   * Callback fired when the import process is complete (success or error).
   *
   * @memberof IImportObservationsButtonProps
   */
  onFinish?: () => void;
  /**
   * Options to pass to the process csv submission endpoint.
   *
   * @type {{
   *     surveySamplePeriodId?: number;
   *   }}
   * @memberof IImportObservationsButtonProps
   */
  processOptions?: {
    /**
     * An optional survey sample period id. All imported observation records will be associated to this sample period.
     *
     * @type {number}
     */
    surveySamplePeriodId?: number;
  };
}

/**
 * Renders a button that allows the user to import observation records from a CSV file.
 *
 * @param {IImportObservationsButtonProps} props
 * @return {*}
 */
export const ImportObservationsButton = (props: IImportObservationsButtonProps) => {
  const { disabled, onStart, onSuccess, onError, onFinish, processOptions } = props;

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
    try {
      onStart?.();

      const uploadResponse = await biohubApi.observation.uploadCsvForImport(projectId, surveyId, file);

      await biohubApi.observation.processCsvSubmission(
        projectId,
        surveyId,
        uploadResponse.submissionId,
        processOptions
      );

      setOpen(false);

      dialogContext.setSnackbar({
        snackbarMessage: (
          <Typography variant="body2" component="div">
            {ObservationsTableI18N.importRecordsSuccessSnackbarMessage}
          </Typography>
        ),
        open: true
      });

      onSuccess?.();
    } catch (apiError: any) {
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
    } finally {
      onFinish?.();
    }
  };

  return (
    <>
      <IconButton
        title="Import Observations"
        onClick={() => setOpen(true)}
        disabled={disabled || false}
        aria-label="Import Observations">
        <Icon path={mdiImport} size={1} />
      </IconButton>
      <FileUploadDialog
        open={open}
        dialogTitle="Import Observation CSV"
        onClose={() => setOpen(false)}
        onUpload={handleImportObservations}
        uploadButtonLabel="Import"
        FileUploadProps={{
          dropZoneProps: { maxNumFiles: 1, acceptedFileExtensions: '.csv' },
          status: UploadFileStatus.STAGED
        }}
      />
    </>
  );
};