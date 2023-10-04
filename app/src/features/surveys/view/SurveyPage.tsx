import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import SurveySubmissionAlertBar from 'components/publish/SurveySubmissionAlertBar';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import SurveyDetails from 'features/surveys/view/SurveyDetails';
import React, { useContext, useEffect } from 'react';
import SurveyStudyArea from './components/SurveyStudyArea';
import SurveySummaryResults from './summary-results/SurveySummaryResults';
import SurveyObservations from './survey-observations/SurveyObservations';
import SurveyAnimals from './SurveyAnimals';
import SurveyAttachments from './SurveyAttachments';
import SurveyHeader from './SurveyHeader';

//TODO: PRODUCTION_BANDAGE: Remove <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>

/**
 * Page to display a single Survey.
 *
 * @return {*}
 */
const SurveyPage: React.FC = () => {
  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyHeader />
      <Container maxWidth="xl">
        <Box my={3}>
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
            <SurveySubmissionAlertBar />
          </SystemRoleGuard>
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
                  <SurveyAnimals />
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
