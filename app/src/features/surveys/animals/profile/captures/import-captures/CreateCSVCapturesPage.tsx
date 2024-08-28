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
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import PageHeader from 'components/layout/PageHeader';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { useCallback, useMemo, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { SingleFileUpload } from './SingleFileUpload';

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

  const [files, setFiles] = useState<CSVFilesStatus>({
    captures: { file: null, status: UploadFileStatus.PENDING, progress: 0 },
    measurements: { file: null, status: UploadFileStatus.PENDING, progress: 0 },
    markings: { file: null, status: UploadFileStatus.PENDING, progress: 0 }
  });

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

          await onUpload(files[fileType].file as File, (progressEvent: AxiosProgressEvent) => {
            // Get axios progress through the onProgress event listener.
            const progress = Math.round((progressEvent.loaded / (progressEvent.total || 1)) * 100);

            handleFileState({ fileType, progress });

            if (progressEvent.loaded === progressEvent.total) {
              handleFileState({ fileType, status: UploadFileStatus.FINISHING_UPLOAD });
            }
          });

          handleFileState({ fileType, status: UploadFileStatus.COMPLETE });

          return UploadFileStatus.COMPLETE;
        } catch (error: any) {
          handleFileState({ fileType, status: UploadFileStatus.FAILED, error: error.message ?? 'Unknown error' });

          return UploadFileStatus.FAILED;
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
   * There is a case where `Captures` already exist and the user is creating new `Measurements` or `Markings`.
   *
   * @async
   * @returns {Promise<void>}
   */
  const handleAllFileUploads = async () => {
    const cancelToken = axios.CancelToken.source();

    const captureUploadStatus = await handleFileUpload('captures', (file, onProgress) =>
      biohubApi.survey.importCapturesFromCsv(file, projectId, surveyId, cancelToken, onProgress)
    );

    if (captureUploadStatus !== UploadFileStatus.FAILED) {
      // Measurements / Markings can be uploaded in parallel
      await Promise.all([
        handleFileUpload('measurements', (file, onProgress) =>
          biohubApi.survey.importMeasurementsFromCsv(file, projectId, surveyId, cancelToken, onProgress)
        ),
        handleFileUpload('markings', (file, onProgress) =>
          biohubApi.survey.importMarkingsFromCsv(file, projectId, surveyId, cancelToken, onProgress)
        )
      ]);
    }
  };

  const handleCancel = () => {
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
              <SingleFileUpload
                {...files.captures}
                onChangeStatus={(status) => handleFileState({ fileType: 'captures', status })}
                onFileDropzone={(file) => handleFileState({ fileType: 'captures', file })}
                onFileCancel={() =>
                  handleFileState({
                    fileType: 'captures',
                    status: UploadFileStatus.PENDING,
                    error: undefined,
                    progress: undefined
                  })
                }
              />
            </HorizontalSplitFormComponent>
            <Divider />

            <HorizontalSplitFormComponent title="Measurements" summary="Upload measurements taken during the captures">
              <SingleFileUpload
                {...files.measurements}
                onChangeStatus={(status) => handleFileState({ fileType: 'measurements', status })}
                onFileDropzone={(file) => handleFileState({ fileType: 'measurements', file })}
                onFileCancel={() =>
                  handleFileState({
                    fileType: 'measurements',
                    status: UploadFileStatus.PENDING,
                    error: undefined,
                    progress: undefined
                  })
                }
              />
            </HorizontalSplitFormComponent>
            <Divider />

            <HorizontalSplitFormComponent title="Markings" summary="Upload markings applied during the captures">
              <SingleFileUpload
                {...files.markings}
                onChangeStatus={(status) => handleFileState({ fileType: 'markings', status })}
                onFileDropzone={(file) => handleFileState({ fileType: 'markings', file })}
                onFileCancel={() =>
                  handleFileState({
                    fileType: 'markings',
                    status: UploadFileStatus.PENDING,
                    error: undefined,
                    progress: undefined
                  })
                }
              />
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
