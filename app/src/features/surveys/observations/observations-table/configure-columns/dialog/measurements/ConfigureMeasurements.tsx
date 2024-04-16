import { Box, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import MeasurementStandardCard from 'features/standards/view/components/MeasurementStandardCard';
import { useObservationsTableContext } from 'hooks/useContext';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import MeasurementActions from './MeasurementActions';
import { MeasurementsSearch } from './search/MeasurementsSearch';

const ConfigureMeasurements = () => {
  const observationsTableContext = useObservationsTableContext();
  const [selectedMeasurements, setSelectedMeasurements] = useState<CBMeasurementType[]>(
    observationsTableContext.measurementColumns
  );

  // /**
  //  * Handles the removal of measurement columns from the table.
  //  *
  //  * @param {string[]} measurementColumnsToRemove The `field` names of the columns to remove
  //  */
  // const onRemoveMeasurements = useCallback(
  //   (measurementColumnsToRemove: string[]) => {
  //     // Delete the measurement columns from the database
  //     observationsTableContext.deleteObservationMeasurementColumns(measurementColumnsToRemove, () => {
  //       // Remove the measurement columns from the table context
  //       observationsTableContext.setMeasurementColumns((currentColumns) => {
  //         const remainingColumns = currentColumns.filter(
  //           (currentColumn) => !measurementColumnsToRemove.includes(currentColumn.taxon_measurement_id)
  //         );

  //         // Store all remaining measurement definitions in local storage
  //         sessionStorage.setItem(
  //           getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS),
  //           JSON.stringify(remainingColumns)
  //         );

  //         return remainingColumns;
  //       });
  //     });
  //   },
  //   [observationsTableContext, surveyId]
  // );

  const onSelectOptions = (measurementsToAdd: CBMeasurementType[]) => {
    setSelectedMeasurements((currentMeasurements) => {
      return (
        currentMeasurements &&
        [...currentMeasurements, ...measurementsToAdd].filter(
          (item1, index, self) =>
            index === self.findIndex((item2) => item2.taxon_measurement_id === item1.taxon_measurement_id)
        )
      );
    });
  };

  return (
    <Box>
      <MeasurementsSearch selectedMeasurements={selectedMeasurements} onSelectOptions={onSelectOptions} />

      <Box mt={3}>
        {' '}
        {selectedMeasurements.length ? (
          <>
            <Typography variant="h5" sx={{ fontWeight: 500 }} color="textSecondary" mb={2}>
              Selected measurements
            </Typography>
            <Stack gap={2}>
              {selectedMeasurements.map((measurement) => (
                <Box display="flex" alignItems="flex-start">
                  <MeasurementStandardCard
                    label={measurement.measurement_name}
                    description={measurement.measurement_desc ?? ''}
                  />
                  <Box mt={1}>
                    <MeasurementActions measurement={measurement} setSelectedMeasurements={setSelectedMeasurements} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </>
        ) : (
          <Box bgcolor={grey[100]} minHeight="150px" display="flex" justifyContent="center" alignItems="center">
            <Typography color={grey[500]}>No measurements selected</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ConfigureMeasurements;
