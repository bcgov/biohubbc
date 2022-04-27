import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import SurveyDetails from 'features/surveys/view/SurveyDetails';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import React from 'react';
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

  const codesDataLoader = useDataLoader(() => biohubApi.codes.getAllCodeSets());
  codesDataLoader.load();

  const projectDataLoader = useDataLoader(() => biohubApi.project.getProjectForView(urlParams['id']));
  projectDataLoader.load();

  const surveyDataLoader = useDataLoader(() =>
    biohubApi.survey.getSurveyForView(urlParams['id'], urlParams['survey_id'])
  );
  surveyDataLoader.load();

  if (!projectDataLoader.data || !surveyDataLoader.data || !codesDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyHeader
        projectWithDetails={projectDataLoader.data}
        surveyWithDetails={surveyDataLoader.data}
        refresh={surveyDataLoader.refresh}
      />

      <Container maxWidth="xl">
        <Box my={3}>
          <Grid container spacing={3}>
            <Grid item sm={12} lg={8}>
              <SurveyDetails
                projectForViewData={projectDataLoader.data}
                surveyForViewData={surveyDataLoader.data}
                codes={codesDataLoader.data}
                refresh={surveyDataLoader.refresh}
              />
              <Box mt={3}>
                <SurveyObservations refresh={surveyDataLoader.refresh} />
              </Box>
              <Box mt={3}>
                <SurveySummaryResults />
              </Box>
              <Box mt={3}>
                <SurveyAttachments
                  projectForViewData={projectDataLoader.data}
                  surveyForViewData={surveyDataLoader.data}
                />
              </Box>
            </Grid>
            <Grid item sm={12} lg={4}>
              <SurveyStudyArea
                surveyForViewData={surveyDataLoader.data}
                projectForViewData={projectDataLoader.data}
                refresh={surveyDataLoader.refresh}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default SurveyPage;
