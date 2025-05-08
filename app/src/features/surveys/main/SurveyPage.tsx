import { LoadingGuard } from 'components/loading/LoadingGuard';
import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useSearchParams } from 'hooks/useSearchParams';
import { SidebarLayout } from 'layouts/SidebarLayout';
import { useContext, useEffect } from 'react';
import { SurveyChecklist } from './checklist/SurveyChecklist';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import { SurveyDeploymentList } from '../telemetry/list/SurveyDeploymentList';
import { DevicesContainer } from '../telemetry/manage/devices/table/DevicesContainer';
import { SurveySpatialTelemetry } from '../telemetry/SurveySpatialTelemetry';
import { SurveySpatialAnimals } from './content/animals/SurveySpatialAnimals';
import { SurveySpatialObservations } from './content/observations/SurveySpatialObservations';
import { SamplingPeriodContainer } from './content/sampling/period/SamplingPeriodContainer';
import { SamplingSiteContainer } from './content/sampling/site/SamplingSiteContainer';
import { SamplingTechniqueContainer } from './content/sampling/technique/SamplingTechniqueContainer';

import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { usePersistentState } from 'hooks/usePersistentState';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import SurveyHeader from '../view/SurveyHeader';
import { SurveyChecklistGuide } from './guide/SurveyChecklistGuide';

const ACTIVE_VIEW_KEY = 'v';

export enum ACTIVE_VIEW_VALUE {
  attachments = 'attachments',
  metadata = 'metadata',
  sites = 'sites',
  techniques = 'techniques',
  periods = 'periods',
  observations = 'observations',
  telemetry = 'telemetry',
  devices = 'devices',
  locations = 'locations',
  deployments = 'deployments',
  animals = 'animals',
  habitat = 'habitat'
}

const DEFAULT_VIEW = ACTIVE_VIEW_VALUE.sites;
const GUIDE_WIDTH = 350;

export const SurveyPage = () => {
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);
  const biohubApi = useBiohubApi();

  const { searchParams, setSearchParams } = useSearchParams<{ [ACTIVE_VIEW_KEY]: ACTIVE_VIEW_VALUE }>();
  const [showGuide, setShowGuide] = usePersistentState('SHOW_SURVEY_GUIDE', true);

  const checklistDataLoader = useDataLoader(() => biohubApi.survey.getSurveyChecklist(surveyContext.surveyId));

  useEffect(() => {
    checklistDataLoader.load();
    codesContext.codesDataLoader.load();

    if (!searchParams.get(ACTIVE_VIEW_KEY)) {
      setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, DEFAULT_VIEW));
    }
  }, [checklistDataLoader, codesContext.codesDataLoader, searchParams, setSearchParams]);

  const activeView = searchParams.get(ACTIVE_VIEW_KEY) as ACTIVE_VIEW_VALUE;

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
      <Container component={Paper} maxWidth={'xl'} sx={{ my: 3, p: 0 }} disableGutters>
        <SidebarLayout
          sidebar={
            <Box sx={{ width: 300, flexShrink: 0, mx: 1 }}>
              <LoadingGuard
                isLoading={
                  checklistDataLoader.isLoading ||
                  codesContext.codesDataLoader.isLoading ||
                  surveyContext.surveyDataLoader.isLoading
                }
                isLoadingFallbackDelay={600}
                isLoadingFallback={
                  <Stack pt={1} spacing={2}>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} variant="rectangular" width="100%" height="35px" />
                    ))}
                  </Stack>
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
            </Box>
          }>
          <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
            <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
              <LoadingGuard
                isLoading={
                  checklistDataLoader.isLoading ||
                  codesContext.codesDataLoader.isLoading ||
                  surveyContext.surveyDataLoader.isLoading
                }
                isLoadingFallbackDelay={600}
                isLoadingFallback={
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Skeleton variant="rectangular" width="100px" height="30px" />
                      <Skeleton variant="rectangular" width="100%" height="150px" />
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} variant="rectangular" width="100%" height="75px" />
                      ))}
                    </Stack>
                  </Box>
                }>
                {activeView && (
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <ComponentSwitch
                      switch={activeView}
                      components={{
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
                  </Box>
                )}
              </LoadingGuard>
            </Box>
            <Collapse in={showGuide} orientation="horizontal" appear unmountOnExit>
              <Box sx={{ width: GUIDE_WIDTH, flexShrink: 0, p: 3 }} borderLeft={`1px solid ${grey[300]}`}>
                <SurveyChecklistGuide
                  markdownType={MarkdownTypeNameEnum.OBSERVATIONS}
                  activeView={activeView}
                  onClose={() => setShowGuide(false)}
                />
              </Box>
            </Collapse>
          </Box>
        </SidebarLayout>
      </Container>
    </>
  );
};
