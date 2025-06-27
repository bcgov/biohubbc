import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { AxiosProgressEvent } from 'axios';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { FileUploadSingleItem } from 'components/file-upload/FileUploadSingleItem';
import { DialogContext } from 'contexts/dialogContext';
import { useContext, useState } from 'react';
import { isCSVValidationError } from 'utils/csv-utils';
import { getAxiosProgress, waitForRenderCycle } from 'utils/Utils';
import { CSVDropzoneSection } from './CSVDropzoneSection';

// New component for the instructions and video
const TransformInstructions = () => (
  <Box sx={{ width: '100%', my: 3 }}>
    <Stack spacing={2}>
      <Typography variant="h6" component="h3">
        How to Transform Your Data from Wide to Narrow Format in Excel
      </Typography>

      <Box sx={{ pl: 2 }}>
        <Typography variant="body1" component="div" sx={{ mb: 1 }}>
          <strong>Step 1:</strong> Select your data, navigate to the "Data" tab and choose "From Data/Range", then
          confirm with "OK".
        </Typography>

        <Typography variant="body1" component="div" sx={{ mb: 1 }}>
          <strong>Step 2:</strong> Select all columns you want to transform, open the "Transform" tab and select
          "Unpivot Columns".
        </Typography>

        <Typography variant="body1" component="div" sx={{ mb: 1 }}>
          <strong>Step 3:</strong> Rename your new columns appropriately, return to the home tab, then select "Close and
          Load".
        </Typography>
      </Box>

      <Box sx={{ overflow: 'hidden', position: 'relative' }}>
        <video
          src="https://nrs.objectstore.gov.bc.ca/locsch/resources/Import_PQMP4_2_slow.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '800px',
            height: 'auto',
            margin: '0 auto',
            border: '1px solid #eee',
            objectFit: 'cover'
          }}
        />
      </Box>
    </Stack>
  </Box>
);

interface CSVSingleImportDialogProps {
  open: boolean;
  dialogTitle: string;
  dialogSummary: string;
  onClose: () => void;
  onImport: (file: File, onProgress: (progressEvent: AxiosProgressEvent) => void) => Promise<void>;
  onDownloadTemplate: () => void;
}

/**
 * Dialog for importing a single CSV file.
 *
 * @param {CSVSingleImportDialogProps} props
 * @return {*} {JSX.Element}
 */
export const CSVSingleImportDialog = (props: CSVSingleImportDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const dialogContext = useContext(DialogContext);

  // Dialog and import state
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadFileStatus>(UploadFileStatus.STAGED);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);
  // New state to control video visibility
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  const isUploading = uploadStatus === UploadFileStatus.UPLOADING || uploadStatus === UploadFileStatus.FINISHING_UPLOAD;
  const disableImportButton =
    isUploading || !file || uploadStatus === UploadFileStatus.FAILED || uploadStatus === UploadFileStatus.COMPLETE;

  /**
   * Close the dialog and reset the file import state
   *
   * @returns {void}
   */
  const handleClose = (): void => {
    props.onClose();
    handleResetFileImport();
  };

  /**
   * Reset the file import state, independent of the dialog state
   *
   * @returns {void}
   */
  const handleResetFileImport = (): void => {
    setFile(null);
    setUploadStatus(UploadFileStatus.STAGED);
    setProgress(0);
    setError(null);
  };

  /**
   * Import the CSV file and update the status accordingly
   *
   * @param {File | null} file The CSV file to import
   * @returns {Promise<void>}
   */
  const handleCSVFileImport = async (file: File | null): Promise<void> => {
    if (!file) {
      return;
    }

    try {
      setUploadStatus(UploadFileStatus.UPLOADING);

      await props.onImport(file, (progressEvent) => {
        // Update the progress state from the Axios progress event
        setProgress(getAxiosProgress(progressEvent));

        if (progressEvent.loaded === progressEvent.total) {
          setUploadStatus(UploadFileStatus.FINISHING_UPLOAD);
        }
      });

      setUploadStatus(UploadFileStatus.COMPLETE);

      // Wait for the complete status to be rendered + 500ms before closing the dialog
      await waitForRenderCycle(500);

      // Show a success snackbar message
      dialogContext.setSnackbar({
        open: true,
        snackbarAutoCloseMs: 2000,
        snackbarMessage: 'Successfully imported CSV file'
      });

      handleClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }

      // Show a failure snackbar message
      dialogContext.setSnackbar({
        open: true,
        snackbarAutoCloseMs: 2000,
        snackbarMessage: 'Failed to import CSV file'
      });

      setUploadStatus(UploadFileStatus.FAILED);
    }
  };

  if (!props.open) {
    return null;
  }

  return (
    <Dialog open={props.open} maxWidth={'xl'} fullScreen={fullScreen}>
      <DialogContent sx={{ mt: 2 }}>
        <Box>
          <CSVDropzoneSection
            title={props.dialogTitle}
            summary={props.dialogSummary}
            onDownloadTemplate={props.onDownloadTemplate}
            errors={isCSVValidationError(error) ? error.errors : []}>
            <FileUploadSingleItem
              file={file}
              status={uploadStatus}
              error={error?.message}
              onError={(message) => setError(new Error(message))}
              progress={progress}
              onFile={(file) => setFile(file)}
              onCancel={handleResetFileImport}
            />
          </CSVDropzoneSection>
        </Box>

        {/* Moved transformation help link below the CSV upload section */}
        <Box
          onClick={() => setShowInstructions(!showInstructions)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            my: 2,
            cursor: 'pointer',
            color: 'primary.main',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}>
          <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2" component="span">
            {showInstructions
              ? 'Hide data transformation instructions'
              : 'Need help transforming data from wide to narrow?'}
          </Typography>
          {showInstructions ? (
            <KeyboardArrowUpIcon fontSize="small" sx={{ ml: 0.5 }} />
          ) : (
            <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
          )}
        </Box>

        {showInstructions && <TransformInstructions />}
      </DialogContent>
      <Divider />

      <DialogActions>
        <LoadingButton
          onClick={() => {
            handleCSVFileImport(file);
          }}
          color="primary"
          variant="contained"
          disabled={disableImportButton}>
          Import
        </LoadingButton>

        <LoadingButton onClick={handleClose} color="primary" variant="outlined">
          {uploadStatus === UploadFileStatus.COMPLETE ? 'Close' : 'Cancel'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
