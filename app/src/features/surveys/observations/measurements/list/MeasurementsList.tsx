import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import { MeasurementsListCard } from 'features/surveys/observations/measurements/list/MeasurementsListCard';
import { Measurement } from 'hooks/cb_api/useLookupApi';
import { TransitionGroup } from 'react-transition-group';

export interface IMeasurementsListProps {
  /**
   * The selected measurements.
   *
   * @type {Measurement[]}
   * @memberof IMeasurementsListProps
   */
  selectedMeasurements: Measurement[];
  /**
   * Callback fired on remove.
   *
   * @memberof IMeasurementsListProps
   */
  onRemove: (measurement: Measurement) => void;
}

/**
 * Renders a list of measurement cards.
 *
 * @param {IMeasurementsListProps} props
 * @return {*}
 */
export const MeasurementsList = (props: IMeasurementsListProps) => {
  const { selectedMeasurements, onRemove } = props;

  return (
    <Stack component={TransitionGroup} gap={1} mt={1} data-testid="measurements-list">
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
