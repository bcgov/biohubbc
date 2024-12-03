import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Box, Button, Stack, Typography } from '@mui/material';
import HelpButtonStack from 'components/buttons/HelpButtonStack';
import { IObservationForm } from 'features/surveys/observations/form/ObservationForm.interface';
import { useFormikContext } from 'formik';
import { useFocalOrObservedSpeciesTsns } from 'hooks/useFocalOrObservedTsns';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import { v4 } from 'uuid';
import { MeasurementsSearch } from '../../observations-table/configure-columns/components/measurements/search/MeasurementsSearch';
import { MeasurementRow } from './measurements/ObservationMeasurementRowForm';

/**
 * Returns a grid-like stack of autocomplete components for creating subcounts with optional measurements
 *
 * @returns
 */
export const SubcountForm = () => {
  const { values, setFieldValue } = useFormikContext<IObservationForm>();
  const [, allSpeciesWithParentsTsns] = useFocalOrObservedSpeciesTsns();

  // Keep selected measurements in state to get measurement names
  const [selectedMeasurements, setSelectedMeasurements] = useState<CBMeasurementType[]>([]);

  // Adds a new measurement column to the data grid
  const handleAddMeasurement = (measurement: CBMeasurementType) => {
    // Add the measurement to selectedMeasurements state
    setSelectedMeasurements((prev) => [...prev, measurement]);

    // Update subcounts with the new measurement
    const subcounts = values.subcounts.map((subcount) => ({
      ...subcount,
      measurements: [
        ...subcount.measurements,
        {
          measurement_option_id: null,
          measurement_id: measurement.taxon_measurement_id
        }
      ]
    }));

    setFieldValue('subcounts', subcounts);
  };

  const handleRemoveMeasurement = (taxonMeasurementId: string) => {
    // Remove the measurement from all subcounts
    const updatedSubcounts = values.subcounts.map((subcount) => ({
      ...subcount,
      measurements: subcount.measurements.filter((measurement) => measurement.measurement_id !== taxonMeasurementId)
    }));

    setFieldValue('subcounts', updatedSubcounts);
  };

  const handleRemoveSubcount = (_id: string) => {
    const updatedSubcounts = values.subcounts.filter((subcount) => subcount._id !== _id);
    setFieldValue('subcounts', updatedSubcounts);
  };

  return (
    <>
      <Box mb={2}>
        <HelpButtonStack
          mb={1}
          helpText="Add attributes to subcounts to record the number of species with specific characteristics, such as the number of adult males">
          <Typography fontWeight={700}>Select Attributes</Typography>
        </HelpButtonStack>

        <MeasurementsSearch
          onAddMeasurementColumn={handleAddMeasurement}
          selectedMeasurements={selectedMeasurements}
          tsns={values.standardColumns.itis_tsn ? [values.standardColumns.itis_tsn] : []}
          applicableTsns={allSpeciesWithParentsTsns}
        />
      </Box>

      <Stack gap={2} sx={{ overflowX: 'auto', whiteSpace: 'nowrap', pb: 1, mb: 1 }} maxWidth="100%">
        {values.subcounts.map((subcount, index) => (
          <MeasurementRow
            key={subcount._id}
            index={index}
            subcount={subcount}
            selectedMeasurements={selectedMeasurements}
            handleRemoveMeasurement={handleRemoveMeasurement}
            handleRemoveSubcount={handleRemoveSubcount}
            disableRemoveSubcount={values.subcounts.length < 2}
          />
        ))}
      </Stack>

      <Button
        color="primary"
        variant="outlined"
        startIcon={<Icon path={mdiPlus} size={1} />}
        aria-label="add subcount"
        disabled={values.subcounts.every((subcount) => !subcount.measurements || subcount.measurements.length === 0)}
        onClick={() => {
          // Collect all the measurements across existing subcounts
          const allMeasurements = values.subcounts.flatMap((subcount) => subcount.measurements);

          // Get unique measurements based on critterbase_taxon_measurement_id
          const uniqueMeasurements = Array.from(
            new Map(allMeasurements.map((measurement) => [measurement.measurement_id, measurement])).values()
          );

          // Create a new subcount with unique measurements and null values
          setFieldValue('subcounts', [
            ...values.subcounts,
            {
              _id: v4(),
              subcount: null,
              measurements: uniqueMeasurements.map((measurement) => ({
                measurement_option_id: null,
                measurement_id: measurement.measurement_id,
                _id: v4()
              }))
            }
          ]);
        }}>
        Add Subcount
      </Button>
    </>
  );
};
