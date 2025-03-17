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
   *
   * Each measurement type definition will be rendered as a form field.
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

  // The formik field name for the measurements array
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
        // Render a form field for each measurement type definition
        return measurementTypeDefinitions.map((measurementTypeDefinition, index) => {
          // Find the corresponding formik value for this measurement type definition, if one exists
          const measurementFormValue = measurements.find(
            (measurement) => measurementTypeDefinition.taxon_measurement_id === measurement.measurement_id
          );

          // The formik field name for this specific measurement field, in the measurements array
          const measurementsArrayFieldName = `${measurementsFieldName}[${index}]`;

          return (
            <SubcountMeasurementField
              key={measurementFormValue?.measurement_id ?? index}
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
