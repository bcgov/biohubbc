import { mdiEye, mdiMagnify, mdiPaw, mdiWifiMarker } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import AnimalsListContainer from 'features/surveys/animals/list/AnimalsListContainer';
import ObservationsListContainer from 'features/surveys/observations/list/ObservationsListContainer';
import TelemetryListContainer from 'features/surveys/telemetry/list/TelemetryListContainer';
import { useState } from 'react';

export enum ObservationTelemetryAnimalViewEnum {
  observations = 'observations',
  telemetry = 'telemetry',
  animals = 'animals'
}

const buttonsx = {
  py: 0.5,
  px: 1.5,
  border: 'none',
  fontWeight: 700,
  borderRadius: '4px !important',
  fontSize: '0.875rem',
  letterSpacing: '0.02rem'
};

interface IObservationTelemetryAnimalContainerProps {
  params: URLSearchParams;
  viewParam: string;
}

const ObservationTelemetryAnimalContainer = (props: IObservationTelemetryAnimalContainerProps) => {
  const { params, viewParam } = props;

  const activeView = params.get(viewParam);

  const [showSearch, setShowSearch] = useState(false);

  const views = [
    { value: ObservationTelemetryAnimalViewEnum.observations, label: 'observations', icon: mdiEye },
    { value: ObservationTelemetryAnimalViewEnum.animals, label: 'animals', icon: mdiPaw },
    { value: ObservationTelemetryAnimalViewEnum.telemetry, label: 'telemetry', icon: mdiWifiMarker }
  ];

  return (
    <>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <ToggleButtonGroup
          value={activeView}
          onChange={(_, value) => {
            if (!value) {
              return;
            }
            return params.set(viewParam, value);
          }}
          exclusive
          sx={{
            display: 'flex',
            gap: 1,
            '& Button': buttonsx
          }}>
          {views
            .filter((view) =>
              [
                ObservationTelemetryAnimalViewEnum.observations,
                ObservationTelemetryAnimalViewEnum.telemetry,
                ObservationTelemetryAnimalViewEnum.animals
              ].includes(view.value)
            )
            .map((view) => (
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
          onClick={() => setShowSearch(!showSearch)}
          component={Button}
          startIcon={<Icon path={mdiMagnify} size={1} />}>
          SEARCH
        </Button>
      </Toolbar>
      <Divider />
      {activeView === 'observations' && <ObservationsListContainer showSearch={showSearch} />}
      {activeView === 'animals' && <AnimalsListContainer showSearch={showSearch} />}
      {activeView === 'telemetry' && <TelemetryListContainer showSearch={showSearch} />}
    </>
  );
};

export default ObservationTelemetryAnimalContainer;
