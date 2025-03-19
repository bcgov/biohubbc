import { mdiMinusCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  CreateObservationFormData,
  UpdateObservationFormData
} from 'features/surveys/observations/form/components/ObservationForm.interface';
import { SubcountQualitativeMeasurementField } from 'features/surveys/observations/form/components/subcounts/subcount/measurements/components/SubcountQualitativeMeasurementField';
import { SubcountQuantitativeMeasurementField } from 'features/surveys/observations/form/components/subcounts/subcount/measurements/components/SubcountQuantitativeMeasurementField';
import { isCBQualitativeMeasurementTypeDefinition } from 'features/surveys/observations/utils/type-guard-utils';
import { useFormikContext } from 'formik';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';

export interface ISubcountMeasurementFieldProps {
  /**
   * The formik path prefix for the field. May be empty.
   */
  formikFieldName: string;
  /**
   * The measurement type definition for the measurement field.
   */
  measurementTypeDefinition: CBMeasurementType;
  /**
   * Whether to display a header with the measurement name and a delete button.
   */
  displayHeader?: boolean;
  /**
   * Callback fired when the delete button is clicked.
   *
   * The delete button is only displayed if displayHeader is true.
   */
  onDelete?: () => void;
}

/**
 * Subcount Measurement Field component.
 *
 * @param {ISubcountMeasurementFieldProps} props
 * @return {*}
 */
export const SubcountMeasurementField = (props: ISubcountMeasurementFieldProps) => {
  const { formikFieldName, measurementTypeDefinition, displayHeader, onDelete } = props;

  const { setFieldValue } = useFormikContext<CreateObservationFormData | UpdateObservationFormData>();

  const isQualitativeMeasurement = isCBQualitativeMeasurementTypeDefinition(measurementTypeDefinition);

  return (
    <Box minWidth="300px" flex={1}>
      {displayHeader === true && (
        <Stack direction="row" alignItems="center" gap={1} my={1.75} sx={{ position: 'relative' }}>
          <Typography fontWeight={700} textTransform="uppercase" variant="body2" flex={0.9}>
            {measurementTypeDefinition.measurement_name}
          </Typography>
          <IconButton
            color="error"
            onClick={onDelete}
            aria-label="remove measurement"
            sx={{ position: 'absolute', zIndex: 99, right: 0 }}>
            <Icon path={mdiMinusCircle} size={0.8} />
          </IconButton>
        </Stack>
      )}

      {isQualitativeMeasurement ? (
        <SubcountQualitativeMeasurementField
          formikFieldName={formikFieldName}
          measurementTypeDefinition={measurementTypeDefinition}
          onChange={(_, option) => {
            setFieldValue(formikFieldName, {
              measurement_id: measurementTypeDefinition.taxon_measurement_id,
              measurement_option_id: option?.value ?? null
            });
          }}
        />
      ) : (
        <SubcountQuantitativeMeasurementField
          formikFieldName={formikFieldName}
          measurementTypeDefinition={measurementTypeDefinition}
          onChange={(event) => {
            let value: number | null = null;
            if (event.target.value !== '') {
              value = Number(event.target.value);
            }

            setFieldValue(formikFieldName, {
              measurement_id: measurementTypeDefinition.taxon_measurement_id,
              measurement_value: value
            });
          }}
        />
      )}
    </Box>
  );
};
