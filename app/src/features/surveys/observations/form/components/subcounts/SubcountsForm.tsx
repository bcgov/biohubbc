import { mdiMinusCircle, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HelpButtonStack from 'components/buttons/HelpButtonStack';
import { SubcountForm } from 'features/surveys/observations/form/components/subcounts/subcount/SubcountForm';
import { SubcountFormData } from 'features/surveys/observations/form/components/subcounts/subcount/SubcountForm.interface';
import {
  CreateObservationFormData,
  UpdateObservationFormData
} from 'features/surveys/observations/form/ObservationForm.interface';
import { FieldArray, useFormikContext } from 'formik';
import { useFocalOrObservedSpeciesTsns } from 'hooks/useFocalOrObservedTsns';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import get from 'lodash-es/get';
import { useEffect, useMemo, useState } from 'react';
import { v4 } from 'uuid';
import { MeasurementsSearch } from '../../../observations-table/configure-columns/components/measurements/search/MeasurementsSearch';

export const initialSubcountFormData: SubcountFormData = {
  _id: v4(),
  observation_subcount_id: null,
  subcount: null,
  comment: null,
  measurements: []
};

export interface ISubcountsFormProps {
  initialMeasurementTypeDefinitions?: CBMeasurementType[];
}

/**
 * Form component for observation subcounts.
 *
 * @return {*}
 */
export const SubcountsForm = (props: ISubcountsFormProps) => {
  const { initialMeasurementTypeDefinitions } = props;

  const { values, setFieldValue } = useFormikContext<CreateObservationFormData | UpdateObservationFormData>();

  const [, allSpeciesWithParentsTsns] = useFocalOrObservedSpeciesTsns();

  // The measurement type defintions that have either been selected by the user or passed in as props
  const [selectedMeasurementTypeDefinitions, setSelectedMeasurementTypeDefinitions] = useState<CBMeasurementType[]>(
    initialMeasurementTypeDefinitions ?? []
  );

  useEffect(() => {
    if (!initialMeasurementTypeDefinitions?.length || selectedMeasurementTypeDefinitions.length) {
      return;
    }

    // Set the selected measurements to the initial measurements if they are not already set
    setSelectedMeasurementTypeDefinitions(initialMeasurementTypeDefinitions);
  }, [initialMeasurementTypeDefinitions, selectedMeasurementTypeDefinitions.length]);

  // Performance: pre-parse the selected measurements into the structure expected by the subcount form.
  const selectedMeasurementsFormData = useMemo(() => {
    return selectedMeasurementTypeDefinitions.map((measurement) => ({
      measurement_option_id: null as unknown as string,
      measurement_id: measurement.taxon_measurement_id
    }));
  }, [selectedMeasurementTypeDefinitions]);

  /**
   * Adds a measurement column to the subcount form.
   *
   * @param {CBMeasurementType} measurement
   */
  const handleAddMeasurement = (measurement: CBMeasurementType) => {
    // Add the measurement to selectedMeasurements state
    setSelectedMeasurementTypeDefinitions((prev) => [...prev, measurement]);

    // Update subcounts with the new measurement
    const subcounts: SubcountFormData[] | undefined = get(values, 'subcounts')?.map((subcount) => ({
      ...subcount,
      measurements: [
        ...subcount.measurements,
        {
          measurement_option_id: null as unknown as string,
          measurement_id: measurement.taxon_measurement_id
        }
      ]
    }));

    setFieldValue('subcounts', subcounts);
  };

  /**
   * Removes a measurement column from the subcount form.
   *
   * @param {string} taxonMeasurementId
   */
  const handleRemoveMeasurement = (taxonMeasurementId: string) => {
    // Remove the measurement from all subcounts
    const updatedSubcounts = values.subcounts.map((subcount) => ({
      ...subcount,
      measurements: subcount.measurements.filter((measurement) => measurement.measurement_id !== taxonMeasurementId)
    }));

    // Remove the measurement from the selected measurements state
    setSelectedMeasurementTypeDefinitions((prev) =>
      prev.filter((measurement) => measurement.taxon_measurement_id !== taxonMeasurementId)
    );

    // Update the formik state with the updated subcounts
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
          selectedMeasurements={selectedMeasurementTypeDefinitions}
          tsns={values.standardColumns.itis_tsn ? [values.standardColumns.itis_tsn] : []}
          applicableTsns={allSpeciesWithParentsTsns}
        />
      </Box>

      <Box sx={{ overflowX: 'auto', whiteSpace: 'nowrap', pb: 2 }}>
        <FieldArray
          name={'subcounts'}
          render={(arrayHelpers) => {
            const subcountsFormData: SubcountFormData[] | undefined = get(values, 'subcounts');

            return (
              <>
                <Box sx={{ overflow: 'auto' }}>
                  {subcountsFormData?.map((subcount, index) => {
                    const subcountsArrayFieldName = `subcounts[${index}]`;

                    const enableHeaders = index === 0;
                    const disableRemoveSubcount = values.subcounts.length <= 1;

                    return (
                      <Stack gap={2} direction="row" maxWidth="100%" key={subcount._id} sx={{ mb: 2 }}>
                        <SubcountForm
                          formikFieldName={subcountsArrayFieldName}
                          measurementTypeDefinitions={selectedMeasurementTypeDefinitions}
                          onDeleteMeasurement={handleRemoveMeasurement}
                          enableHeaders={enableHeaders}
                          key={subcount._id}
                        />

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            // Add margin-top to align the remove icon with the component in the first row, which isn't centered because of the header labels
                            ...(enableHeaders === true ? { mt: 6.5 } : { mt: 0 })
                          }}>
                          <IconButton
                            color="error"
                            aria-label="remove subcount"
                            disabled={disableRemoveSubcount}
                            onClick={() => {
                              // Remove the subcount from the subcounts array
                              arrayHelpers.remove(index);
                            }}>
                            <Icon path={mdiMinusCircle} size={0.8} />
                          </IconButton>
                        </Box>
                      </Stack>
                    );
                  })}
                </Box>
                <Button
                  color="primary"
                  variant="outlined"
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  aria-label="add subcount"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    const item: SubcountFormData = {
                      _id: v4(),
                      ...initialSubcountFormData,
                      measurements: selectedMeasurementsFormData
                    };

                    // Add a new empty subcount item to the subcounts array
                    arrayHelpers.push(item);
                  }}>
                  Add Subcount
                </Button>
              </>
            );
          }}
        />
      </Box>
    </>
  );
};
