import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { IDropZoneConfigProps } from 'components/file-upload/DropZone';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { FileUploadSingleItem } from 'components/file-upload/FileUploadSingleItem';
import { useEffect, useState } from 'react';

interface IFileUploadSingleItemDialog {
  open: boolean;
  dialogTitle: string;
  uploadButtonLabel: string;
  onUpload: (file: File) => Promise<void>;
  onClose?: () => void;
  dropZoneProps: Pick<IDropZoneConfigProps, 'acceptedFileExtensions' | 'maxFileSize'>;
}

/**
 *
 *
 * @param {IFileUploadSingleItemDialog} props
 * @return {*}
 */
export const FileUploadSingleItemDialog = (props: IFileUploadSingleItemDialog) => {
  const { open, dialogTitle, uploadButtonLabel, onUpload, onClose, dropZoneProps } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadFileStatus>(UploadFileStatus.STAGED);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const isDisabled = !currentFile;

  const handleUpload = () => {
    if (!currentFile) {
      return;
    }

    setIsUploading(true);
    onUpload(currentFile).finally(() => setIsUploading(false));
  };

  useEffect(() => {
    setCurrentFile(null);
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="xl"
      open={open}
      aria-labelledby="file-upload-dialog-title"
      aria-describedby="file-upload-dialog-description">
      <DialogTitle id="file-upload-dialog-title">{dialogTitle}</DialogTitle>
      <DialogContent>
        <FileUploadSingleItem
          file={currentFile}
          status={status}
          onStatus={(status) => setStatus(status)}
          onFile={(file) => {
            setCurrentFile(file);
            setError('');
          }}
          onError={(error) => setError(error)}
          onCancel={() => {}}
          DropZoneProps={dropZoneProps}
        />
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={isUploading}
          disabled={isDisabled}
          onClick={() => handleUpload()}
          color="primary"
          variant="contained"
          autoFocus>
          {uploadButtonLabel}
        </LoadingButton>
        <Button onClick={onClose} color="primary" variant="outlined" disabled={isUploading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
