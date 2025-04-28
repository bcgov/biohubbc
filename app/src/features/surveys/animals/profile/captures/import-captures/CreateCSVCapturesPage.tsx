import LoadingButton from '@mui/lab/LoadingButton';
import { Divider } from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import axios, { AxiosProgressEvent } from 'axios';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { FileUploadSingleItem } from 'components/file-upload/FileUploadSingleItem';
import PageHeader from 'components/layout/PageHeader';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useAnimalPageContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { useCallback, useMemo, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { CSVError, isCSVValidationError } from 'utils/csv-utils';
import { downloadFile } from 'utils/file-utils';
import { getAxiosProgress } from 'utils/Utils';
import { CSVDropzoneSection } from '../../../../../../components/csv/CSVDropzoneSection';
import {
  getCapturesCSVTemplate,
  getMarkingsCSVTemplate,
  getMeasurementsCSVTemplate
} from '../../../../../../utils/csv-templates';

type CSVFilesStatus = {
  captures: { file: File | null; status: UploadFileStatus; progress: number; error?: string; errors: CSVError[] };
  measurements: { file: File | null; status: UploadFileStatus; progress: number; error?: string; errors: CSVError[] };
  markings: { file: File | null; status: UploadFileStatus; progress: number; error?: string; errors: CSVError[] };
};

const INITIAL_FILE_STATE = {
  file: null,
  status: UploadFileStatus.PENDING,
  progress: 0,
  error: undefined,
  errors: []
};

type UpdateFileState = {
  fileType: keyof CSVFilesStatus;
} & {
  file?: File | null;
  status?: UploadFileStatus;
  progress?: number;
  error?: string;
  errors?: CSVError[];
};

/**
 * Page to create Captures + Measurements + Markings from CSV files.
 *
 * @returns {*}
 */
export const CreateCSVCapturesPage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const { locationChangeInterceptor, skipUnsavedChangesDialog } = useUnsavedChangesDialog();
  const dialogContext = useDialogContext();

  const surveyContext = useSurveyContext();
  const animalPageContext = useAnimalPageContext();

  const { surveyId } = surveyContext;

  // Initialize the file upload states
  const [files, setFiles] = useState<CSVFilesStatus>({
    captures: INITIAL_FILE_STATE,
    measurements: INITIAL_FILE_STATE,
    markings: INITIAL_FILE_STATE
  });

  // When any of the files are uploading
  const isUploading = useMemo(() => {
    return Object.values(files).some(
      (key) => key.status === UploadFileStatus.UPLOADING || key.status === UploadFileStatus.FINISHING_UPLOAD
    );
  }, [files]);

  const cancelToken = axios.CancelToken.source();

  /**
   * Update a specific file's state.
   *
   * @param {UpdateFileState} config - Partial state to update.
   * @example handleFileState({ fileType: 'captures', status: UploadFileStatus.COMPLETE, progress: 100 });
   */
  const handleFileState = (config: UpdateFileState) => {
    setFiles((prevState) => ({ ...prevState, [config.fileType]: { ...prevState[config.fileType], ...config } }));
  };

  /**
   * Handle a file upload and update the uploading state.
   *
   * @async
   * @param {keyof typeof files} fileType - The type of file being uploaded ie: `captures`.
   * @param {(file: File | null) => void} onUpload - The callback to handle the file upload.
   * @returns {Promise<UploadFileStatus>} Returns the final `UploadFileStatus` to prevent race condtions.
   */
  const handleFileUpload = useCallback(
    async (
      fileType: keyof typeof files,
      onUpload: (file: File, onProgress: (progressEvent: AxiosProgressEvent) => void) => Promise<unknown>
    ) => {
      // If the file exists and is in the `STAGED` state, upload the file.
      if (files[fileType].file && files[fileType].status === UploadFileStatus.STAGED) {
        try {
          handleFileState({ fileType, status: UploadFileStatus.UPLOADING });

          // Pass the file and the onProgress callback to the upload handler
          await onUpload(files[fileType].file as File, (progressEvent: AxiosProgressEvent) => {
            // Update the progress of the file upload
            handleFileState({ fileType, progress: getAxiosProgress(progressEvent) });

            if (progressEvent.loaded === progressEvent.total) {
              handleFileState({ fileType, status: UploadFileStatus.FINISHING_UPLOAD });
            }
          });

          handleFileState({ fileType, status: UploadFileStatus.COMPLETE });

          return UploadFileStatus.COMPLETE; // Return the final status to prevent race conditions with state
        } catch (error: any) {
          handleFileState({
            fileType,
            status: UploadFileStatus.FAILED,
            progress: 100,
            error: error.message ?? 'Unknown error',
            errors: isCSVValidationError(error) ? error.errors : []
          });

          return UploadFileStatus.FAILED; // Return the final status to prevent race conditions with state
        }
      }
      return files[fileType].status;
    },
    [files]
  );

  /**
   * Handle all file uploads in order. `Captures` take precedence over `Measurements` and `Markings`.
   *
   * Why? `Measurements` and `Markings` are dependent on `Captures` existing before they can be uploaded.
   *
   * @async
   * @returns {Promise<void>}
   */
  const handleAllFileUploads = async () => {
    // Attempt to upload the captures first
    const captureStatus = await handleFileUpload('captures', (file, onProgress) =>
      biohubApi.survey.importCapturesFromCsv(file, surveyId, cancelToken, onProgress)
    );

    // If the Captures CSV upload failed, don't attempt to upload Measurements or Markings
    if (captureStatus === UploadFileStatus.FAILED) {
      return;
    }

    // Measurements / Markings can be uploaded in parallel
    const [measurementStatus, markingStatus] = await Promise.all([
      handleFileUpload('measurements', (file, onProgress) =>
        biohubApi.survey.importMeasurementsFromCsv(file, surveyId, cancelToken, onProgress)
      ),
      handleFileUpload('markings', (file, onProgress) =>
        biohubApi.survey.importMarkingsFromCsv(file, surveyId, cancelToken, onProgress)
      )
    ]);

    if (measurementStatus === UploadFileStatus.FAILED || markingStatus === UploadFileStatus.FAILED) {
      return;
    }

    dialogContext.setSnackbar({
      open: true,
      snackbarMessage: (
        <Typography variant="body2" component="div">
          CSV files uploaded successfully.
        </Typography>
      )
    });

    if (animalPageContext.selectedAnimal) {
      animalPageContext.critterDataLoader.refresh(surveyId, animalPageContext.selectedAnimal.critter_id);
    }

    skipUnsavedChangesDialog();
    history.push(`/admin/surveys/${surveyId}/animals`);
  };

  /**
   * On cancel, navigate back to the animals page.
   *
   * @returns {void}
   */
  const handleCancel = (): void => {
    cancelToken.cancel();
    history.push(`/admin/surveys/${surveyId}/animals`);
  };

  /**
   * Get the props for the file upload component
   *
   * @param {keyof CSVFilesStatus} fileType - The type of file to get the props for
   * @returns {*} {FileUploadSingleItemProps} The props for the file upload component
   */
  const getFileUploadProps = (fileType: keyof CSVFilesStatus) => {
    return {
      file: files[fileType].file,
      status: files[fileType].status,
      progress: files[fileType].progress,
      error: files[fileType].error,
      onStatus: (status: UploadFileStatus) => handleFileState({ fileType, status }),
      onFile: (file: File | null) => handleFileState({ fileType, file }),
      onError: (error: string) => handleFileState({ fileType, error }),
      onCancel: () => handleFileState({ fileType, ...INITIAL_FILE_STATE }),
      DropZoneProps: { acceptedFileExtensions: '.csv' }
    };
  };

  return (
    <>
      <Prompt when={true} message={locationChangeInterceptor} />
      <PageHeader
        title="Create Captures"
        breadCrumbJSX={
          <Breadcrumbs aria-label="breadcrumb" separator={'>'}>
            <Link component={RouterLink} underline="hover" to={`/admin/projects/${projectId}/`}>
              {projectContext.projectDataLoader.data?.projectData.project.project_name}
            </Link>
            <Link component={RouterLink} underline="hover" to={`/admin/surveys/${surveyId}`}>
              {surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name}
            </Link>
            <Link component={RouterLink} underline="hover" to={`/admin/surveys/${surveyId}/animals`}>
              Manage Animals
            </Link>
            <Typography variant="body2" component="span" color="textSecondary" aria-current="page">
              Create Captures
            </Typography>
          </Breadcrumbs>
        }
        buttonJSX={
          <Stack flexDirection="row" gap={1}>
            <LoadingButton
              disabled={isUploading}
              loading={isUploading}
              color="primary"
              variant="contained"
              onClick={handleAllFileUploads}>
              Upload
            </LoadingButton>
            <Button disabled={isUploading} color="primary" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 5 }}>
          <Stack gap={5}>
            <CSVDropzoneSection
              title="Captures"
              summary="Upload the capture times and locations"
              onDownloadTemplate={() => downloadFile(getCapturesCSVTemplate(), 'SIMS-captures-template.csv')}
              errors={files.captures.errors}>
              <FileUploadSingleItem {...getFileUploadProps('captures')} />
            </CSVDropzoneSection>
            <Divider />

            <CSVDropzoneSection
              title="Measurements"
              summary="Upload measurements taken during the captures"
              onDownloadTemplate={() => downloadFile(getMeasurementsCSVTemplate(), 'SIMS-measurements-template.csv')}
              errors={files.measurements.errors}>
              <FileUploadSingleItem {...getFileUploadProps('measurements')} />
            </CSVDropzoneSection>
            <Divider />

            <CSVDropzoneSection
              title="Markings"
              summary="Upload markings applied during the captures"
              onDownloadTemplate={() => downloadFile(getMarkingsCSVTemplate(), 'SIMS-markings-template.csv')}
              errors={files.markings.errors}>
              <FileUploadSingleItem {...getFileUploadProps('markings')} />
            </CSVDropzoneSection>
            <Divider />
          </Stack>

          <Stack mt={4} flexDirection="row" justifyContent="flex-end" gap={1}>
            <LoadingButton
              loading={isUploading}
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleAllFileUploads}
              disabled={isUploading}>
              Upload
            </LoadingButton>
            <Button disabled={isUploading} variant="outlined" color="primary" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};
