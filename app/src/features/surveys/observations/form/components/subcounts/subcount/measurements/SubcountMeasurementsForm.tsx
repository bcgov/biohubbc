import { SubcountMeasurementField } from 'features/surveys/observations/form/components/subcounts/subcount/measurements/SubcountMeasurementField';
import {
  CreateObservationFormData,
  UpdateObservationFormData
} from 'features/surveys/observations/form/ObservationForm.interface';
import { FieldArray, useFormikContext } from 'formik';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import {
  SubcountQualitativeMeasurement,
  SubcountQuantitativeMeasurement
} from 'interfaces/useObservationApi.interface';
import get from 'lodash-es/get';

export interface SubcountMeasurementsForm {
  /**
   * The subcount measurements.
   *
   * @type {((SubcountQualitativeMeasurement | SubcountQuantitativeMeasurement)[])}
   * @memberof SubcountMeasurementsForm
   */
  measurements: (SubcountQualitativeMeasurement | SubcountQuantitativeMeasurement)[];
}

export const initialSubcountMeasurementsFormData: SubcountMeasurementsForm = {
  measurements: []
};

export interface ISubcountMeasurementsFormProps {
  /**
   * The formik field name for the array field.
   */
  formikFieldName: string;
  /**
   * The measurement type definitions.
   */
  measurementTypeDefinitions: CBMeasurementType[];
  /**
   * Callback fired when the delete button is clicked.
   */
  onDeleteMeasurement: (taxonMeasurementId: string) => void;
  /**
   * Whether to display headers for each measurement field.
   */
  enableHeaders?: boolean;
}

/**
 * Subcount Measurements form component that renders an array of measurement fields.
 *
 * @param {ISubcountMeasurementsFormProps} props
 * @return {*}
 */
export const SubcountMeasurementsForm = (props: ISubcountMeasurementsFormProps) => {
  const { formikFieldName, measurementTypeDefinitions, onDeleteMeasurement, enableHeaders } = props;

  const { values } = useFormikContext<CreateObservationFormData | UpdateObservationFormData>();

  const measurementsFieldName = `${formikFieldName}.measurements`;

  const measurements: (SubcountQualitativeMeasurement | SubcountQuantitativeMeasurement)[] | undefined = get(
    values,
    measurementsFieldName
  );

  if (!measurements?.length) {
    // No measurement fields to render
    return null;
  }

  return (
    <FieldArray
      name={measurementsFieldName}
      render={() => {
        return measurements.map((measurement, index) => {
          const measurementTypeDefinition = measurementTypeDefinitions.find(
            (measurementTypeDefinition) => measurementTypeDefinition.taxon_measurement_id === measurement.measurement_id
          );

          if (!measurementTypeDefinition) {
            // Failed to find the corresponding measurement type definition for the measurement form field
            return null;
          }

          const measurementsArrayFieldName = `${measurementsFieldName}[${index}]`;

          return (
            <SubcountMeasurementField
              key={measurement.measurement_id}
              formikFieldName={measurementsArrayFieldName}
              measurementTypeDefinition={measurementTypeDefinition}
              onDelete={() => onDeleteMeasurement(measurementTypeDefinition.taxon_measurement_id)}
              displayHeader={enableHeaders}
            />
          );
        });
      }}
    />
  );
};
