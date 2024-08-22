import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { blueGrey, grey } from '@mui/material/colors';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
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
    <>
      <Typography variant="h5" mb={2}>
        Configure Measurement Columns
      </Typography>
      <MeasurementsSearch
        selectedMeasurements={measurementColumns}
        onAddMeasurementColumn={(measurementColumn) => onAddMeasurementColumns([measurementColumn])}
      />
      <Box mt={3}>
        {measurementColumns.length ? (
          <>
            <Typography variant="h5" sx={{ fontWeight: 500 }} color="textSecondary" mb={2}>
              Selected measurements
            </Typography>
            <Stack gap={2} sx={{ overflowY: 'auto' }} maxHeight={400}>
              {measurementColumns.map((measurement) => (
                <Box
                  display="flex"
                  alignItems="flex-start"
                  key={`measurement_item_${measurement.taxon_measurement_id}`}>
                  <AccordionStandardCard
                    label={measurement.measurement_name}
                    subtitle={measurement.measurement_desc ?? ''}
                    colour={grey[100]}
                    children={
                      'options' in measurement ? (
                        <Stack gap={1} my={2}>
                          {measurement.options.map((option) => (
                            <AccordionStandardCard
                              key={option.option_label}
                              label={option.option_label}
                              subtitle={option.option_desc}
                              colour={grey[200]}
                            />
                          ))}
                        </Stack>
                      ) : undefined
                    }
                    ornament={
                      'unit' in measurement && measurement.unit ? (
                        <ColouredRectangleChip colour={blueGrey} label={measurement.unit} />
                      ) : undefined
                    }
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
            </Stack>
          </>
        ) : (
          <Box mt={5} height={100} display="flex" justifyContent="center" alignItems="center">
            <Typography color="textSecondary">No measurements selected</Typography>
          </Box>
        )}
      </Box>
    </>
  );
};
