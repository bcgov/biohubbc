import Box from '@material-ui/core/Box';
//import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
//import Link from '@material-ui/core/Link';
//import Paper from '@material-ui/core/Paper';
//import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { mdiUploadOutline } from '@mdi/js';
import Icon from '@mdi/react';
import AttachmentsList from 'components/attachments/AttachmentsList';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse, IGetTemplateObservations } from 'interfaces/useSurveyApi.interface';
import { default as React, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

export interface ITemplateObservationProps {
  projectForViewData: IGetProjectForViewResponse;
  surveyForViewData: IGetSurveyForViewResponse;
}

/**
 * Template content.
 *
 * @return {*}
 */
const TemplateObservationPage: React.FC<ITemplateObservationProps> = () => {
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const surveyId = urlParams['survey_id'];
  const biohubApi = useBiohubApi();
  const [openUploadTemplateObservations, setOpenUploadTemplateObservations] = useState(false);
  const [templateObservationsList, setTemplateObservationsList] = useState<IGetTemplateObservations[]>([]);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(true);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);
  const [surveyWithDetails, setSurveyWithDetails] = useState<IGetSurveyForViewResponse | null>(null);

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await biohubApi.project.getProjectForView(projectId);

    if (!projectWithDetailsResponse) {
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [biohubApi.project, urlParams]);

  const getSurvey = useCallback(async () => {
    const surveyWithDetailsResponse = await biohubApi.survey.getSurveyForView(projectId, surveyId);

    if (!surveyWithDetailsResponse) {
      return;
    }

    setSurveyWithDetails(surveyWithDetailsResponse);
  }, [biohubApi.survey, urlParams]);

  const getTemplateObservations = useCallback(
    async (forceFetch: boolean) => {
      if (templateObservationsList.length && !forceFetch) {
        return;
      }

      try {
        const response = await biohubApi.survey.getTemplateObservations(projectId, surveyId);

        if (!response?.templateObservationsList) {
          return;
        }

        setTemplateObservationsList([...response.templateObservationsList]);
      } catch (error) {
        return error;
      }
    },
    [biohubApi.survey, projectId, surveyId, templateObservationsList.length]
  );

  useEffect(() => {
    if (isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(false);
    }
  }, [isLoadingProject, projectWithDetails, getProject]);

  useEffect(() => {
    if (isLoadingSurvey && !surveyWithDetails) {
      getSurvey();
      setIsLoadingSurvey(false);
    }
  }, [isLoadingSurvey, surveyWithDetails, getSurvey]);

  useEffect(() => {
    getTemplateObservations(false);
    // eslint-disable-next-line
  }, []);

  const uploadTemplateObservations = (): IUploadHandler => {
    return (files, cancelToken, handleFileUploadProgress) => {
      return biohubApi.survey.uploadTemplateObservations(
        projectId,
        surveyId,
        files[0],
        cancelToken,
        handleFileUploadProgress
      );
    };
  };

  if (!projectWithDetails || !surveyWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Box my={3}>
        <Container>
          <ComponentDialog
            open={openUploadTemplateObservations}
            dialogTitle="Upload template"
            onClose={() => {
              getTemplateObservations(true);
              setOpenUploadTemplateObservations(false);
            }}>
            <FileUpload uploadHandler={uploadTemplateObservations()} />
          </ComponentDialog>

          <Box mb={5}>
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography variant="h2">Template Observations</Typography>
              </Box>
              <Box>
                <Button variant="outlined" onClick={() => setOpenUploadTemplateObservations(true)}>
                  <Icon path={mdiUploadOutline} size={1} />
                  <Typography>Upload</Typography>
                </Button>
              </Box>
            </Box>
          </Box>
          <Box mb={3}>
            <AttachmentsList
              projectId={projectId}
              surveyId={surveyId}
              attachmentsList={templateObservationsList}
              getAttachments={getTemplateObservations}
            />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default TemplateObservationPage;
