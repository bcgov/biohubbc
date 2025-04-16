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
import { SamplingSiteManagePage } from '../sampling-information/manage/SamplingSiteManagePage';
import SurveyHeader from './SurveyHeader';
import { SurveySpatialContainer } from './survey-spatial/SurveySpatialContainer';

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

// Parent-child relationship mapping
const PARENT_VIEW_MAP: Partial<Record<ACTIVE_VIEW_VALUE, ACTIVE_VIEW_VALUE>> = {
  sites: ACTIVE_VIEW_VALUE.sampling,
  techniques: ACTIVE_VIEW_VALUE.sampling,
  periods: ACTIVE_VIEW_VALUE.sampling,
  observations: ACTIVE_VIEW_VALUE.data,
  telemetry: ACTIVE_VIEW_VALUE.data,
  animals: ACTIVE_VIEW_VALUE.data,
  habitat: ACTIVE_VIEW_VALUE.data
};

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

  // Get the parent view from search params and the child view from the URL hash
  const parentViewParam = searchParams.get(ACTIVE_VIEW_KEY) as ACTIVE_VIEW_VALUE;
  const childViewHash = window.location.hash.substring(1) as ACTIVE_VIEW_VALUE; // Get hash without the '#' character

  // Determine active view as the child (hash) view
  const activeView = childViewHash || parentViewParam || ACTIVE_VIEW_VALUE.sampling;

  // Get the top-level view for the current view
  const getTopLevelView = (view: ACTIVE_VIEW_VALUE): ACTIVE_VIEW_VALUE => {
    return PARENT_VIEW_MAP[view] ?? view;
  };

  const handleViewChange = (view: ACTIVE_VIEW_VALUE) => {
    // Update the URL to reflect the current view with its parent
    const newUrl = window.location.pathname + window.location.search + '#' + view;
    window.history.pushState(null, '', newUrl);

    // Scroll to the corresponding element
    const el = document.getElementById(view);
    if (el) {
      const headerOffset = 300; // Adjust as needed for header height
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }

    // Set the parent view as the active search parameter in the URL
    const topLevelView = getTopLevelView(view);
    setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, topLevelView));
  };

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyHeader />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <SystemAlertBanner alertTypes={[SystemAlertBannerEnum.SURVEYS]} />
        <Stack flexDirection="row" gap={2}>
          <Box sx={{ position: 'sticky', top: 180, alignSelf: 'flex-start' }}>
            <SurveyChecklist activeView={activeView} handleViewChange={handleViewChange} progress={0} />
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
            {(activeView === ACTIVE_VIEW_VALUE.sampling ||
              PARENT_VIEW_MAP[activeView] === ACTIVE_VIEW_VALUE.sampling) && <SamplingSiteManagePage />}

            {(activeView === ACTIVE_VIEW_VALUE.data || PARENT_VIEW_MAP[activeView] === ACTIVE_VIEW_VALUE.data) && (
              <SurveySpatialContainer />
            )}
          </LoadingGuard>
        </Stack>
      </Container>
    </>
  );
};

export default SurveyPage;
