import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import SurveySubmissionAlertBar from 'components/publish/SurveySubmissionAlertBar';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContextProvider } from 'contexts/taxonomyContext';
import SurveyDetails from 'features/surveys/view/SurveyDetails';
import React, { useContext, useEffect } from 'react';
import SurveyStudyArea from './components/SurveyStudyArea';
import SurveyAnimals from './SurveyAnimals';
import SurveyAttachments from './SurveyAttachments';
import SurveyHeader from './SurveyHeader';
import SurveySpatialData from './SurveySpatialData';

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
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack gap={3}>
          <TaxonomyContextProvider>
            <SurveySpatialData />
          </TaxonomyContextProvider>

          <Paper>
            <SurveyAnimals />
          </Paper>

          <Paper>
            <SurveyAttachments />
          </Paper>

          <SurveyDetails />
        </Stack>

        {/* <Box mt={3}>
          <Paper elevation={0}>
            <ManualTelemetrySection />
          </Paper>
        </Box> */}

        {/* <Box mt={3}>
          <Paper elevation={0}>
            <SurveySummaryResults />
          </Paper>
        </Box> */}

        <Paper sx={{ display: 'none' }}>
          <SurveyStudyArea />
        </Paper>

        <Box sx={{ display: 'none' }} my={3}>
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
            <SurveySubmissionAlertBar />
          </SystemRoleGuard>
        </Box>
      </Container>
    </>
  );
};

export default SurveyPage;
