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
import { ToggleButtonView } from 'components/toggle/CustomToggleButtonGroup';
import { HierarchicalCustomToggleButtonGroup } from 'components/toggle/HierarchicalCustomToggleButtonGroup';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { SurveyDeploymentList } from 'features/surveys/telemetry/list/SurveyDeploymentList';
import { DevicesContainer } from 'features/surveys/telemetry/manage/devices/table/DevicesContainer';
import { SurveySpatialTelemetry } from 'features/surveys/telemetry/SurveySpatialTelemetry';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSearchParams } from 'hooks/useSearchParams';
import { SidebarLayout } from 'layouts/SidebarLayout';
import { useCallback, useContext, useEffect } from 'react';
import { ChecklistItem } from '../checklist/SurveyChecklistManager';
import { SurveySpatialAnimals } from './animals/SurveySpatialAnimals';
import { SurveySpatialHabitatFeatures } from './habitat/SurveySpatialHabitatFeatures';
import { SurveySpatialObservations } from './observations/SurveySpatialObservations';

export const DATA_ACTIVE_VIEW_KEY = 'cv';

export enum DATA_ACTIVE_VIEW_VALUE {
  observations = 'observations',
  telemetry = 'telemetry',
  devices = 'devices',
  locations = 'locations',
  deployments = 'deployments',
  animals = 'animals',
  habitat = 'habitat'
}

const DEFAULT_VIEW = DATA_ACTIVE_VIEW_VALUE.observations;

interface ISurveyDataPageProps {
  checklistItems: ChecklistItem[];
}

export const SurveyDataPage = (props: ISurveyDataPageProps) => {
  const { checklistItems } = props;

  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);
  const biohubApi = useBiohubApi();

  const { searchParams, setSearchParams } = useSearchParams<{ [DATA_ACTIVE_VIEW_KEY]: DATA_ACTIVE_VIEW_VALUE }>();

  const checklist = surveyContext.surveyChecklistDataLoader.data?.checklist;

  useEffect(() => {
    codesContext.codesDataLoader.load();

    if (!searchParams.get(DATA_ACTIVE_VIEW_KEY)) {
      setSearchParams(searchParams.set(DATA_ACTIVE_VIEW_KEY, DEFAULT_VIEW));
    }
  }, [codesContext.codesDataLoader, searchParams, setSearchParams]);

  const activeView = searchParams.get(DATA_ACTIVE_VIEW_KEY) as DATA_ACTIVE_VIEW_VALUE;

  const handleViewChange = (view: DATA_ACTIVE_VIEW_VALUE) => {
    const updatedView = view ?? DEFAULT_VIEW;
    setSearchParams(searchParams.set(DATA_ACTIVE_VIEW_KEY, updatedView));
  };

  const handleCheckboxClick = useCallback(
    async (view: ToggleButtonView<DATA_ACTIVE_VIEW_VALUE>) => {
      const item = checklistItems.find((item) => item.value === view.value);

      if (!item) {
        return;
      }

      if (item.applicable) {
        await biohubApi.checklist.ignoreSurveyChecklistItems(surveyContext.surveyId, [item.checklist_item_name]);
      } else {
        await biohubApi.checklist.unignoreSurveyChecklistItems(surveyContext.surveyId, [item.checklist_item_name]);
      }

      await surveyContext.surveyChecklistDataLoader.refresh(surveyContext.surveyId);
    },
    [biohubApi, checklistItems, surveyContext]
  );

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data || !checklist) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const views = [
    {
      value: DATA_ACTIVE_VIEW_VALUE.observations,
      label: 'Observations',
      icon: mdiEye,

      disabled: !checklist.data.observations.applicable,
      checked: !!checklist.data.observations.count
    },
    {
      value: DATA_ACTIVE_VIEW_VALUE.animals,
      label: 'Animals',
      icon: mdiPaw,

      disabled: !checklist.data.animals.applicable,
      checked: !!checklist.data.animals.count
    },
    {
      value: DATA_ACTIVE_VIEW_VALUE.telemetry,
      label: 'Telemetry',
      icon: mdiWifiMarker,
      isHeader: true,
      children: [
        {
          value: DATA_ACTIVE_VIEW_VALUE.devices,
          label: 'Devices',
          icon: mdiAntenna,

          disabled: !checklist.data.telemetry.devices.applicable,
          checked: !!checklist.data.telemetry.devices.count
        },
        {
          value: DATA_ACTIVE_VIEW_VALUE.deployments,
          label: 'Deployments',
          icon: mdiCalendarRangeOutline,

          disabled: !checklist.data.telemetry.deployments.applicable,
          checked: !!checklist.data.telemetry.deployments.count
        },
        {
          value: DATA_ACTIVE_VIEW_VALUE.locations,
          label: 'Locations',
          icon: mdiMapMarkerRadiusOutline,

          disabled: !checklist.data.telemetry.locations.applicable,
          checked: !!checklist.data.telemetry.locations.count
        }
      ]
    },
    {
      value: DATA_ACTIVE_VIEW_VALUE.habitat,
      label: 'Habitat Features',
      icon: mdiPineTree,

      disabled: !checklist.data.habitat.applicable,
      checked: !!checklist.data.habitat.count
    }
  ];

  console.log(views);

  return (
    <SidebarLayout
      sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, overflow: 'hidden' }}
      sidebar={
        <Box p={2} sx={{ minWidth: '300px', overflowY: 'auto', height: '100%', flexShrink: 0 }}>
          <HierarchicalCustomToggleButtonGroup
            views={views}
            activeView={activeView}
            onViewChange={handleViewChange}
            handleCheckboxClick={handleCheckboxClick}
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
                    [DATA_ACTIVE_VIEW_VALUE.observations]: <SurveySpatialObservations />,
                    [DATA_ACTIVE_VIEW_VALUE.devices]: <DevicesContainer />,
                    [DATA_ACTIVE_VIEW_VALUE.deployments]: <SurveyDeploymentList />,
                    [DATA_ACTIVE_VIEW_VALUE.locations]: <SurveySpatialTelemetry />,
                    [DATA_ACTIVE_VIEW_VALUE.animals]: <SurveySpatialAnimals />,
                    [DATA_ACTIVE_VIEW_VALUE.habitat]: <SurveySpatialHabitatFeatures />
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
