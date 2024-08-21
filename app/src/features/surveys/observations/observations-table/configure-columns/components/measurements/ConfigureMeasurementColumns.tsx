import { mdiArrowTopRight, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import { blueGrey, grey } from '@mui/material/colors';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
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

  const [isFocalSpeciesMeasurementsOnly, setIsFocalSpeciesMeasurementsOnly] = useState<boolean>(true);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Typography variant="h5" mb={2}>
        Add Species Attributes
      </Typography>
      <MeasurementsSearch
        selectedMeasurements={measurementColumns}
        onAddMeasurementColumn={(measurementColumn) => onAddMeasurementColumns([measurementColumn])}
        priorityOnly={isFocalSpeciesMeasurementsOnly}
      />
      <FormGroup>
        <FormControlLabel
          slotProps={{ typography: { variant: 'body1' } }}
          sx={{
            my: 1.5,
            ml: '4px',
            '& .MuiCheckbox-root': {
              mr: 0.5
            },
            color: grey[600]
          }}
          label="Only show measurements applicable to focal or observed species"
          control={
            <Checkbox
              checked={isFocalSpeciesMeasurementsOnly}
              onClick={() => setIsFocalSpeciesMeasurementsOnly((prev) => !prev)}
            />
          }
        />
      </FormGroup>
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
        </List>
      ) : (
        <NoDataOverlay
          minHeight="200px"
          title="Add Species Attributes"
          subtitle="Select species attributes to include in your observations data. There are currently none selected."
          icon={mdiArrowTopRight}
        />
      )}
    </Box>
  );
};
