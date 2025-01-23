import { Stack } from '@mui/material';
import { SubcountMeasurementField } from 'features/surveys/observations/form/components/subcounts/components/measurements/components/SubcountMeasurementField';
import { SubcountFormData } from 'features/surveys/observations/form/ObservationForm.interface';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';

export interface ISubcountMeasurementRowFormProps {
  formikPrefixPath: string;
  subcount: SubcountFormData;
  measurementTypeDefinitions: CBMeasurementType[];
  onDeleteMeasurement: (taxonMeasurementId: string) => void;
  enableHeaders?: boolean;
}

/**
 * Subcount Measurement Row component that renders each subcount and its measurements.
 *
 * @param {ISubcountMeasurementRowFormProps} props
 * @return {*}
 */
export const SubcountMeasurementRowForm = (props: ISubcountMeasurementRowFormProps) => {
  const { formikPrefixPath, subcount, measurementTypeDefinitions, onDeleteMeasurement, enableHeaders } = props;

  console.log('SubcountMeasurementRowForm: ', formikPrefixPath);

  if (subcount.measurements.length === 0) {
    // No measurement fields to render
    return null;
  }

  return (
    <Stack flexDirection="row" gap={1}>
      {subcount.measurements.map((measurement, index) => {
        const measurementTypeDefinition = measurementTypeDefinitions.find(
          (measurementTypeDefinition) => measurementTypeDefinition.taxon_measurement_id === measurement.measurement_id
        );

        if (!measurementTypeDefinition) {
          // Failed to find the corresponding measurement type definition for the measurement form field
          return null;
        }

        const formikFieldName = formikPrefixPath ? `${formikPrefixPath}.[${index}]` : `[${index}]`;

        console.log('SubcountMeasurementRowForm item: ', formikFieldName);

        return (
          <SubcountMeasurementField
            key={measurement.measurement_id}
            formikPrefixPath={formikFieldName}
            measurementTypeDefinition={measurementTypeDefinition}
            onDelete={() => onDeleteMeasurement(measurementTypeDefinition.taxon_measurement_id)}
            displayHeader={enableHeaders}
          />
        );
      })}
    </Stack>
  );
};
