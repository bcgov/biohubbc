import { mdiClose } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { initialMeasurementValues } from 'features/surveys/animals/profile/measurements/MeasurementsForm';
import {
  isQualitativeMeasurementUpdate,
  isQuantitativeMeasurementUpdate
} from 'features/surveys/animals/profile/measurements/utils';
import { FieldArrayRenderProps, useFormikContext } from 'formik';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  IMeasurementsCreate,
  IMeasurementsUpdate
} from 'interfaces/useCritterApi.interface';
import { useMemo } from 'react';

interface IMeasurementSelectProps {
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
 * @template FormikValuesType
 * @param {IMeasurementSelectProps} props
 * @return {*}
 */
export const MeasurementSelect = <FormikValuesType extends IMeasurementsCreate | IMeasurementsUpdate>(
  props: IMeasurementSelectProps
) => {
  const { index, measurements, arrayHelpers } = props;

  const { values, setFieldValue, setFieldTouched, setFieldError } = useFormikContext<FormikValuesType>();

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
    [measurements, selectedTaxonMeasurement?.taxon_measurement_id, values.measurements]
  );

  return (
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
        onChange={(_, option) => {
          if (option?.value) {
            setFieldError(`measurements.[${index}].taxon_measurement_id`, undefined);
            setFieldValue(`measurements.[${index}]`, {
              ...initialMeasurementValues,
              taxon_measurement_id: option.value
            });
            setFieldTouched(`measurements.[${index}]`, true, false);
          }
        }}
        required
        sx={{
          flex: '0.5'
        }}
      />

      <Box flex="0.5">
        {selectedTaxonMeasurement && 'options' in selectedTaxonMeasurement ? (
          <AutocompleteField
            id={`measurements.[${index}].qualitative_option_id`}
            name={`measurements.${index}].qualitative_option_id`}
            label="Value"
            options={selectedTaxonMeasurement.options.map((option) => ({
              label: option.option_label,
              value: option.qualitative_option_id
            }))}
            onChange={(_, option) => {
              if (option?.value) {
                setFieldError(`measurements.[${index}].qualitative_option_id`, undefined);

                const currentMeasurementValue = values.measurements[index];
                setFieldValue(`measurements.[${index}]`, {
                  ...(isQualitativeMeasurementUpdate(currentMeasurementValue) && {
                    measurement_qualitative_id: currentMeasurementValue.measurement_qualitative_id
                  }),
                  taxon_measurement_id: currentMeasurementValue.taxon_measurement_id,
                  qualitative_option_id: option.value,
                  value: undefined
                });

                setFieldTouched(`measurements.[${index}].qualitative_option_id`, true, false);
              }
            }}
            disabled={Boolean(!values.measurements[index].taxon_measurement_id)}
            required
            sx={{
              flex: '1 1 auto'
            }}
          />
        ) : (
          <CustomTextField
            name={`measurements.[${index}].value`}
            label={selectedTaxonMeasurement?.unit ? `Value (${selectedTaxonMeasurement.unit})` : 'Value'}
            other={{
              required: true,
              type: 'number',
              placeholder: 'Value',
              onChange: (event: React.ChangeEvent<any>) => {
                setFieldError(`measurements.[${index}].value`, undefined);

                const currentMeasurementValue = values.measurements[index];
                setFieldValue(`measurements.[${index}]`, {
                  ...(isQuantitativeMeasurementUpdate(currentMeasurementValue) && {
                    measurement_quantitative_id: currentMeasurementValue.measurement_quantitative_id
                  }),
                  taxon_measurement_id: currentMeasurementValue.taxon_measurement_id,
                  qualitative_option_id: undefined,
                  value: Number(event.target.value)
                });

                setFieldTouched(`measurements.[${index}].value`, true, false);
              }
            }}
          />
        )}
      </Box>

      <IconButton
        data-testid={`measurement-delete-button-${index}`}
        title="Remove Measurement"
        aria-label="Remove Measurement"
        onClick={() => arrayHelpers.remove(index)}
        sx={{ mt: 1.125 }}>
        <Icon path={mdiClose} size={1} />
      </IconButton>
    </Card>
  );
};
