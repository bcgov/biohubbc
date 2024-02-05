import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import { MeasurementsListCard } from 'features/surveys/observations/observation-measurements/list/MeasurementsListCard';
import { Measurement } from 'hooks/cb_api/useLookupApi';
import { TransitionGroup } from 'react-transition-group';

export interface IMeasurementsListProps {
  selectedMeasurements: Measurement[];
  onRemove: (measurement: Measurement) => void;
}

export const MeasurementsList = (props: IMeasurementsListProps) => {
  const { selectedMeasurements, onRemove } = props;

  return (
    <Stack component={TransitionGroup} gap={1} mt={3}>
      {selectedMeasurements.map((measurement) => {
        return (
          <Collapse key={measurement.uuid}>
            <MeasurementsListCard measurement={measurement} onRemove={() => onRemove(measurement)} />
          </Collapse>
        );
      })}
    </Stack>
  );
};
