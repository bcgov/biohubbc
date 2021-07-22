import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { mdiUploadOutline } from '@mdi/js';
import Icon from '@mdi/react';
import TemplateObservationsList from 'components/template/TemplateObservationList';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse, IGetTemplateObservations } from 'interfaces/useSurveyApi.interface';
import { default as React, useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import Link from '@material-ui/core/Link';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

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
  const classes = useStyles();
  const urlParams = useParams();
  const history = useHistory();
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

  const handleBack = () => {
    history.push(`/projects/${projectId}/surveys/${surveyId}/observations`);
  };

  if (!projectWithDetails || !surveyWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Box my={3}>
        <Container maxWidth="xl">
          <Box mb={3}>
            <Breadcrumbs>
              <Link
                color="primary"
                onClick={() => history.push('/projects')}
                aria-current="page"
                className={classes.breadCrumbLink}>
                <Typography variant="body2">Projects</Typography>
              </Link>
              <Link
                color="primary"
                onClick={() => history.push(`/projects/${projectId}/surveys`)}
                aria-current="page"
                className={classes.breadCrumbLink}>
                <Typography variant="body2">{projectWithDetails.project.project_name}</Typography>
              </Link>
              <Link
                color="primary"
                onClick={() => history.push(`/projects/${projectId}/surveys/${surveyId}/observations`)}
                aria-current="page"
                className={classes.breadCrumbLink}>
                <Typography variant="body2">{surveyWithDetails.survey_details.survey_name}</Typography>
              </Link>
              <Typography variant="body2">Add Template Observations</Typography>
            </Breadcrumbs>
          </Box>

          <Box mb={5} display="flex" justifyContent="space-between">
            <Typography data-testid="template-observation-heading" variant="h1">
              Template Observations
            </Typography>

            <Box>
              <Button variant="outlined" onClick={() => setOpenUploadTemplateObservations(true)}>
                <Icon path={mdiUploadOutline} size={1} />
                <Typography>Upload</Typography>
              </Button>
            </Box>
          </Box>
          <Box>
            <ComponentDialog
              open={openUploadTemplateObservations}
              dialogTitle="Upload template"
              onClose={() => {
                getTemplateObservations(true);
                setOpenUploadTemplateObservations(false);
              }}>
              <FileUpload uploadHandler={uploadTemplateObservations()} />
            </ComponentDialog>
            <Box mb={3}>
              <TemplateObservationsList
                projectId={projectId}
                surveyId={surveyId}
                templateObservationsList={templateObservationsList}
                getTemplateObservations={getTemplateObservations}
              />
            </Box>
            <Box mt={2} pb={3} display="flex" justifyContent="flex-end">
              <Button
                variant="outlined"
                color="primary"
                data-testid="back-button"
                onClick={handleBack}
                className={classes.actionButton}>
                Back
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default TemplateObservationPage;
