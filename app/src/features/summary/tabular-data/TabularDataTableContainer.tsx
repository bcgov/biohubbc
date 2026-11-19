import { mdiCellphoneBasic, mdiEye, mdiPaw, mdiPineTree, mdiWifiMarker } from '@mdi/js';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import AnimalsListContainer from 'features/summary/tabular-data/animal/AnimalsListContainer';
import HabitatFeaturesListContainer from 'features/summary/tabular-data/habitat-feature/HabitatFeaturesListContainer';
import ObservationsListContainer from 'features/summary/tabular-data/observation/ObservationsListContainer';
import TelemetryListContainer from 'features/summary/tabular-data/telemetry/TelemetryListContainer';
import { useSearchParams } from 'hooks/useSearchParams';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useState } from 'react';
import DeploymentListContainer from './deployments/DeploymentListContainer';

const ACTIVE_VIEW_KEY = 'tavk';
export enum ACTIVE_VIEW_VALUE {
  observations = 'ov',
  telemetry = 'tv',
  deployments = 'dev',
  animals = 'av',
  habitatFeatures = 'hv'
}

const SHOW_SEARCH_KEY = 'tssk';
enum SHOW_SEARCH_VALUE {
  true = 'true',
  false = 'false'
}

// Supported URL parameters
type TabularDataTableURLParams = {
  [ACTIVE_VIEW_KEY]: ACTIVE_VIEW_VALUE;
  [SHOW_SEARCH_KEY]: SHOW_SEARCH_VALUE;
};

/**
 * Data table component for tabular data (ie: observations, animals, telemetry).
 *
 * @return {*}
 */
export const TabularDataTableContainer = () => {
  const { searchParams, setSearchParams } = useSearchParams<TabularDataTableURLParams>();

  const [activeView, setActiveView] = useState(
    (searchParams.get(ACTIVE_VIEW_KEY) as ACTIVE_VIEW_VALUE | null) ?? ACTIVE_VIEW_VALUE.observations
  );
  const showSearch = true;

  const views = [
    { value: ACTIVE_VIEW_VALUE.observations, label: 'observations', icon: mdiEye },
    { value: ACTIVE_VIEW_VALUE.animals, label: 'animals', icon: mdiPaw },
    { value: ACTIVE_VIEW_VALUE.telemetry, label: 'telemetry', icon: mdiWifiMarker },
    { value: ACTIVE_VIEW_VALUE.deployments, label: 'deployments', icon: mdiCellphoneBasic },
    { value: ACTIVE_VIEW_VALUE.habitatFeatures, label: 'habitat features', icon: mdiPineTree }
  ];

  return (
    <Stack direction="row">
      <Stack mx={2} my={1} width="225px" gap={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" minHeight="75px">
          <Typography variant="h4">Data</Typography>
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.SUMMARY_DATA} />
        </Box>
        <CustomToggleButtonGroup
          views={views}
          activeView={activeView}
          onViewChange={(view) => {
            setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, view));
            setActiveView(view);
          }}
          orientation="vertical"
        />
      </Stack>

      <Divider flexItem orientation="vertical" />

      <Box flex="1 1 auto" overflow="hidden">
        {activeView === ACTIVE_VIEW_VALUE.observations && <ObservationsListContainer showSearch={showSearch} />}
        {activeView === ACTIVE_VIEW_VALUE.animals && <AnimalsListContainer showSearch={showSearch} />}
        {activeView === ACTIVE_VIEW_VALUE.telemetry && <TelemetryListContainer showSearch={showSearch} />}
        {activeView === ACTIVE_VIEW_VALUE.deployments && <DeploymentListContainer showSearch={showSearch} />}
        {activeView === ACTIVE_VIEW_VALUE.habitatFeatures && <HabitatFeaturesListContainer showSearch={showSearch} />}
      </Box>
    </Stack>
  );
};
