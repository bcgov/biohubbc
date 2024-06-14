import { mdiEye, mdiMagnify, mdiPaw, mdiWifiMarker } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import AnimalsListContainer from 'features/summary/tabular-data/animal/AnimalsListContainer';
import ObservationsListContainer from 'features/summary/tabular-data/observation/ObservationsListContainer';
import TelemetryListContainer from 'features/summary/tabular-data/telemetry/TelemetryListContainer';
import { useSearchParams } from 'hooks/useSearchParams';
import { useState } from 'react';

export const ACTIVE_VIEW_KEY = 'tavk';
export enum ACTIVE_VIEW_VALUE {
  observations = 'ov',
  telemetry = 'tv',
  animals = 'av'
}

export const SHOW_SEARCH_KEY = 'tssk';
export enum SHOW_SEARCH_VALUE {
  true = 'true',
  false = 'false'
}

// Supported URL parameters
type TabularDataTableURLParams = {
  [ACTIVE_VIEW_KEY]: ACTIVE_VIEW_VALUE;
  [SHOW_SEARCH_KEY]: SHOW_SEARCH_VALUE;
};

const buttonSx = {
  py: 0.5,
  px: 1.5,
  border: 'none',
  fontWeight: 700,
  borderRadius: '4px !important',
  fontSize: '0.875rem',
  letterSpacing: '0.02rem'
};

/**
 * Data table component for tabular data (ie: observations, animals, telemetry).
 *
 * @return {*}
 */
export const TabularDataTableContainer = () => {
  const { searchParams, setSearchParams } = useSearchParams<TabularDataTableURLParams>();

  const [activeView, setActiveView] = useState(searchParams.get(ACTIVE_VIEW_KEY) ?? ACTIVE_VIEW_VALUE.observations);
  const [showSearch, setShowSearch] = useState<boolean>(
    searchParams.get(SHOW_SEARCH_KEY) === SHOW_SEARCH_VALUE.true ?? false
  );

  const views = [
    { value: ACTIVE_VIEW_VALUE.observations, label: 'observations', icon: mdiEye },
    { value: ACTIVE_VIEW_VALUE.animals, label: 'animals', icon: mdiPaw },
    { value: ACTIVE_VIEW_VALUE.telemetry, label: 'telemetry', icon: mdiWifiMarker }
  ];

  const onChangeView = (_: React.MouseEvent<HTMLElement>, value: ACTIVE_VIEW_VALUE) => {
    if (!value) {
      // User has clicked the active view, do nothing
      return;
    }

    setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, value));
    setActiveView(value);
  };

  return (
    <>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <ToggleButtonGroup
          value={activeView}
          onChange={onChangeView}
          exclusive
          sx={{
            display: 'flex',
            gap: 1,
            '& Button': buttonSx
          }}>
          {views.map((view) => (
            <ToggleButton
              key={view.label}
              component={Button}
              color="primary"
              startIcon={<Icon path={view.icon} size={0.75} />}
              value={view.value}>
              {view.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Button
          color="primary"
          sx={buttonSx}
          onClick={() => {
            setSearchParams(
              searchParams.set(SHOW_SEARCH_KEY, showSearch ? SHOW_SEARCH_VALUE.false : SHOW_SEARCH_VALUE.true)
            );
            setShowSearch(!showSearch);
          }}
          component={Button}
          startIcon={<Icon path={mdiMagnify} size={1} />}>
          Search
        </Button>
      </Toolbar>
      <Divider />
      {activeView === ACTIVE_VIEW_VALUE.observations && <ObservationsListContainer showSearch={showSearch} />}
      {activeView === ACTIVE_VIEW_VALUE.animals && <AnimalsListContainer showSearch={showSearch} />}
      {activeView === ACTIVE_VIEW_VALUE.telemetry && <TelemetryListContainer showSearch={showSearch} />}
    </>
  );
};
