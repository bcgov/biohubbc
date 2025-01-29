import { mdiMinusCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SubcountQualitativeMeasurementField } from 'features/surveys/observations/form/components/subcounts/subcount/measurements/SubcountQualitativeMeasurementField';
import { SubcountQuantitativeMeasurementField } from 'features/surveys/observations/form/components/subcounts/subcount/measurements/SubcountQuantitativeMeasurementField';
import {
  CBMeasurementType,
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';

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
  const { formikFieldName, measurementTypeDefinition, onDelete, displayHeader } = props;

  const isQualitative = isCBQualitativeMeasurementTypeDefinition(measurementTypeDefinition);

  return (
    <Box minWidth="300px" flex={1}>
      {displayHeader === true && (
        <Stack direction="row" alignItems="center" gap={1} my={2} sx={{ position: 'relative' }}>
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

      {isQualitative ? (
        <SubcountQualitativeMeasurementField
          formikFieldName={formikFieldName}
          measurementTypeDefinition={measurementTypeDefinition}
        />
      ) : (
        <SubcountQuantitativeMeasurementField
          formikFieldName={formikFieldName}
          measurementTypeDefinition={measurementTypeDefinition}
        />
      )}
    </Box>
  );
};

/**
 * Type guard to check if a given item is a `CBQualitativeMeasurementTypeDefinition`.
 *
 * Qualitative measurements have an `options` property, while quantitative measurements do not.
 *
 * @export
 * @param {(CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition)} item
 * @return {*}  {item is CBQuantitativeMeasurementTypeDefinition}
 */
export function isCBQualitativeMeasurementTypeDefinition(
  item: CBQualitativeMeasurementTypeDefinition | CBQuantitativeMeasurementTypeDefinition
): item is CBQualitativeMeasurementTypeDefinition {
  return 'options' in item;
}
