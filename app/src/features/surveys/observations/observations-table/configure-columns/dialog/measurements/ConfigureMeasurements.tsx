import { Box, Stack, Typography } from '@mui/material';
import MeasurementStandardCard from 'features/standards/view/components/MeasurementStandardCard';
import { useObservationsTableContext } from 'hooks/useContext';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import MeasurementActions from './MeasurementActions';
import { MeasurementsSearch } from './search/MeasurementsSearch';

const ConfigureMeasurements = () => {
  const { stagedMeasurementColumns, setStagedMeasurementColumns } = useObservationsTableContext();

  const onSelect = (measurementToAdd: CBMeasurementType) => {
    setStagedMeasurementColumns((currentMeasurements) =>
      [...currentMeasurements, measurementToAdd].filter(
        (item1, index, self) =>
          index === self.findIndex((item2) => item2.taxon_measurement_id === item1.taxon_measurement_id)
      )
    );
  };

  return (
    <>
      <MeasurementsSearch selectedMeasurements={stagedMeasurementColumns} onSelect={onSelect} />
      <Box mt={3}>
        {stagedMeasurementColumns.length ? (
          <>
            <Typography variant="h5" sx={{ fontWeight: 500 }} color="textSecondary" mb={2}>
              Selected measurements
            </Typography>
            <Stack gap={2} sx={{ overflowY: 'auto' }} maxHeight={400}>
              {stagedMeasurementColumns.map((measurement) => (
                <Box display="flex" alignItems="flex-start">
                  <MeasurementStandardCard
                    label={measurement.measurement_name}
                    description={measurement.measurement_desc ?? ''}
                  />
                  <Box mt={1}>
                    <MeasurementActions measurement={measurement} />
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

export default ConfigureMeasurements;
