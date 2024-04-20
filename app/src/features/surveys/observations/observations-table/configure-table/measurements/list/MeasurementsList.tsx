import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import { MeasurementsListCard } from 'features/surveys/observations/observations-table/configure-table/measurements/list/MeasurementsListCard';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { TransitionGroup } from 'react-transition-group';

export interface IMeasurementsListProps {
  /**
   * The selected measurements.
   *
   * @type {CBMeasurementType[]}
   * @memberof IMeasurementsListProps
   */
  selectedMeasurements: CBMeasurementType[];
  /**
   * Callback fired on remove.
   *
   * @memberof IMeasurementsListProps
   */
  onRemove: (measurement: CBMeasurementType) => void;
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
          <Collapse key={measurement.taxon_measurement_id}>
            <MeasurementsListCard measurement={measurement} onRemove={() => onRemove(measurement)} />
          </Collapse>
        );
      })}
    </Stack>
  );
};
