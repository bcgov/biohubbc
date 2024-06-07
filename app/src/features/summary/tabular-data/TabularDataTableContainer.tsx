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
import { UseURLParams } from 'hooks/useURLParams';

export const TABULAR_VIEW_PARAM_KEY = 'tvk';
export enum TABULAR_VIEW_PARAM_VALUE {
  observations = 'ov',
  telemetry = 'tv',
  animals = 'av'
}

export const TABULAR_VIEW_SEARCH_PARAM_KEY = 'tvsk';
export enum TABULAR_VIEW_SEARCH_PARAM_VALUE {
  showFilters = 'ss'
}

type TabularDataTableURLParams = {
  [TABULAR_VIEW_PARAM_KEY]: TABULAR_VIEW_PARAM_VALUE;
  [TABULAR_VIEW_SEARCH_PARAM_KEY]: TABULAR_VIEW_SEARCH_PARAM_VALUE;
};

const buttonsx = {
  py: 0.5,
  px: 1.5,
  border: 'none',
  fontWeight: 700,
  borderRadius: '4px !important',
  fontSize: '0.875rem',
  letterSpacing: '0.02rem'
};

export const TabularDataTableContainer = () => {
  const { urlParams, setURLParams } = UseURLParams<TabularDataTableURLParams>();

  const activeView = urlParams.get(TABULAR_VIEW_PARAM_KEY) ?? TABULAR_VIEW_PARAM_VALUE.observations;
  const showSearch = !!urlParams.get(TABULAR_VIEW_SEARCH_PARAM_KEY) ?? false;

  const views = [
    { value: TABULAR_VIEW_PARAM_VALUE.observations, label: 'observations', icon: mdiEye },
    { value: TABULAR_VIEW_PARAM_VALUE.animals, label: 'animals', icon: mdiPaw },
    { value: TABULAR_VIEW_PARAM_VALUE.telemetry, label: 'telemetry', icon: mdiWifiMarker }
  ];

  const onChangeView = (_: React.MouseEvent<HTMLElement>, value: TABULAR_VIEW_PARAM_VALUE) => {
    if (!value) {
      return;
    }

    setURLParams(urlParams.set(TABULAR_VIEW_PARAM_KEY, value));
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
            '& Button': buttonsx
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
          sx={buttonsx}
          onClick={() => {
            setURLParams(
              (showSearch && urlParams.delete(TABULAR_VIEW_SEARCH_PARAM_KEY)) ||
                urlParams.set(TABULAR_VIEW_SEARCH_PARAM_KEY, TABULAR_VIEW_SEARCH_PARAM_VALUE.showFilters)
            );
          }}
          component={Button}
          startIcon={<Icon path={mdiMagnify} size={1} />}>
          Search
        </Button>
      </Toolbar>
      <Divider />
      {activeView === TABULAR_VIEW_PARAM_VALUE.observations && <ObservationsListContainer showSearch={showSearch} />}
      {activeView === TABULAR_VIEW_PARAM_VALUE.animals && <AnimalsListContainer showSearch={showSearch} />}
      {activeView === TABULAR_VIEW_PARAM_VALUE.telemetry && <TelemetryListContainer showSearch={showSearch} />}
    </>
  );
};
