import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AxiosProgressEvent, CancelTokenSource } from 'axios';
import FileUpload from 'components/file-upload/FileUpload';
import { AttachmentTypeFileExtensions } from 'constants/attachments';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useIsMounted from 'hooks/useIsMounted';
import { useState } from 'react';

export interface ITelemetryDeviceKeysDialogProps {
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof ITelemetryDeviceKeysDialogProps
   */
  open: boolean;
  /**
   * Callback fired when the file upload is initiated.
   *
   * @memberof ITelemetryDeviceKeysDialogProps
   */
  onSave: () => void;
  /**
   * Callback fired when the file upload is cancelled.
   *
   * @memberof ITelemetryDeviceKeysDialogProps
   */
  onCancel: () => void;
  /**
   * Callback fired when the dialog is closed.
   *
   * @memberof ITelemetryDeviceKeysDialogProps
   */
  onClose?: () => void;
}

/**
 * A dialog for managing telemetry device keys.
 *
 * @param {ITelemetryDeviceKeysDialogProps} props
 * @return {*}
 */
export const TelemetryDeviceKeysDialog = (props: ITelemetryDeviceKeysDialogProps) => {
  const { open, onSave, onCancel, onClose } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();

  const isMounted = useIsMounted();

  const [isSaving, setIsSaving] = useState(false);

  const uploadHandler = async (
    file: File,
    cancelToken: CancelTokenSource,
    handleFileUploadProgress: (progressEvent: AxiosProgressEvent) => void
  ) => {
    setIsSaving(true);

    return biohubApi.telemetry
      .uploadTelemetryDeviceKeyFile(
        surveyContext.projectId,
        surveyContext.surveyId,
        file,
        cancelToken,
        handleFileUploadProgress
      )
      .catch((error) => {
        if (!isMounted()) {
          return;
        }

        setIsSaving(false);
        throw error;
      })
      .finally(() => {
        if (!isMounted()) {
          return;
        }

        setIsSaving(false);
      });
  };

  const acceptedFileExtensions = Array.from(
    new Set([...AttachmentTypeFileExtensions.KEYX, ...AttachmentTypeFileExtensions.CFG])
  );

  if (!open) {
    return <></>;
  }

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="xl"
      open={open}
      onClose={onClose}
      aria-labelledby="component-dialog-title"
      aria-describedby="component-dialog-description">
      <Box>
        <DialogTitle id="component-dialog-title">Manage Device Keys</DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <FileUpload
              uploadHandler={uploadHandler}
              dropZoneProps={{
                maxNumFiles: 1,
                multiple: false,
                acceptedFileExtensions: acceptedFileExtensions
              }}
              hideDropZoneOnMaxFiles={true}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <LoadingButton loading={isSaving} onClick={onSave} color="primary" variant="contained">
            <strong>Save</strong>
          </LoadingButton>
          <Button onClick={onCancel} color="primary" variant="outlined" disabled={isSaving}>
            Cancel
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
