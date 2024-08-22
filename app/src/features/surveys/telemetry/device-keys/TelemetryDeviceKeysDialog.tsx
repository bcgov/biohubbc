import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import FileUpload from 'components/file-upload/FileUpload';
import { AttachmentTypeFileExtensions } from 'constants/attachments';
import { useState } from 'react';

export interface ITelemetryDeviceKeysDialogProps {
  open: boolean;
}

export const TelemetryDeviceKeysDialog = (props: ITelemetryDeviceKeysDialogProps) => {
  const { open } = props;

  const theme = useTheme();

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [isSaving, setIsSaving] = useState(false);

  const uploadHandler = async (
    file: File,
    cancelToken: CancelTokenSource,
    handleFileUploadProgress: (progressEvent: AxiosProgressEvent) => void
  ) => {};

  const acceptedFileExtensions = Array.from(
    new Set([...AttachmentTypeFileExtensions.KEYX, ...AttachmentTypeFileExtensions.CFG])
  );

  if (!props.open) {
    return <></>;
  }

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="xl"
      open={props.open}
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
              FileUploadItemComponent={FileUploadItem}
              FileUploadItemComponentProps={{
                SubtextComponent: SampleSiteFileUploadItemSubtext,
                ActionButtonComponent: SampleSiteFileUploadItemActionButton,
                ProgressBarComponent: SampleSiteFileUploadItemProgressBar
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <LoadingButton loading={isSaving} onClick={formikProps.submitForm} color="primary" variant="contained">
            <strong>Save</strong>
          </LoadingButton>
          <Button onClick={props.onClose} color="primary" variant="outlined" disabled={isSaving}>
            Cancel
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
