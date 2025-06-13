// filepath: c:\Users\anthomps\VSC\biohub2\biohubbc\app\src\components\csv\CSVSingleImportDialog.tsx
import DownloadIcon from '@mui/icons-material/Download';
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import { Box, Dialog, DialogActions, DialogContent, Divider, Tab, Tabs, useMediaQuery, useTheme } from '@mui/material';
import { AxiosProgressEvent } from 'axios';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { FileUploadSingleItem } from 'components/file-upload/FileUploadSingleItem';
import { DialogContext } from 'contexts/dialogContext';
import { saveAs } from 'file-saver';
import { useBiohubApi } from 'hooks/useBioHubApi';
import Papa from 'papaparse';
import { useContext, useEffect, useState } from 'react';
import { isCSVValidationError } from 'utils/csv-utils';
import { getAxiosProgress, waitForRenderCycle } from 'utils/Utils';
import { ColumnMapping, CSVColumnMapping } from './CSVColumnMapping';
import { CSVDropzoneSection } from './CSVDropzoneSection';
import { CSVTransformOptions } from './CSVTransformOptions';
import { CSVValueMapping, ValueMapping } from './CSVValueMapping';
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
  const [mappedResult, setMappedResult] = useState<{ mappedCsv: string; mappedFilename: string; blob: Blob } | null>(
    null
  );
  const [transformOptions, setTransformOptions] = useState<WideToTallOptions>({
    valueVars: [],
    excludeColumns: [],
    variableColumnName: 'variable'
  });
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [valueMapping, setValueMapping] = useState<ValueMapping[]>([]);
  const [tsn, setTsn] = useState<number | null>(null);
  const [systemColumns, setSystemColumns] = useState<string[]>([]);
  const [standardizedValues, setStandardizedValues] = useState<Record<string, string[]>>({});
  const biohubApi = useBiohubApi();
  const standardsApi = biohubApi.standards;

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
    setMappedResult(null);
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
        setProgress(getAxiosProgress(progressEvent));
        if (progressEvent.loaded === progressEvent.total) {
          setUploadStatus(UploadFileStatus.FINISHING_UPLOAD);
        }
      });

      setTransformResult(result);
      // Automatically set the transformed file as the current file in the dropzone
      let originalName = file ? file.name.replace(/\.csv$/i, '') : 'transformed';
      const transformedFile = new File([result.blob], `${originalName} - SIMS Transformed.csv`, {
        type: 'text/csv'
      });
      setFile(transformedFile);
      setUploadStatus(UploadFileStatus.COMPLETE);

      dialogContext.setSnackbar({
        open: true,
        snackbarAutoCloseMs: 2000,
        snackbarMessage: 'Successfully transformed CSV file'
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
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
      // Use the original file name with ' - SIMS Transformed.csv' suffix, but avoid double appending
      let originalName = file
        ? file.name.replace(/ - SIMS Transformed\.csv$/i, '').replace(/\.csv$/i, '')
        : 'transformed';
      const downloadName = `${originalName} - SIMS Transformed.csv`;
      saveAs(transformResult.blob, downloadName);

      // Show a success snackbar message
      dialogContext.setSnackbar({
        open: true,
        snackbarAutoCloseMs: 2000,
        snackbarMessage: 'Downloaded transformed CSV file'
      });
    }
  };

  /**
   * Handle just mapping the columns without downloading or importing
   *
   * @returns {Promise<void>}
   */
  const handleMapColumns = async (): Promise<void> => {
    if (!file) {
      return;
    }

    try {
      setUploadStatus(UploadFileStatus.UPLOADING);
      setProgress(25);

      const result = await applyMappingToCsv();

      // Create a File object from the mapped data
      const mappedFile = new File([result.blob], result.mappedFilename, {
        type: 'text/csv'
      });

      // Replace the current file with the mapped file
      setFile(mappedFile);

      // Store the result
      setMappedResult({
        mappedCsv: result.mappedCsv,
        mappedFilename: result.mappedFilename,
        blob: result.blob
      });

      // Update progress
      setProgress(100);

      // Show a success snackbar message
      dialogContext.setSnackbar({
        open: true,
        snackbarAutoCloseMs: 2000,
        snackbarMessage: 'Successfully mapped columns and updated current file'
      });

      setUploadStatus(UploadFileStatus.COMPLETE);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }

      // Show a failure snackbar message
      dialogContext.setSnackbar({
        open: true,
        snackbarAutoCloseMs: 2000,
        snackbarMessage: 'Failed to map columns'
      });

      setUploadStatus(UploadFileStatus.FAILED);
    }
  };

  /**
   * Handle downloading the mapped CSV file
   *
   * @returns {void}
   */
  const handleDownloadMappedData = (): void => {
    if (mappedResult) {
      saveAs(mappedResult.blob, mappedResult.mappedFilename);

      // Show a success snackbar message
      dialogContext.setSnackbar({
        open: true,
        snackbarAutoCloseMs: 2000,
        snackbarMessage: 'Downloaded mapped CSV file'
      });
    }
  };

  /**
   * Apply column mapping or value mapping to the CSV file
   *
   * @returns {Promise<{ mappedData: Record<string, any>[], mappedCsv: string, mappedFilename: string, blob: Blob }>}
   */
  const applyMappingToCsv = async () => {
    if (!file) {
      throw new Error('No file selected');
    }

    // Check if we have mappings to apply
    const hasColumnMappings = columnMapping.length > 0 && activeTab === 2;

    // Check if we have value mappings that actually change values (where originalValue !== newValue)
    const effectiveValueMappings = valueMapping.filter((m) => m.originalValue !== m.newValue);
    const hasValueMappings = effectiveValueMappings.length > 0 && activeTab === 3;

    if (!hasColumnMappings && !hasValueMappings) {
      throw new Error('No mappings to apply');
    }

    // Parse the CSV file
    const csvData = await new Promise<Papa.ParseResult<Record<string, any>>>((resolve, reject) => {
      Papa.parse<Record<string, any>>(file, {
        header: true,
        dynamicTyping: true,
        complete: resolve,
        error: reject
      });
    });

    // Apply the mapping (either column mapping or value mapping)
    const mappedData = csvData.data.map((row) => {
      if (hasColumnMappings) {
        // Apply column mapping
        const newRow: Record<string, any> = {};

        columnMapping.forEach((mapping) => {
          if (mapping.targetColumn === 'keep_original') {
            // Keep the original column name
            newRow[mapping.sourceColumn] = row[mapping.sourceColumn];
          } else if (mapping.targetColumn && mapping.targetColumn !== 'custom') {
            // Use the selected column name
            newRow[mapping.targetColumn] = row[mapping.sourceColumn];
          }
        });

        return newRow;
      } else if (hasValueMappings) {
        // Apply value mapping but keep the same column structure
        const newRow = { ...row };

        // Go through all value mappings that have actual changes
        effectiveValueMappings.forEach((mapping) => {
          // If the column exists in this row and the value matches
          if (
            mapping.column in row &&
            row[mapping.column] !== null &&
            row[mapping.column] !== undefined &&
            row[mapping.column].toString() === mapping.originalValue
          ) {
            // Replace the value
            newRow[mapping.column] = mapping.newValue;
            console.log(
              `Mapped value in column "${mapping.column}": "${mapping.originalValue}" → "${mapping.newValue}"`
            );
          }
        });

        return newRow;
      }

      return row;
    });

    // Convert back to CSV
    const mappedCsv = Papa.unparse(mappedData);
    const blob = new Blob([mappedCsv], { type: 'text/csv;charset=utf-8' });
    const mappingType = hasColumnMappings ? 'column_mapped' : 'value_mapped';
    const mappedFilename = `${file.name.replace('.csv', '')}_${mappingType}.csv`;

    return { mappedData, mappedCsv, mappedFilename, blob };
  }; /**
   * Handle mapping values
   *
   * @returns {Promise<void>}
   */
  const handleMapValues = async (): Promise<void> => {
    if (!file) {
      return;
    }

    try {
      setUploadStatus(UploadFileStatus.UPLOADING);
      setProgress(25);

      const result = await applyMappingToCsv();

      // Create a File object from the mapped data
      const mappedFile = new File([result.blob], result.mappedFilename, {
        type: 'text/csv'
      });

      // Replace the current file with the mapped file
      setFile(mappedFile);

      // Store the result
      setMappedResult({
        mappedCsv: result.mappedCsv,
        mappedFilename: result.mappedFilename,
        blob: result.blob
      });

      // Update progress
      setProgress(100);

      // Show a success snackbar message
      dialogContext.setSnackbar({
        open: true,
        snackbarAutoCloseMs: 2000,
        snackbarMessage: `Successfully mapped ${activeTab === 3 ? 'values' : 'columns'} and updated current file`
      });

      setUploadStatus(UploadFileStatus.COMPLETE);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }

      // Show a failure snackbar message
      dialogContext.setSnackbar({
        open: true,
        snackbarAutoCloseMs: 2000,
        snackbarMessage: 'Failed to map values'
      });

      setUploadStatus(UploadFileStatus.FAILED);
    }
  };

  // Extract TSN from the CSV file
  useEffect(() => {
    if (!file) {
      setTsn(null);
      return;
    }
    Papa.parse(file, {
      header: true,
      preview: 1,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const row = results.data[0] as Record<string, any>;
          // Try to find a column named 'itis_tsn' (case-insensitive)
          const tsnValue = Object.entries(row).find(([key]) => key.toLowerCase() === 'itis_tsn')?.[1];
          if (tsnValue && !isNaN(Number(tsnValue))) {
            setTsn(Number(tsnValue));
          }
        }
      }
    });
  }, [file]);

  // Fetch standards and set system columns - only when not in column mapping tab
  useEffect(() => {
    if (!tsn || activeTab === 2) {
      // Skip fetching if in column mapping tab (tab 2)
      return;
    }
    standardsApi.getSpeciesStandards(tsn).then((standards) => {
      const qualitative = standards.measurements.qualitative.map((m) => m.measurement_name);
      const quantitative = standards.measurements.quantitative.map((m) => m.measurement_name);
      setSystemColumns([...qualitative, ...quantitative]);

      // Also prepare standardized values for the value mapping tab
      const stdValues: Record<string, string[]> = {};

      // Add qualitative measurement options to standardized values
      standards.measurements.qualitative.forEach((measurement) => {
        if (measurement.options && measurement.options.length > 0) {
          stdValues[measurement.measurement_name] = measurement.options.map((option) => option.option_label);
        }
      });

      setStandardizedValues(stdValues);
    });
  }, [tsn, standardsApi, activeTab]);

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
                onChange={(_, newValue) => {
                  // Reset mappedResult when changing tabs
                  if (newValue !== activeTab) {
                    setMappedResult(null);
                  }
                  setActiveTab(newValue);
                }}
                aria-label="CSV options tabs"
                sx={{ mb: 2 }}>
                <Tab label="1. Import" />
                <Tab label="2. Transform" />
                <Tab label="3. Map Columns" />
                <Tab label="4. Map Values" />
              </Tabs>

              {activeTab === 1 && <CSVTransformOptions file={file} onTransformOptionsChange={setTransformOptions} />}
              {activeTab === 2 && (
                <CSVColumnMapping
                  file={file}
                  onColumnMappingChange={setColumnMapping}
                  systemColumns={systemColumns}
                  onTsnSelected={(selectedTsn) => {
                    setTsn(selectedTsn);
                  }}
                />
              )}
              {activeTab === 3 && (
                <CSVValueMapping
                  file={file}
                  onValueMappingChange={setValueMapping}
                  standardizedValues={standardizedValues}
                  onFileUpdate={(newFile, fileName) => {
                    // Replace the current file with the mapped file
                    setFile(newFile);

                    // Create blob for download
                    const blob = new Blob([newFile], { type: 'text/csv;charset=utf-8' });

                    // Store the result for possible download
                    setMappedResult({
                      mappedCsv: '', // We don't need the actual CSV text
                      mappedFilename: fileName,
                      blob: blob
                    });

                    // Show a success message
                    dialogContext.setSnackbar({
                      open: true,
                      snackbarAutoCloseMs: 2000,
                      snackbarMessage: `Successfully mapped values and updated to ${fileName}`
                    });
                  }}
                />
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <Divider />

      <DialogActions>
        {activeTab === 0 && (
          <>
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
            <LoadingButton
              onClick={() => setActiveTab(1)}
              color="primary"
              variant="outlined"
              disabled={isUploading}
              sx={{ ml: 2 }}>
              Continue to Transform
            </LoadingButton>
          </>
        )}

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
                  onClick={() => setActiveTab(2)}
                  color="primary"
                  variant="outlined"
                  disabled={isUploading}
                  sx={{ ml: 2 }}>
                  Continue to Mapping Columns
                </LoadingButton>
              </>
            )}
          </>
        )}

        {activeTab === 2 && (
          <>
            {!mappedResult ? (
              <LoadingButton
                onClick={handleMapColumns}
                color="primary"
                variant="contained"
                loading={isUploading}
                disabled={isUploading || columnMapping.length === 0}>
                Map Columns
              </LoadingButton>
            ) : (
              <>
                <LoadingButton
                  onClick={handleDownloadMappedData}
                  color="primary"
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  disabled={isUploading}>
                  Download Mapped Data
                </LoadingButton>
                <LoadingButton
                  onClick={() => setActiveTab(3)}
                  color="primary"
                  variant="outlined"
                  disabled={isUploading}
                  sx={{ ml: 2 }}>
                  Continue to Renaming Column Values
                </LoadingButton>
                <LoadingButton
                  onClick={handleMapColumns}
                  color="primary"
                  variant="outlined"
                  disabled={isUploading}
                  sx={{ ml: 2 }}>
                  Map Again
                </LoadingButton>
              </>
            )}
          </>
        )}

        {activeTab === 3 && (
          <>
            {!mappedResult ? (
              <LoadingButton
                onClick={handleMapValues}
                color="primary"
                variant="contained"
                loading={isUploading}
                disabled={isUploading || valueMapping.filter((m) => m.originalValue !== m.newValue).length === 0}>
                Map Values
              </LoadingButton>
            ) : (
              <>
                <LoadingButton
                  onClick={handleDownloadMappedData}
                  color="primary"
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  disabled={isUploading}>
                  Download Mapped Data
                </LoadingButton>
                <LoadingButton
                  onClick={() => {
                    handleCSVFileImport(file);
                  }}
                  color="primary"
                  variant="contained"
                  loading={isUploading}
                  disabled={isUploading}
                  sx={{ ml: 2 }}>
                  Import
                </LoadingButton>
              </>
            )}
          </>
        )}

        <LoadingButton onClick={handleClose} color="primary" variant="outlined">
          {uploadStatus === UploadFileStatus.COMPLETE ? 'Close' : 'Cancel'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
