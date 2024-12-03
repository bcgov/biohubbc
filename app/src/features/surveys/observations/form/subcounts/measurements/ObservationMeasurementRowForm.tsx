import { mdiMinusCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { IObservationSubcountForm } from 'features/surveys/observations/form/ObservationForm.interface';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';

/**
 * Measurement Row component that renders each subcount and its measurements.
 */
export const MeasurementRow = ({
  index,
  subcount,
  selectedMeasurements,
  handleRemoveMeasurement,
  handleRemoveSubcount,
  disableRemoveSubcount
}: {
  index: number;
  subcount: IObservationSubcountForm;
  selectedMeasurements: CBMeasurementType[];
  handleRemoveMeasurement: (taxonMeasurementId: string) => void;
  handleRemoveSubcount: (_id: string) => void;
  disableRemoveSubcount: boolean;
}) => {
  return (
    <Stack flexDirection="row" gap={1}>
      <Box flex="1 1 auto" minWidth="200px">
        {index === 0 && (
          <Typography fontWeight={700} textTransform="uppercase" variant="body2" my={2}>
            Count
          </Typography>
        )}
        <CustomTextField label="Subcount" name={`subcounts.[${index}].subcount`} other={{ type: 'number' }} />
      </Box>

      {subcount.measurements.map((measurement, measurement_index) => {
        const selectedMeasurement = selectedMeasurements.find(
          (selectedMeasurement) => selectedMeasurement.taxon_measurement_id === measurement.measurement_id
        );

        if (selectedMeasurement) {
          return (
            <Box key={measurement.measurement_id} minWidth="300px" flex={1}>
              {index === 0 && (
                <Stack direction="row" alignItems="center" gap={1} my={2} sx={{ position: 'relative' }}>
                  <Typography fontWeight={700} textTransform="uppercase" variant="body2" flex={0.9}>
                    {selectedMeasurement.measurement_name}
                  </Typography>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveMeasurement(measurement.measurement_id)}
                    aria-label="remove measurement"
                    sx={{ position: 'absolute', zIndex: 99, right: 0 }}>
                    <Icon path={mdiMinusCircle} size={0.8} />
                  </IconButton>
                </Stack>
              )}

              {'options' in selectedMeasurement ? (
                <AutocompleteField
                  label={selectedMeasurement.measurement_name}
                  name={`subcounts.[${index}].measurements[${measurement_index}].measurement_option_id`}
                  id={`subcounts.[${index}].measurements[${measurement_index}].measurement_option_id`}
                  options={selectedMeasurement.options.map((option) => ({
                    label: option.option_label,
                    value: option.qualitative_option_id
                  }))}
                />
              ) : (
                <CustomTextField
                  label={`${selectedMeasurement.measurement_name} ${
                    selectedMeasurement.unit ? `(${selectedMeasurement.unit})` : ''
                  }`}
                  name={`subcounts.[${index}].measurements[${measurement_index}].measurement_value`}
                  other={{ type: 'number' }}
                />
              )}
            </Box>
          );
        }
      })}

      {/* Margin top to align the icon button with the autocompletes in the first row, which isn't centered because of the header labels */}
      <Box sx={{ display: 'flex', alignItems: 'center', mt: index === 0 ? '55px' : 0 }}>
        <IconButton
          color="error"
          aria-label="remove subcount"
          disabled={disableRemoveSubcount}
          onClick={() => {
            subcount._id && handleRemoveSubcount(subcount._id);
          }}>
          <Icon path={mdiMinusCircle} size={0.8} />
        </IconButton>
      </Box>
    </Stack>
  );
};
