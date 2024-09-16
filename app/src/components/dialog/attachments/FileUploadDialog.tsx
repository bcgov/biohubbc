import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { IDropZoneConfigProps } from 'components/file-upload/DropZone';
import FileUpload from 'components/file-upload/FileUpload';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { IComponentDialogProps } from '../ComponentDialog';

interface IFileUploadDialogProps extends IComponentDialogProps {
  open: boolean;
  dialogTitle: string;
  uploadHandler: IUploadHandler;
  onClose: () => void;
  dropZoneProps?: IDropZoneConfigProps;
}

/**
 *
 *
 * @param {IFileUploadDialogProps} props
 * @return {*}
 */
export const FileUploadDialog = (props: IFileUploadDialogProps) => {
  const { open, dialogTitle, uploadHandler, onClose, dropZoneProps } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
        <FileUpload uploadHandler={uploadHandler} dropZoneProps={dropZoneProps} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
