import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import SurveyDetails from 'features/surveys/view/SurveyDetails';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import SurveyStudyArea from './components/SurveyStudyArea';
import SurveyAttachments from './SurveyAttachments';
import SurveyHeader from './SurveyHeader';
import SurveyObservations from './SurveyObservations';
import SurveySummaryResults from './SurveySummaryResults';

/**
 * Page to display a single Survey.
 *
 * @return {*}
 */
const SurveyPage: React.FC = () => {
  const urlParams = useParams();

  const biohubApi = useBiohubApi();

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);

  const [isLoadingSurvey, setIsLoadingSurvey] = useState(true);
  const [surveyWithDetails, setSurveyWithDetails] = useState<IGetSurveyForViewResponse | null>(null);

  const [isLoadingCodes, setIsLoadingCodes] = useState(true);
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await biohubApi.codes.getAllCodeSets();

      if (!codesResponse) {
        return;
      }

      setCodes(codesResponse);
    };

    if (isLoadingCodes && !codes) {
      getCodes();
      setIsLoadingCodes(false);
    }
  }, [urlParams, biohubApi.codes, isLoadingCodes, codes]);

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await biohubApi.project.getProjectForView(urlParams['id']);

    if (!projectWithDetailsResponse) {
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [biohubApi.project, urlParams]);

  const getSurvey = useCallback(async () => {
    const surveyWithDetailsResponse = await biohubApi.survey.getSurveyForView(urlParams['id'], urlParams['survey_id']);

    if (!surveyWithDetailsResponse) {
      return;
    }
    setSurveyWithDetails(surveyWithDetailsResponse);
  }, [biohubApi.survey, urlParams]);

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

  if (!projectWithDetails || !surveyWithDetails || !codes) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyHeader projectWithDetails={projectWithDetails} surveyWithDetails={surveyWithDetails} refresh={getSurvey} />

      <Container maxWidth="xl">
        <Box my={3}>
          <Grid container spacing={3}>
            <Grid item sm={12} lg={8}>
              <SurveyDetails
                projectForViewData={projectWithDetails}
                surveyForViewData={surveyWithDetails}
                codes={codes}
                refresh={getSurvey}
              />
              <Box mt={3}>
                <SurveyObservations refresh={getSurvey} />
              </Box>
              <Box mt={3}>
                <SurveySummaryResults />
              </Box>
              <Box mt={3}>
                <SurveyAttachments projectForViewData={projectWithDetails} surveyForViewData={surveyWithDetails} />
              </Box>
            </Grid>
            <Grid item sm={12} lg={4}>
              <SurveyStudyArea
                surveyForViewData={surveyWithDetails}
                projectForViewData={projectWithDetails}
                refresh={getSurvey}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default SurveyPage;
