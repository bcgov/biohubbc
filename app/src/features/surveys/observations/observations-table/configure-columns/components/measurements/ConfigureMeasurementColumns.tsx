import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton, List, Stack, Typography } from '@mui/material';
import MeasurementStandardCard from 'features/standards/view/components/MeasurementStandardCard';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { MeasurementsSearch } from './search/MeasurementsSearch';

export interface IConfigureMeasurementColumnsProps {
  /**
   * The measurement columns.
   *
   * @type {CBMeasurementType[]}
   * @memberof IConfigureMeasurementColumnsProps
   */
  measurementColumns: CBMeasurementType[];
  /**
   * Callback fired on adding measurement columns.
   *
   * @memberof IConfigureMeasurementColumnsProps
   */
  onAddMeasurementColumns: (measurementColumns: CBMeasurementType[]) => void;
  /**
   * Callback fired on removing measurement columns.
   *
   * @memberof IConfigureMeasurementColumnsProps
   */
  onRemoveMeasurementColumns: (fields: string[]) => void;
}

/**
 * Renders a component to configure the measurement columns of the observations table.
 *
 * @param {IConfigureMeasurementColumnsProps} props
 * @return {*}
 */

export const ConfigureMeasurementColumns = (props: IConfigureMeasurementColumnsProps) => {
  const { measurementColumns, onAddMeasurementColumns, onRemoveMeasurementColumns } = props;

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Typography variant="h5" mb={2}>
        Add Species Attributes
      </Typography>
      <MeasurementsSearch
        selectedMeasurements={measurementColumns}
        onAddMeasurementColumn={(measurementColumn) => onAddMeasurementColumns([measurementColumn])}
      />
      {measurementColumns.length ? (
        <List
          component={Stack}
          gap={1}
          sx={{
            my: 1,
            p: 0.5,
            maxHeight: '100%',
            overflowY: 'auto'
          }}
          disablePadding>
          {measurementColumns.map((measurement) => (
            <Box display="flex" alignItems="flex-start" key={`measurement_item_${measurement.taxon_measurement_id}`}>
              <MeasurementStandardCard
                small
                label={measurement.measurement_name}
                description={measurement.measurement_desc ?? ''}
                options={'options' in measurement ? measurement['options'] : []}
              />
              <Box ml={1} mt={1}>
                <IconButton
                  aria-label="Remove measurement column"
                  onClick={() => onRemoveMeasurementColumns([measurement.taxon_measurement_id])}
                  data-testid="configure-measurement-column-remove-button">
                  <Icon path={mdiTrashCanOutline} size={1} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </List>
      ) : (
        <Box mt={5} display="flex" justifyContent="center" alignItems="center">
          <Typography color="textSecondary">No measurements selected</Typography>
        </Box>
      )}
    </Box>
  );
};
