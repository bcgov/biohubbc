import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useContext, useEffect, useState } from 'react';

import { LoadingGuard } from 'components/loading/LoadingGuard';
import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { SystemAlertBanner } from 'features/alert/banner/SystemAlertBanner';
import { useSearchParams } from 'hooks/useSearchParams';
import { SystemAlertBannerEnum } from 'interfaces/useAlertApi.interface';

import { mdiInformationSlabCircle } from '@mdi/js';
import Icon from '@mdi/react';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { SurveyDeploymentList } from '../telemetry/list/SurveyDeploymentList';
import { DevicesContainer } from '../telemetry/manage/devices/table/DevicesContainer';
import { SurveySpatialTelemetry } from '../telemetry/SurveySpatialTelemetry';
import SurveyHeader from '../view/SurveyHeader';
import { SurveyChecklist } from './checklist/SurveyChecklist';
import { SurveySpatialAnimals } from './content/animals/SurveySpatialAnimals';
import { SurveySpatialObservations } from './content/observations/SurveySpatialObservations';
import { SamplingPeriodContainer } from './content/sampling/period/SamplingPeriodContainer';
import { SamplingSiteContainer } from './content/sampling/site/SamplingSiteContainer';
import { SamplingTechniqueContainer } from './content/sampling/technique/SamplingTechniqueContainer';
import { SurveyChecklistGuide } from './guide/SurveyChecklistGuide';
import { SurveyPageOverview } from './overview/SurveyPageOverview';

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
  devices = 'devices',
  locations = 'locations',
  deployments = 'deployments',
  animals = 'animals',
  habitat = 'habitat'
}

const DEFAULT_VIEW = ACTIVE_VIEW_VALUE.overview;

type SurveyPageViewParams = {
  [ACTIVE_VIEW_KEY]: ACTIVE_VIEW_VALUE;
};

const CHECKLIST_WIDTH = 350;
const GUIDE_WIDTH = 300;
const GAP = 16;

const SurveyPage = () => {
  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);
  const { searchParams, setSearchParams } = useSearchParams<SurveyPageViewParams>();
  const biohubApi = useBiohubApi();

  const [showGuide, setShowGuide] = useState(true);

  const checklistDataLoader = useDataLoader(() =>
    biohubApi.survey.getSurveyChecklist(surveyContext.projectId, surveyContext.surveyId)
  );

  useEffect(() => {
    checklistDataLoader.load();
  }, [checklistDataLoader]);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  useEffect(() => {
    if (!searchParams.get(ACTIVE_VIEW_KEY)) {
      setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, DEFAULT_VIEW));
    }
  }, [searchParams, setSearchParams]);

  const activeView = (searchParams.get(ACTIVE_VIEW_KEY) as ACTIVE_VIEW_VALUE) || DEFAULT_VIEW;

  const handleViewChange = (view: ACTIVE_VIEW_VALUE) => {
    const updatedView = view ?? DEFAULT_VIEW;
    setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, updatedView));
  };

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyHeader />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <SystemAlertBanner alertTypes={[SystemAlertBannerEnum.SURVEYS]} />
        <Stack direction="row" gap={2} alignItems="flex-start">
          {/* Checklist Panel */}
          <Paper sx={{ p: 3, pt: 2, width: CHECKLIST_WIDTH, flexShrink: 0 }}>
            <LoadingGuard
              isLoadingFallbackDelay={600}
              isLoadingFallback={
                <Stack pt={1} spacing={2}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} variant="rectangular" width="100%" height="35px" />
                  ))}
                </Stack>
              }
              isLoading={
                checklistDataLoader.isLoading ||
                codesContext.codesDataLoader.isLoading ||
                surveyContext.surveyDataLoader.isLoading
              }>
              {checklistDataLoader.data?.checklist && (
                <Box sx={{ position: 'sticky', top: 180 }}>
                  <SurveyChecklist
                    checklist={checklistDataLoader.data.checklist}
                    activeView={activeView}
                    handleViewChange={handleViewChange}
                  />
                </Box>
              )}
            </LoadingGuard>
          </Paper>

          {/* Main Content */}
          <Box
            sx={{
              flex: '1 1 auto',
              transition: 'width 0.3s ease',
              minWidth: 0,
              width: `calc(100% - ${CHECKLIST_WIDTH + GAP + (showGuide ? GUIDE_WIDTH + GAP : 0)}px)`
            }}>
            <LoadingGuard
              isLoadingFallbackDelay={600}
              hasNoDataFallbackDelay={600}
              isLoading={
                checklistDataLoader.isLoading ||
                codesContext.codesDataLoader.isLoading ||
                surveyContext.surveyDataLoader.isLoading
              }
              isLoadingFallback={
                <Paper sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Skeleton variant="rectangular" width="100px" height="30px" />
                      <Skeleton variant="rectangular" width="150px" height="30px" />
                    </Box>
                    <Skeleton variant="rectangular" width="100%" height="150px" />
                    {Array.from({ length: 2 }).map((_, index) => (
                      <Skeleton key={index} variant="rectangular" width="100%" height="75px" />
                    ))}
                  </Stack>
                </Paper>
              }>
              <Paper sx={{ width: '100%', height: '100%' }}>
                <ComponentSwitch
                  switch={activeView}
                  components={{
                    [ACTIVE_VIEW_VALUE.overview]: <SurveyPageOverview />,
                    [ACTIVE_VIEW_VALUE.sites]: <SamplingSiteContainer />,
                    [ACTIVE_VIEW_VALUE.techniques]: <SamplingTechniqueContainer />,
                    [ACTIVE_VIEW_VALUE.periods]: <SamplingPeriodContainer />,
                    [ACTIVE_VIEW_VALUE.observations]: <SurveySpatialObservations />,
                    [ACTIVE_VIEW_VALUE.devices]: <DevicesContainer />,
                    [ACTIVE_VIEW_VALUE.deployments]: <SurveyDeploymentList />,
                    [ACTIVE_VIEW_VALUE.locations]: <SurveySpatialTelemetry />,
                    [ACTIVE_VIEW_VALUE.animals]: <SurveySpatialAnimals />
                  }}
                />
              </Paper>
            </LoadingGuard>
          </Box>

          {/* Guide Panel */}
          {activeView !== ACTIVE_VIEW_VALUE.overview && (
            <Collapse in={showGuide} orientation="horizontal" appear unmountOnExit>
              <Paper sx={{ width: GUIDE_WIDTH, flexShrink: 0, p: 2 }}>
                <LoadingGuard
                  isLoadingFallbackDelay={600}
                  isLoadingFallback={
                    <Stack pt={1} spacing={2}>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} variant="rectangular" width="100%" height="35px" />
                      ))}
                    </Stack>
                  }
                  isLoading={
                    checklistDataLoader.isLoading ||
                    codesContext.codesDataLoader.isLoading ||
                    surveyContext.surveyDataLoader.isLoading
                  }>
                  {checklistDataLoader.data?.checklist ? (
                    <Box sx={{ position: 'sticky', top: 180 }}>
                      <SurveyChecklistGuide activeView={activeView} onClose={() => setShowGuide(false)} />
                    </Box>
                  ) : (
                    <IconButton color="primary" onClick={() => setShowGuide(true)}>
                      <Icon path={mdiInformationSlabCircle} size={1.25} />
                    </IconButton>
                  )}
                </LoadingGuard>
              </Paper>
            </Collapse>
          )}

          {/* Show Guide Button (when collapsed) */}
          {!showGuide && activeView !== ACTIVE_VIEW_VALUE.overview && (
            <IconButton
              color="primary"
              onClick={() => setShowGuide(true)}
              sx={{ mt: 1, ml: 1, alignSelf: 'flex-start' }}>
              <Icon path={mdiInformationSlabCircle} size={1.25} />
            </IconButton>
          )}
        </Stack>
      </Container>
    </>
  );
};

export default SurveyPage;
