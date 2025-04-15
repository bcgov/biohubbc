import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { SystemAlertBanner } from 'features/alert/banner/SystemAlertBanner';
import { useSearchParams } from 'hooks/useSearchParams';
import { SystemAlertBannerEnum } from 'interfaces/useAlertApi.interface';
import { useContext, useEffect } from 'react';
import { SurveyChecklist } from '../checklist/SurveyChecklist';
import { SamplingPeriodContainer } from '../sampling-information/periods/SamplingPeriodContainer';
import { SamplingSiteContainer } from '../sampling-information/sites/SamplingSiteTableContainer';
import { SamplingTechniqueContainer } from '../sampling-information/techniques/SamplingTechniqueContainer';
import SurveyHeader from './SurveyHeader';

const ACTIVE_VIEW_KEY = 'v';
export enum ACTIVE_VIEW_VALUE {
  overview = 'overview',
  // Top-level
  sampling = 'sampling',
  data = 'data',
  attachments = 'attachments',
  metadata = 'metadata',
  // Sampling children
  sites = 'sites',
  techniques = 'techniques',
  periods = 'periods',
  // Data children
  observations = 'observations',
  telemetry = 'telemetry',
  animals = 'animals',
  habitat = 'habitat'
}

// Supported URL parameters
type SurveyPageViewParams = {
  [ACTIVE_VIEW_KEY]: ACTIVE_VIEW_VALUE;
};

/**
 * Page to display a single Survey.
 */
const SurveyPage = () => {
  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);
  const { searchParams, setSearchParams } = useSearchParams<SurveyPageViewParams>();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const viewParam = searchParams.get(ACTIVE_VIEW_KEY) as ACTIVE_VIEW_VALUE;
  const activeView = viewParam || null;

  const handleViewChange = (view: ACTIVE_VIEW_VALUE) => {
    setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, view));
  };

  return (
    <>
      <SurveyHeader />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <SystemAlertBanner alertTypes={[SystemAlertBannerEnum.SURVEYS]} />
        <Stack flexDirection="row" gap={2}>
          <Box sx={{ position: 'sticky', top: 180, alignSelf: 'flex-start' }}>
            <SurveyChecklist activeView={activeView} handleViewChange={handleViewChange} />
          </Box>

          <LoadingGuard
            isLoadingFallbackDelay={300}
            hasNoDataFallbackDelay={300}
            hasNoData={!surveyContext.surveyDataLoader.data.surveyData.species}
            hasNoDataFallback={
              <Paper
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '1 1 auto',
                  flexDirection: 'column'
                }}>
                <Typography variant="h3" gutterBottom mb={2}>
                  Welcome to your Survey!
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Add data using the checklist on the left.
                </Typography>
                <Typography color="textSecondary">Publish your Survey when you're done!</Typography>
              </Paper>
            }
            isLoading={surveyContext.surveyDataLoader.isLoading || codesContext.codesDataLoader.isLoading}>
            <Paper sx={{ flex: '1 1 auto' }}>
              {activeView === ACTIVE_VIEW_VALUE.sites && <SamplingSiteContainer />}

              {activeView === ACTIVE_VIEW_VALUE.techniques && <SamplingTechniqueContainer />}

              {activeView === ACTIVE_VIEW_VALUE.periods && <SamplingPeriodContainer />}
            </Paper>
          </LoadingGuard>
        </Stack>
      </Container>
    </>
  );
};

export default SurveyPage;
