import { mdiCog, mdiMapSearchOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
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
import SurveyStudyArea from './components/SurveyStudyArea';
import SurveyAttachments from './SurveyAttachments';
import SurveyHeader from './SurveyHeader';
import SurveyMap from './SurveyMap';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyHeader />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper elevation={0} sx={{ overflow: 'hidden' }}>
          <Toolbar>
            <Typography
              component="h3"
              variant="h4"
              sx={{
                flex: '1 1 auto'
              }}>
              Observations &zwnj;
              {!numObservations ? (
                ' '
              ) : (
                <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
                  ({numObservations})
                </Typography>
              )}
            </Typography>
            <Button
              component={RouterLink}
              variant="contained"
              color="primary"
              to={'observations'}
              title="Manage Observations"
              startIcon={<Icon path={mdiCog} size={0.75} />}>
              Manage Observations
            </Button>
          </Toolbar>
          {/* <Box position="relative" height={{ sm: 400, md: 600 }}> */}
          <Box>
            {observationsContext.observationsDataLoader.isLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  zIndex: 1002,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fff',
                  '& svg': {
                    color: grey[300]
                  }
                }}>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                  }}
                />
                <Icon path={mdiMapSearchOutline} size={2} />
              </Box>
            )}
            {/* <ObservationsMap /> */}
          </Box>
        </Paper>

        <Box mt={3}>
          <Paper elevation={0}>
            <SurveyMap />
          </Paper>
        </Box>
        {/* <Box mt={3}>
          <Paper elevation={0}>
            <ManualTelemetrySection />
          </Paper>
        </Box> */}

        {/* <Box mt={3}>
          <Paper elevation={0}>
            <SurveyAnimals />
          </Paper>
        </Box> */}

        {/* <Box mt={3}>
          <Paper elevation={0}>
            <SurveySummaryResults />
          </Paper>
        </Box> */}

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
