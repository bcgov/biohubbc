import { mdiMinusCircle, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HelpButtonStack from 'components/buttons/HelpButtonStack';
import {
  initialSubcountFormData,
  SubcountForm,
  subcountValidationSchema
} from 'features/surveys/observations/form/components/subcounts/components/subcount/SubcountForm';
import { ObservationFormData, SubcountFormData } from 'features/surveys/observations/form/ObservationForm.interface';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useFocalOrObservedSpeciesTsns } from 'hooks/useFocalOrObservedTsns';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { get } from 'lodash-es';
import { useState } from 'react';
import yup from 'utils/YupSchema';
import { v4 } from 'uuid';
import { MeasurementsSearch } from '../../../observations-table/configure-columns/components/measurements/search/MeasurementsSearch';

export const subcountsValidationSchema = yup.object({
  subcounts: yup
    .array()
    .of(subcountValidationSchema)
    .min(1, 'At least one subcount is required.')
    .required('At least one subcount is required.')
});

export const initialSubcountsFormData = {
  subcounts: [
    {
      _id: v4(),
      ...initialSubcountFormData
    }
  ]
};

export interface ISubcountsFormProps {
  formikPrefixPath: string;
}

/**
 * Form component for observation subcounts.
 *
 * @param {ISubcountsFormProps} props
 * @return {*}
 */
export const SubcountsForm = (props: ISubcountsFormProps) => {
  const { formikPrefixPath } = props;

  const formikFieldName = formikPrefixPath ? `${formikPrefixPath}.subcounts` : 'subcounts';

  const { values, setFieldValue } = useFormikContext<ObservationFormData>();

  console.log(values);

  const [, allSpeciesWithParentsTsns] = useFocalOrObservedSpeciesTsns();

  // Keep selected measurements in state to get measurement names
  const [selectedMeasurementTypeDefinitions, setSelectedMeasurementTypeDefinitions] = useState<CBMeasurementType[]>([]);

  // Adds a new measurement column to the data grid
  const handleAddMeasurement = (measurement: CBMeasurementType) => {
    // Add the measurement to selectedMeasurements state
    setSelectedMeasurementTypeDefinitions((prev) => [...prev, measurement]);

    // Update subcounts with the new measurement
    const subcounts = get(values, formikFieldName)?.map((subcount: SubcountFormData) => ({
      ...subcount,
      measurements: [
        ...subcount.measurements,
        {
          measurement_option_id: null,
          measurement_id: measurement.taxon_measurement_id
        }
      ]
    }));

    setFieldValue(formikFieldName, subcounts);
  };

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
    setFieldValue(formikFieldName, updatedSubcounts);
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
          name={formikFieldName}
          render={(arrayHelpers: FieldArrayRenderProps) => {
            return (
              <>
                <Box sx={{ overflow: 'auto' }}>
                  {values.subcounts.map((subcount, index) => {
                    const formikSubcountArrayItemFieldName = formikFieldName
                      ? `${formikFieldName}.[${index}]`
                      : `[${index}]`;
                    const enableHeaders = index === 0;
                    const disableRemoveSubcount = values.subcounts.length <= 1;

                    return (
                      <Stack gap={2} direction="row" maxWidth="100%" key={subcount._id} sx={{ mb: 2 }}>
                        <SubcountForm
                          formikPrefixPath={formikSubcountArrayItemFieldName}
                          subcountFormData={subcount}
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
                    // Add a new empty subcount item to the subcounts array
                    arrayHelpers.push({
                      _id: v4(),
                      ...initialSubcountFormData,
                      measurements: selectedMeasurementTypeDefinitions.map((measurement) => ({
                        measurement_option_id: null,
                        measurement_id: measurement.taxon_measurement_id
                      }))
                    });
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
