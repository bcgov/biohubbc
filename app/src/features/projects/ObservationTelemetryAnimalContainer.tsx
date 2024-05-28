import { mdiEye, mdiMagnify, mdiPaw, mdiWifiMarker } from '@mdi/js';
import Icon from '@mdi/react';
import ToggleButtonGroup from '@mui/lab/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import Toolbar from '@mui/material/Toolbar';
import AnimalsListContainer from 'features/surveys/animals/list/AnimalsListContainer';
import ObservationsListContainer from 'features/surveys/observations/list/ObservationsListContainer';
import { useState } from 'react';

export enum ObservationTelemetryAnimalViewEnum {
  OBSERVATIONS = 'OBSERVATIONS',
  TELEMETRY = 'TELEMETRY',
  ANIMALS = 'ANIMALS'
}

const buttonSx = {
  py: 0.5,
  px: 1.5,
  border: 'none',
  fontWeight: 700,
  borderRadius: '4px !important',
  fontSize: '0.875rem',
  letterSpacing: '0.02rem'
};

const ObservationTelemetryAnimalContainer = () => {
  const [activeView, setActiveView] = useState<ObservationTelemetryAnimalViewEnum>(
    ObservationTelemetryAnimalViewEnum.OBSERVATIONS
  );
  const [showSearch, setShowSearch] = useState(false);

  const views = [
    { value: ObservationTelemetryAnimalViewEnum.OBSERVATIONS, label: 'OBSERVATIONS', icon: mdiEye },
    { value: ObservationTelemetryAnimalViewEnum.ANIMALS, label: 'ANIMALS', icon: mdiPaw },
    { value: ObservationTelemetryAnimalViewEnum.TELEMETRY, label: 'TELEMETRY', icon: mdiWifiMarker }
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
            return setActiveView(value);
          }}
          exclusive
          sx={{
            display: 'flex',
            gap: 1,
            '& Button': buttonSx
          }}>
          {views
            .filter((view) =>
              [
                ObservationTelemetryAnimalViewEnum.OBSERVATIONS,
                ObservationTelemetryAnimalViewEnum.TELEMETRY,
                ObservationTelemetryAnimalViewEnum.ANIMALS
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
          sx={buttonSx}
          onClick={() => setShowSearch(!showSearch)}
          component={Button}
          startIcon={<Icon path={mdiMagnify} size={1} />}>
          SEARCH
        </Button>
      </Toolbar>
      <Divider />
      {activeView === 'OBSERVATIONS' && <ObservationsListContainer showSearch={showSearch} />}
          {activeView === 'ANIMALS' && <AnimalsListContainer showSearch={showSearch} />}
    </>
  );
};

export default ObservationTelemetryAnimalContainer;
