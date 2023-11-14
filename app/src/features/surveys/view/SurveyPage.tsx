import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { LinearProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SurveySubmissionAlertBar from 'components/publish/SurveySubmissionAlertBar';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { CodesContext } from 'contexts/codesContext';
import { ObservationsContext } from 'contexts/observationsContext';
import { SurveyContext } from 'contexts/surveyContext';
import SurveyDetails from 'features/surveys/view/SurveyDetails';
import React, { useContext, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import ObservationsMap from '../observations/ObservationsMap';
import SurveyStudyArea from './components/SurveyStudyArea';
import SurveySummaryResults from './summary-results/SurveySummaryResults';
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
  const observationsContext = useContext(ObservationsContext);

  const numObservations: number =
    observationsContext.observationsDataLoader.data?.supplementaryObservationData?.observationCount || 0;

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  useEffect(() => {
    observationsContext.observationsDataLoader.refresh();
  }, []);

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyHeader />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper elevation={0} sx={{ overflow: 'hidden' }}>
          <Toolbar sx={{ mb: -1 }}>
            <Typography
              component="h3"
              variant="h4"
              sx={{
                flex: '1 1 auto'
              }}>
              Observations &zwnj;
              <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
                ({numObservations})
              </Typography>
            </Typography>
            <Button
              component={RouterLink}
              to={'observations'}
              title="Submit Survey Data and Documents"
              color="primary"
              variant="contained"
              startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
              Manage Observations
            </Button>
          </Toolbar>
          <Fade in={observationsContext.observationsDataLoader.isLoading}>
            <LinearProgress variant="indeterminate" sx={{ borderRadius: 0 }} />
          </Fade>
          <ObservationsMap />
        </Paper>

        <Box mt={3}>
          <Paper elevation={0}>
            <SurveyAnimals />
          </Paper>
        </Box>

        <Box mt={3}>
          <Paper elevation={0}>
            <SurveySummaryResults />
          </Paper>
        </Box>

        <Box mt={3}>
          <Paper elevation={0}>
            <SurveyAttachments />
          </Paper>
        </Box>

        <Box sx={{ mt: 3 }}>
          <SurveyDetails />
        </Box>

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
