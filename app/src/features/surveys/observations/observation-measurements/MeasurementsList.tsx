import Collapse from '@mui/material/Collapse';
import { MeasurementsListCard } from 'features/surveys/observations/observation-measurements/MeasurementsListCard';
import { Measurement } from 'hooks/cb_api/useLookupApi';
import { TransitionGroup } from 'react-transition-group';

export interface IMeasurementsListProps {
  measurements: Measurement[];
  onRemove: (measurement: Measurement) => void;
}

export const MeasurementsList = (props: IMeasurementsListProps) => {
  const { measurements, onRemove } = props;

  return (
    <TransitionGroup>
      {measurements.map((measurement) => {
        return (
          <Collapse key={measurement.uuid}>
            <MeasurementsListCard measurement={measurement} onRemove={() => onRemove(measurement)} />
          </Collapse>
        );
      })}
    </TransitionGroup>
  );
};
