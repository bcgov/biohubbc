import { mdiClose } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArrayRenderProps, useFormikContext } from 'formik';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  ICreateEditCaptureRequest
} from 'interfaces/useCritterApi.interface';
import { useMemo } from 'react';
import CaptureQualitativeMeasurementsOptionSelect from './CaptureQualitativeMeasurementsOptionSelect';

interface ICaptureMeasurementSelectProps {
  // The collection units (categories) available to select from
  measurements: (CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition)[];
  // Formik field array helpers
  arrayHelpers: FieldArrayRenderProps;
  // The index of the field array for these controls
  index: number;
}

/**
 * Returns a component for selecting ecological (ie. collection) units for a given species.
 *
 * @param {ICaptureMeasurementsSelect} props
 * @return {*}
 */
export const CaptureMeasurementSelect = (props: ICaptureMeasurementSelectProps) => {
  const { index, measurements } = props;

  const { values, setFieldValue } = useFormikContext<ICreateEditCaptureRequest>();

  const selectedTaxonMeasurement =
    measurements.find(
      (measurement) => measurement.taxon_measurement_id === values.measurements[index]?.taxon_measurement_id
    ) ?? null;

  // Filter out the categories that are already selected so they can't be selected again
  const filteredCategories = useMemo(
    () =>
      measurements
        .filter(
          (measurement) =>
            !values.measurements.some(
              (existing) =>
                existing.taxon_measurement_id === measurement.taxon_measurement_id &&
                measurement.taxon_measurement_id !== selectedTaxonMeasurement?.taxon_measurement_id
            )
        )
        .map((option) => {
          return {
            value: option.taxon_measurement_id,
            label:
              option.measurement_name ??
              measurements.find((measurement) => measurement.taxon_measurement_id === option.taxon_measurement_id)
                ?.measurement_name
          };
        }) ?? [],
    [measurements, values.measurements]
  );

  return (
    <Collapse in role="listitem">
      <Card
        component={Stack}
        variant="outlined"
        flexDirection="row"
        alignItems="flex-start"
        gap={2}
        sx={{
          width: '100%',
          p: 2,
          backgroundColor: grey[100]
        }}>
        <AutocompleteField
          id={`measurements.[${index}].taxon_measurement_id`}
          name={`measurements.[${index}].taxon_measurement_id`}
          label="Measurement"
          options={filteredCategories}
          //   loading={ecologicalUnitOptionDataLoader.isLoading}
          onChange={(_, option) => {
            if (option?.value) {
              setFieldValue(`measurements.[${index}].taxon_measurement_id`, option.value);
            }
          }}
          required
          sx={{
            flex: '0.5'
          }}
        />

        <Box flex="0.5">
          {/* Qualitative measurement option select */}
          {selectedTaxonMeasurement && 'options' in selectedTaxonMeasurement ? (
            <CaptureQualitativeMeasurementsOptionSelect
              index={index}
              options={selectedTaxonMeasurement.options.map((option) => ({
                label: option.option_label,
                value: option.qualitative_option_id
              }))}
              label="Value"
            />
          ) : (
            <CustomTextField
              name={`measurements.[${index}].value`}
              label={`Value ${selectedTaxonMeasurement?.unit ? `(${selectedTaxonMeasurement.unit})` : ''}`}
              other={{
                required: true,
                type: 'number',
                placeholder: 'Value'
              }}
            />
          )}
        </Box>

        <IconButton
          data-testid={`measurement-delete-button-${index}`}
          title="Remove Measurement"
          aria-label="Remove Measurement"
          onClick={() => props.arrayHelpers.remove(index)}
          sx={{ mt: 1.125 }}>
          <Icon path={mdiClose} size={1} />
        </IconButton>
      </Card>
    </Collapse>
  );
};

export default CaptureMeasurementSelect;
