import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import SurveySubmissionAlertBar from 'components/publish/SurveySubmissionAlertBar';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import SurveyDetails from 'features/surveys/view/SurveyDetails';
import React, { useContext, useEffect } from 'react';
import SurveyStudyArea from './components/SurveyStudyArea';
import SurveySummaryResults from './summary-results/SurveySummaryResults';
import SurveyObservations from './survey-observations/SurveyObservations';
import SurveyAttachments from './SurveyAttachments';
import SurveyHeader from './SurveyHeader';

/**
 * Page to display a single Survey.
 *
 * @return {*}
 */
const SurveyPage: React.FC = () => {
  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);

  useEffect(() => codesContext.codesDataLoader.load(), [codesContext.codesDataLoader]);
  useEffect(() => surveyContext.surveyDataLoader.load(surveyContext.projectId, surveyContext.surveyId), [
    surveyContext.surveyDataLoader,
    surveyContext.projectId,
    surveyContext.surveyId
  ]);

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyHeader />
      <Container maxWidth="xl">
        <Box my={3}>
          <SurveySubmissionAlertBar />
          <Grid container spacing={3}>
            <Grid item md={12} lg={4}>
              <Paper elevation={0}>
                <SurveyDetails />
              </Paper>
            </Grid>
            <Grid item md={12} lg={8}>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveyObservations />
                </Paper>
              </Box>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveySummaryResults />
                </Paper>
              </Box>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveyAttachments />
                </Paper>
              </Box>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveyStudyArea />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default SurveyPage;
