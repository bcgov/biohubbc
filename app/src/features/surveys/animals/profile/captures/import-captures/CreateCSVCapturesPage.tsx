import LoadingButton from '@mui/lab/LoadingButton';
import { Divider } from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { UploadFileStatus } from 'components/file-upload/FileUploadItem';
import PageHeader from 'components/layout/PageHeader';
import { useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { useCallback, useMemo, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { SingleFileUpload } from './SingleFileUpload';

type CSVFilesStatus = {
  captures: { file: File | null; status: UploadFileStatus; progress: number };
  measurements: { file: File | null; status: UploadFileStatus; progress: number };
  markings: { file: File | null; status: UploadFileStatus; progress: number };
};

type UpdateFileState = {
  fileType: keyof CSVFilesStatus;
} & {
  file?: File | null;
  status?: UploadFileStatus;
  progress?: number;
};

export const CreateCSVCapturesPage = () => {
  const history = useHistory();

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

  const handleFileState = (config: UpdateFileState) => {
    setFiles((prevState) => ({ ...prevState, [config.fileType]: { ...prevState[config.fileType], ...config } }));
  };

  const handleFileUpload = useCallback(
    async (fileType: keyof typeof files, onUpload: (file: File | null) => void) => {
      if (files[fileType].file && files[fileType].status === UploadFileStatus.STAGED) {
        try {
          handleFileState({ fileType, status: UploadFileStatus.UPLOADING });

          onUpload(files[fileType].file);

          // await biohubApi.survey.importCapturesFromCsv(files.captures.file, projectId, surveyId);
          handleFileState({ fileType, status: UploadFileStatus.COMPLETE });

          return UploadFileStatus.COMPLETE;
        } catch (error) {
          handleFileState({ fileType, status: UploadFileStatus.FAILED });

          return UploadFileStatus.FAILED;
        }
      }
      return files[fileType].status;
    },
    [files]
  );

  const handleUploadAllFiles = async () => {
    const captureUploadStatus = await handleFileUpload('captures', (file) => console.log('upload captures', file));

    if (captureUploadStatus !== UploadFileStatus.FAILED) {
      await handleFileUpload('measurements', (file) => console.log('upload measurements', file));
      await handleFileUpload('markings', (file) => console.log('upload markings', file));
    }
  };

  const handleCancel = () => {
    handleFileUpload;

    history.push(`/admin/projects/${projectId}/surveys/${surveyId}/animals/captures`);
  };

  return (
    <>
      <Prompt when={true} message={locationChangeInterceptor} />
      <Button onClick={() => handleFileState({ fileType: 'captures', status: UploadFileStatus.COMPLETE })}>
        uploading
      </Button>
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
              onClick={handleUploadAllFiles}>
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
                file={files.captures.file}
                status={files.captures.status}
                onChangeStatus={(status) => handleFileState({ fileType: 'captures', status })}
                onFileDrop={(file) => handleFileState({ fileType: 'captures', file })}
              />
            </HorizontalSplitFormComponent>
            <Divider />

            <HorizontalSplitFormComponent title="Measurements" summary="Upload measurements taken during the captures">
              <SingleFileUpload
                file={files.measurements.file}
                status={files.measurements.status}
                onChangeStatus={(status) => handleFileState({ fileType: 'measurements', status })}
                onFileDrop={(file) => handleFileState({ fileType: 'measurements', file })}
              />
            </HorizontalSplitFormComponent>
            <Divider />

            <HorizontalSplitFormComponent title="Markings" summary="Upload markings applied during the captures">
              <SingleFileUpload
                file={files.markings.file}
                status={files.markings.status}
                onChangeStatus={(status) => handleFileState({ fileType: 'markings', status })}
                onFileDrop={(file) => handleFileState({ fileType: 'markings', file })}
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
              onClick={handleUploadAllFiles}
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
