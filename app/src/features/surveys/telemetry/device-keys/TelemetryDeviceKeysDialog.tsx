import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AxiosProgressEvent, CancelTokenSource } from 'axios';
import FileUpload from 'components/file-upload/FileUpload';
import { AttachmentTypeFileExtensions } from 'constants/attachments';
import { TelemetryDeviceKeysList } from 'features/surveys/telemetry/device-keys/TelemetryDeviceKeysList';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import useIsMounted from 'hooks/useIsMounted';
import { useEffect } from 'react';

export interface ITelemetryDeviceKeysDialogProps {
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   */
  open: boolean;
  /**
   * Callback fired when the dialog is closed.
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
  const { open, onClose } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();

  const isMounted = useIsMounted();

  const uploadHandler = async (
    file: File,
    cancelToken: CancelTokenSource,
    handleFileUploadProgress: (progressEvent: AxiosProgressEvent) => void
  ) => {
    return biohubApi.telemetry
      .uploadTelemetryDeviceCredentialFile(
        surveyContext.projectId,
        surveyContext.surveyId,
        file,
        cancelToken,
        handleFileUploadProgress
      )
      .then(() => {
        if (!isMounted()) {
          return;
        }

        telemetryDeviceKeyFileDataLoader.refresh();
      })
      .catch((error) => {
        if (!isMounted()) {
          return;
        }

        throw error;
      })
      .finally(() => {
        if (!isMounted()) {
          return;
        }
      });
  };

  const acceptedFileExtensions = Array.from(
    new Set([...AttachmentTypeFileExtensions.KEYX, ...AttachmentTypeFileExtensions.CFG])
  );

  const telemetryDeviceKeyFileDataLoader = useDataLoader(() =>
    biohubApi.telemetry.getTelemetryDeviceKeyFiles(surveyContext.projectId, surveyContext.surveyId)
  );

  useEffect(() => {
    if (!open) {
      // If the dialog is not open, do not load the data
      return;
    }

    telemetryDeviceKeyFileDataLoader.load();
  }, [open, telemetryDeviceKeyFileDataLoader]);

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
            <Typography color="textSecondary">
              Device keys allow telemetry data from Vectronic to be automatically loaded into your Survey.
            </Typography>
            <Typography color="textSecondary">Vectronic device keys are .keyx files.</Typography>
            <Typography color="textSecondary">Lotek device keys are .cfg files.</Typography>
            <Typography color="textSecondary" mb={3}>
              Telemetry data from other manufacturers must be imported manually.
            </Typography>
            <FileUpload
              uploadHandler={uploadHandler}
              dropZoneProps={{
                acceptedFileExtensions: acceptedFileExtensions
              }}
              hideDropZoneOnMaxFiles={true}
            />
          </Box>
          <Box mt={0}>
            <TelemetryDeviceKeysList
              isLoading={telemetryDeviceKeyFileDataLoader.isLoading || !telemetryDeviceKeyFileDataLoader.isReady}
              telementryCredentialAttachments={telemetryDeviceKeyFileDataLoader?.data ?? []}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={onClose} color="primary" variant="contained">
            <strong>Close</strong>
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};