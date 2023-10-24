import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import FileUpload, { IFileUploadProps } from 'components/file-upload/FileUpload';
import { IFileHandler } from 'components/file-upload/FileUploadItem';
import { useState } from 'react';
import { IComponentDialogProps } from './ComponentDialog';

interface IFileUploadDialogProps extends IComponentDialogProps {
  uploadButtonLabel?: string;
  onUpload: (file: File) => Promise<void>;
  FileUploadProps: Partial<IFileUploadProps>;
}

const FileUploadDialog = (props: IFileUploadDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const fileHandler: IFileHandler = (file: File | null) => {
    setCurrentFile(file);
  };

  const handleUpload = () => {
    if (!currentFile) {
      return;
    }

    setUploading(true);
    props.onUpload(currentFile).finally(() => setUploading(false));
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="xl"
      open={props.open}
      aria-labelledby="file-upload-dialog-title"
      aria-describedby="file-upload-dialog-description"
      {...props.dialogProps}>
      <DialogTitle id="file-upload-dialog-title">{props.dialogTitle}</DialogTitle>
      <DialogContent>
        {props.children}
        <FileUpload {...props.FileUploadProps} fileHandler={fileHandler} />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={uploading}
          disabled={!currentFile}
          onClick={() => handleUpload()}
          color="primary"
          variant="contained"
          autoFocus>
          {props.uploadButtonLabel ? props.uploadButtonLabel : 'Import'}
        </LoadingButton>
        <Button onClick={props.onClose} color="primary" variant="outlined">
          {props.closeButtonLabel ? props.closeButtonLabel : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUploadDialog;
