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
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IFileUploadDialogProps
   */
  open: boolean;
  /**
   * The title of the dialog.
   *
   * @type {string}
   * @memberof IFileUploadDialogProps
   */
  dialogTitle: string;
  /**
   * Callback fired when a file is added.
   *
   * @memberof IReportFileUploadDialogProps
   */
  uploadHandler: IUploadHandler;
  /**
   * Callback fired when the dialog is closed.
   *
   * This function does not need to handle any errors, as the `FileUpload` component handles errors internally.
   *
   * @memberof IFileUploadDialogProps
   */
  onClose: () => void;
  /**
   * Drop zone configuration properties.
   *
   * @type {IDropZoneConfigProps}
   * @memberof IFileUploadDialogProps
   */
  dropZoneProps?: IDropZoneConfigProps;
}

/**
 * Wraps the standard `FileUpload` component in a dialog.
 *
 * The wrapped `FileUpload` component allows for drag-and-drop file uploads of any number of files with any file type.
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
