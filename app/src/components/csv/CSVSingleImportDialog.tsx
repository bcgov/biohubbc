import DownloadIcon from '@mui/icons-material/Download';
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import { Box, Dialog, DialogActions, DialogContent, Divider, Tab, Tabs, useMediaQuery, useTheme } from '@mui/material';
import { AxiosProgressEvent } from 'axios';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { FileUploadSingleItem } from 'components/file-upload/FileUploadSingleItem';
import { DialogContext } from 'contexts/dialogContext';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { useContext, useState } from 'react';
import { isCSVValidationError } from 'utils/csv-utils';
import { getAxiosProgress, waitForRenderCycle } from 'utils/Utils';
import { ColumnMapping, CSVColumnMapping } from './CSVColumnMapping';
import { CSVDropzoneSection } from './CSVDropzoneSection';
import { CSVTransformOptions } from './CSVTransformOptions';
import { TransformResult, wideToTall, WideToTallOptions } from './CSVWideToTall';

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
  const [activeTab, setActiveTab] = useState<number>(0);
  const [transformResult, setTransformResult] = useState<TransformResult | null>(null);
  const [transformOptions, setTransformOptions] = useState<WideToTallOptions>({
    valueVars: [],
    excludeColumns: [],
    variableColumnName: 'variable'
  });
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);

  const isUploading = uploadStatus === UploadFileStatus.UPLOADING || uploadStatus === UploadFileStatus.FINISHING_UPLOAD;
  const disableImportButton =
    isUploading || !file || uploadStatus === UploadFileStatus.FAILED || uploadStatus === UploadFileStatus.COMPLETE;
  const disableTransformButton = disableImportButton || !transformOptions.valueVars.length;

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
    setTransformResult(null);
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

  /**
   * Handle transforming the CSV file from wide to tall format
   *
   * @returns {Promise<void>}
   */
  const handleTransformCSV = async (): Promise<void> => {
    if (!file) {
      return;
    }

    try {
      setUploadStatus(UploadFileStatus.UPLOADING);

      const result = await wideToTall(file, transformOptions, (progressEvent) => {
        // Update the progress state from the progress event
        setProgress(getAxiosProgress(progressEvent));

        if (progressEvent.loaded === progressEvent.total) {
          setUploadStatus(UploadFileStatus.FINISHING_UPLOAD);
        }
      });

      setTransformResult(result);
      setUploadStatus(UploadFileStatus.COMPLETE);

      // Show a success snackbar message
      dialogContext.setSnackbar({
        open: true,
        snackbarAutoCloseMs: 2000,
        snackbarMessage: 'Successfully transformed CSV file'
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }

      // Show a failure snackbar message
      dialogContext.setSnackbar({
        open: true,
        snackbarAutoCloseMs: 2000,
        snackbarMessage: 'Failed to transform CSV file'
      });

      setUploadStatus(UploadFileStatus.FAILED);
    }
  };

  /**
   * Download the transformed CSV data
   *
   * @returns {void}
   */
  const handleDownloadTransformedData = (): void => {
    if (transformResult) {
      saveAs(transformResult.blob, transformResult.filename);

      // Show a success snackbar message
      dialogContext.setSnackbar({
        open: true,
        snackbarAutoCloseMs: 2000,
        snackbarMessage: 'Downloaded transformed CSV file'
      });
    }
  };

  /**
   * Import the transformed CSV data
   *
   * @returns {Promise<void>}
   */
  const handleImportTransformedData = async (): Promise<void> => {
    if (!transformResult) {
      return;
    }

    try {
      // Create a File object from the transformation result
      const transformedFile = new File([transformResult.blob], transformResult.filename, {
        type: 'text/csv'
      });

      // Reset error state in case there was a previous error
      setError(null);

      // Import the transformed file
      await handleCSVFileImport(transformedFile);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }

      // Show a failure snackbar message
      dialogContext.setSnackbar({
        open: true,
        snackbarAutoCloseMs: 2000,
        snackbarMessage: 'Failed to import transformed CSV file'
      });
    }
  };

  /**
   * Apply column mapping to the CSV file and import it
   *
   * @returns {Promise<void>}
   */
  const handleImportMappedData = async (): Promise<void> => {
    if (!file || columnMapping.length === 0) {
      return;
    }

    try {
      setUploadStatus(UploadFileStatus.UPLOADING);

      // Parse the CSV file
      const csvData = await new Promise<Papa.ParseResult<Record<string, any>>>((resolve, reject) => {
        Papa.parse<Record<string, any>>(file, {
          header: true,
          dynamicTyping: true,
          complete: resolve,
          error: reject
        });
      });

      // Update progress
      setProgress(50);

      // Apply the column mapping
      const mappedData = csvData.data.map((row) => {
        const newRow: Record<string, any> = {};

        columnMapping.forEach((mapping) => {
          if (mapping.targetColumn && mapping.targetColumn !== 'custom') {
            newRow[mapping.targetColumn] = row[mapping.sourceColumn];
          }
        });

        return newRow;
      });

      // Convert back to CSV
      const mappedCsv = Papa.unparse(mappedData);
      const blob = new Blob([mappedCsv], { type: 'text/csv;charset=utf-8' });
      const mappedFilename = `${file.name.replace('.csv', '')}_mapped.csv`;

      // Create a File object from the mapped data
      const mappedFile = new File([blob], mappedFilename, {
        type: 'text/csv'
      });

      // Update progress
      setProgress(100);

      // Reset error state in case there was a previous error
      setError(null);

      // Import the mapped file
      await props.onImport(mappedFile, (progressEvent) => {
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
        snackbarMessage: 'Successfully imported mapped CSV file'
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
        snackbarMessage: 'Failed to import mapped CSV file'
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

          {file && (
            <>
              <Divider sx={{ my: 2 }} />

              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                aria-label="CSV options tabs"
                sx={{ mb: 2 }}>
                <Tab label="Import" />
                <Tab label="Transform (Wide to Tall)" />
                <Tab label="Mapping Columns" />
              </Tabs>

              {activeTab === 1 && <CSVTransformOptions file={file} onTransformOptionsChange={setTransformOptions} />}
              {activeTab === 2 && <CSVColumnMapping file={file} onColumnMappingChange={setColumnMapping} />}
            </>
          )}
        </Box>
      </DialogContent>
      <Divider />

      <DialogActions>
        <LoadingButton
          onClick={() => {
            handleCSVFileImport(file);
          }}
          color="primary"
          variant="contained"
          loading={isUploading}
          disabled={disableImportButton}>
          Import
        </LoadingButton>

        {activeTab === 1 && (
          <>
            <LoadingButton
              onClick={handleTransformCSV}
              color="primary"
              variant="contained"
              loading={isUploading}
              disabled={disableTransformButton}>
              Transform Data
            </LoadingButton>

            {transformResult && (
              <>
                <LoadingButton
                  onClick={handleDownloadTransformedData}
                  color="primary"
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  disabled={isUploading}>
                  Download Transformed Data
                </LoadingButton>
                <LoadingButton
                  onClick={handleImportTransformedData}
                  color="primary"
                  variant="contained"
                  loading={isUploading}
                  disabled={isUploading}>
                  Import Transformed Data
                </LoadingButton>
              </>
            )}
          </>
        )}

        {activeTab === 2 && (
          <LoadingButton
            onClick={handleImportMappedData}
            color="primary"
            variant="contained"
            loading={isUploading}
            disabled={isUploading || columnMapping.length === 0}>
            Import Mapped Data
          </LoadingButton>
        )}

        {activeTab === 2 && (
          <LoadingButton
            onClick={handleImportMappedData}
            color="primary"
            variant="contained"
            loading={isUploading}
            disabled={isUploading}>
            Import Mapped Data
          </LoadingButton>
        )}

        <LoadingButton onClick={handleClose} color="primary" variant="outlined">
          {uploadStatus === UploadFileStatus.COMPLETE ? 'Close' : 'Cancel'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
