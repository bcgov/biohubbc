import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
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

const useStyles = makeStyles((theme: Theme) => ({
  detailsAndLocationWrapper: {
    flexDirection: 'row',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column'
    }
  },
  detailsSection: {
    [theme.breakpoints.up('lg')]: {
      marginRight: theme.spacing(4)
    }
  },
  locationSection: {
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(3)
    }
  }
}));

/**
 * Page to display a single Survey.
 *
 * @return {*}
 */
const SurveyPage: React.FC = () => {
  const urlParams = useParams();
  const classes = useStyles();

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
        <Box display="flex" justifyContent="space-between" className={classes.detailsAndLocationWrapper}>
          <Box className={classes.detailsSection} flexShrink="1">
            <Box component={Paper} px={4} pb={2}>
              <SurveyDetails
                projectForViewData={projectWithDetails}
                surveyForViewData={surveyWithDetails}
                codes={codes}
                refresh={getSurvey}
              />
            </Box>
          </Box>
          <Box className={classes.locationSection} flexShrink="0" flexBasis="500px">
            <Box component={Paper} px={4} pb={2}>
              <SurveyStudyArea
                surveyForViewData={surveyWithDetails}
                projectForViewData={projectWithDetails}
                refresh={getSurvey}
              />
            </Box>
          </Box>
        </Box>
        <Box my={3}>
          <SurveyAttachments projectForViewData={projectWithDetails} surveyForViewData={surveyWithDetails} />
        </Box>
      </Container>
    </>
  );
};

export default SurveyPage;
