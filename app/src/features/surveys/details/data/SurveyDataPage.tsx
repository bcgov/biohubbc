import {
  mdiAntenna,
  mdiCalendarRangeOutline,
  mdiEye,
  mdiMapMarkerRadiusOutline,
  mdiPaw,
  mdiPineTree,
  mdiWifiMarker
} from '@mdi/js';
import { CircularProgress, Skeleton } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import { HierarchicalCustomToggleButtonGroup } from 'components/toolbar/HierarchicalCustomToggleButtonGroup';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { SurveyDeploymentList } from 'features/surveys/telemetry/list/SurveyDeploymentList';
import { DevicesContainer } from 'features/surveys/telemetry/manage/devices/table/DevicesContainer';
import { SurveySpatialTelemetry } from 'features/surveys/telemetry/SurveySpatialTelemetry';
import { useSearchParams } from 'hooks/useSearchParams';
import { SidebarLayout } from 'layouts/SidebarLayout';
import { useContext, useEffect } from 'react';
import { SurveySpatialAnimals } from './animals/SurveySpatialAnimals';
import { SurveySpatialHabitatFeatureTableContainer } from './habitat/table/SurveySpatialHabitatFeatureTableContainer';
import { SurveySpatialObservations } from './observations/SurveySpatialObservations';

const ACTIVE_VIEW_KEY = 'cv';

enum ACTIVE_VIEW_VALUE {
  observations = 'observations',
  telemetry = 'telemetry',
  devices = 'devices',
  locations = 'locations',
  deployments = 'deployments',
  animals = 'animals',
  habitat = 'habitat'
}

const DEFAULT_VIEW = ACTIVE_VIEW_VALUE.observations;

export const SurveyDataPage = () => {
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);

  const { searchParams, setSearchParams } = useSearchParams<{ [ACTIVE_VIEW_KEY]: ACTIVE_VIEW_VALUE }>();

  const checklist = surveyContext.surveyChecklistDataLoader.data?.checklist;

  useEffect(() => {
    codesContext.codesDataLoader.load();

    if (!searchParams.get(ACTIVE_VIEW_KEY)) {
      setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, DEFAULT_VIEW));
    }
  }, [codesContext.codesDataLoader, searchParams, setSearchParams]);

  const activeView = searchParams.get(ACTIVE_VIEW_KEY) as ACTIVE_VIEW_VALUE;

  const handleViewChange = (view: ACTIVE_VIEW_VALUE) => {
    const updatedView = view ?? DEFAULT_VIEW;
    setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, updatedView));
  };

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data || !checklist) {
    return <CircularProgress className="pageProgress" size={40} />;
  }
  const views = [
    {
      value: ACTIVE_VIEW_VALUE.observations,
      label: 'Observations',
      icon: mdiEye,
      checkbox: true,
      disabled: checklist.data.observations.applicable,
      isChecked: !!checklist.data.observations.count
    },
    {
      value: ACTIVE_VIEW_VALUE.animals,
      label: 'Animals',
      icon: mdiPaw,
      checkbox: true,
      disabled: checklist.data.animals.applicable,
      isChecked: !!checklist.data.animals.count
    },
    {
      value: ACTIVE_VIEW_VALUE.telemetry,
      label: 'Telemetry',
      icon: mdiWifiMarker,
      children: [
        {
          value: ACTIVE_VIEW_VALUE.devices,
          label: 'Devices',
          icon: mdiAntenna,
          checkbox: true,
          disabled: checklist.data.telemetry.devices.applicable,
          isChecked: !!checklist.data.telemetry.devices.count
        },
        {
          value: ACTIVE_VIEW_VALUE.deployments,
          label: 'Deployments',
          icon: mdiCalendarRangeOutline,
          checkbox: true,
          disabled: checklist.data.telemetry.deployments.applicable,
          isChecked: !!checklist.data.telemetry.deployments.count
        },
        {
          value: ACTIVE_VIEW_VALUE.locations,
          label: 'Locations',
          icon: mdiMapMarkerRadiusOutline,
          checkbox: true,
          disabled: checklist.data.telemetry.locations.applicable,
          isChecked: !!checklist.data.telemetry.locations.count
        }
      ]
    },
    {
      value: ACTIVE_VIEW_VALUE.habitat,
      label: 'Habitat Features',
      icon: mdiPineTree,
      checkbox: true,
      disabled: checklist.data.habitat.applicable,
      isChecked: !!checklist.data.habitat.count
    }
  ];

  return (
    <SidebarLayout
      sidebar={
        <Box p={2}>
          <HierarchicalCustomToggleButtonGroup
            views={views}
            activeView={activeView}
            onViewChange={handleViewChange}
            orientation="vertical"
          />
        </Box>
      }>
      <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
        <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
          <LoadingGuard
            isLoading={codesContext.codesDataLoader.isLoading || surveyContext.surveyDataLoader.isLoading}
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
                    [ACTIVE_VIEW_VALUE.observations]: <SurveySpatialObservations />,
                    [ACTIVE_VIEW_VALUE.devices]: <DevicesContainer />,
                    [ACTIVE_VIEW_VALUE.deployments]: <SurveyDeploymentList />,
                    [ACTIVE_VIEW_VALUE.locations]: <SurveySpatialTelemetry />,
                    [ACTIVE_VIEW_VALUE.animals]: <SurveySpatialAnimals />,
                    [ACTIVE_VIEW_VALUE.habitat]: <SurveySpatialHabitatFeatureTableContainer />
                  }}
                />
              </Box>
            )}
          </LoadingGuard>
        </Box>
      </Box>
    </SidebarLayout>
  );
};
