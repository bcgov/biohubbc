import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Divider } from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import axios, { AxiosProgressEvent } from 'axios';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import { FileUploadSingleItem } from 'components/file-upload/FileUploadSingleItem';
import PageHeader from 'components/layout/PageHeader';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useProjectContext, useSurveyContext } from 'hooks/useContext';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { useCallback, useMemo, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { downloadFile } from 'utils/file-utils';
import { getAxiosProgress } from 'utils/Utils';
import { getCapturesCSVTemplate, getMarkingsCSVTemplate, getMeasurementsCSVTemplate } from './utils/templates';

type CSVFilesStatus = {
  captures: { file: File | null; status: UploadFileStatus; progress: number; error?: string };
  measurements: { file: File | null; status: UploadFileStatus; progress: number; error?: string };
  markings: { file: File | null; status: UploadFileStatus; progress: number; error?: string };
};

type UpdateFileState = {
  fileType: keyof CSVFilesStatus;
} & {
  file?: File | null;
  status?: UploadFileStatus;
  progress?: number;
  error?: string;
};

/**
 * Page to create Captures + Measurements + Markings from CSV files.
 *
 * @returns {*}
 */
export const CreateCSVCapturesPage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();

  const { projectId, surveyId } = surveyContext;

  // Initialize the file upload states
  const [files, setFiles] = useState<CSVFilesStatus>({
    captures: { file: null, status: UploadFileStatus.PENDING, progress: 0 },
    measurements: { file: null, status: UploadFileStatus.PENDING, progress: 0 },
    markings: { file: null, status: UploadFileStatus.PENDING, progress: 0 }
  });

  // When any of the files are uploading
  const isUploading = useMemo(() => {
    return Object.values(files).some((key) => key.status === UploadFileStatus.UPLOADING);
  }, [files]);

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
          handleFileState({ fileType, status: UploadFileStatus.FAILED, error: error.message ?? 'Unknown error' });

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
    const cancelToken = axios.CancelToken.source();

    // Attempt to upload the captures first
    const captureUploadStatus = await handleFileUpload('captures', (file, onProgress) =>
      biohubApi.survey.importCapturesFromCsv(file, projectId, surveyId, cancelToken, onProgress)
    );

    // If the Captures CSV upload failed, don't attempt to upload Measurements or Markings
    if (captureUploadStatus !== UploadFileStatus.FAILED) {
      // Measurements / Markings can be uploaded in parallel
      const [measurementUploadStatus, markingUploadStatus] = await Promise.all([
        handleFileUpload('measurements', (file, onProgress) =>
          biohubApi.survey.importMeasurementsFromCsv(file, projectId, surveyId, cancelToken, onProgress)
        ),
        handleFileUpload('markings', (file, onProgress) =>
          biohubApi.survey.importMarkingsFromCsv(file, projectId, surveyId, cancelToken, onProgress)
        )
      ]);

      if (measurementUploadStatus !== UploadFileStatus.FAILED || markingUploadStatus !== UploadFileStatus.FAILED) {
        history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals`, SKIP_CONFIRMATION_DIALOG);
      }
    }
  };

  /**
   * On cancel, navigate back to the animals page.
   *
   * @returns {void}
   */
  const handleCancel = (): void => {
    history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals`);
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
            <Link component={RouterLink} underline="hover" to={`/admin/projects/${projectId}/surveys/${surveyId}`}>
              {surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name}
            </Link>
            <Link
              component={RouterLink}
              underline="hover"
              to={`/admin/projects/${projectId}/surveys/${surveyId}/animals`}>
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
            <HorizontalSplitFormComponent title="Captures" summary="Upload the capture times and locations">
              <Box sx={{ display: 'flex', flexDirection: 'column' }} gap={2}>
                <Button
                  sx={{ ml: 'auto', textTransform: 'none', fontWeight: 'regular' }}
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    downloadFile(getCapturesCSVTemplate(), 'SIMS-captures-template.csv');
                  }}>
                  Download Template
                </Button>
                <FileUploadSingleItem
                  {...files.captures}
                  onStatus={(status) => handleFileState({ fileType: 'captures', status })}
                  onFile={(file) => handleFileState({ fileType: 'captures', file })}
                  onError={(error) => handleFileState({ fileType: 'captures', error })}
                  onCancel={() =>
                    handleFileState({
                      fileType: 'captures',
                      status: UploadFileStatus.PENDING,
                      error: undefined,
                      progress: undefined
                    })
                  }
                  DropZoneProps={{ acceptedFileExtensions: '.csv' }}
                />
              </Box>
            </HorizontalSplitFormComponent>
            <Divider />

            <HorizontalSplitFormComponent title="Measurements" summary="Upload measurements taken during the captures">
              <Box sx={{ display: 'flex', flexDirection: 'column' }} gap={2}>
                <Button
                  sx={{ ml: 'auto', textTransform: 'none', fontWeight: 'regular' }}
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    downloadFile(getMeasurementsCSVTemplate(), 'SIMS-measurements-template.csv');
                  }}>
                  Download Template
                </Button>
                <FileUploadSingleItem
                  {...files.measurements}
                  onStatus={(status) => handleFileState({ fileType: 'measurements', status })}
                  onFile={(file) => handleFileState({ fileType: 'measurements', file })}
                  onError={(error) => handleFileState({ fileType: 'measurements', error })}
                  onCancel={() =>
                    handleFileState({
                      fileType: 'measurements',
                      status: UploadFileStatus.PENDING,
                      error: undefined,
                      progress: undefined
                    })
                  }
                  DropZoneProps={{ acceptedFileExtensions: '.csv' }}
                />
              </Box>
            </HorizontalSplitFormComponent>
            <Divider />

            <HorizontalSplitFormComponent title="Markings" summary="Upload markings applied during the captures">
              <Box sx={{ display: 'flex', flexDirection: 'column' }} gap={2}>
                <Button
                  sx={{ ml: 'auto', textTransform: 'none', fontWeight: 'regular' }}
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    downloadFile(getMarkingsCSVTemplate(), 'SIMS-markings-template.csv');
                  }}>
                  Download Template
                </Button>
                <FileUploadSingleItem
                  {...files.markings}
                  onStatus={(status) => handleFileState({ fileType: 'markings', status })}
                  onFile={(file) => handleFileState({ fileType: 'markings', file })}
                  onError={(error) => handleFileState({ fileType: 'markings', error })}
                  onCancel={() =>
                    handleFileState({
                      fileType: 'markings',
                      status: UploadFileStatus.PENDING,
                      error: undefined,
                      progress: undefined
                    })
                  }
                  DropZoneProps={{ acceptedFileExtensions: '.csv' }}
                />
              </Box>
            </HorizontalSplitFormComponent>
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
