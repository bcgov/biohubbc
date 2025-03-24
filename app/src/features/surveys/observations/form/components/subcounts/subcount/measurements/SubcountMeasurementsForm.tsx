import { SubcountMeasurementField } from 'features/surveys/observations/form/components/subcounts/subcount/measurements/components/SubcountMeasurementField';
import { FieldArray } from 'formik';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import {
  SubcountQualitativeMeasurement,
  SubcountQuantitativeMeasurement
} from 'interfaces/useObservationApi.interface';

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

  if (!measurementTypeDefinitions.length) {
    // No measurement type definitions, therefore no measurement fields to render
    return null;
  }

  // The formik field name for the measurements array, for the current subcount record
  const measurementsFieldName = `${formikFieldName}.measurements`;

  return (
    <FieldArray
      name={measurementsFieldName}
      render={() => {
        // For each measurement type definition, render a form field
        return measurementTypeDefinitions.map((measurementTypeDefinition, index) => {
          // The formik field name for this specific measurement field, in the measurements array
          const measurementsArrayFieldName = `${measurementsFieldName}[${index}]`;

          return (
            <SubcountMeasurementField
              key={measurementTypeDefinition.taxon_measurement_id}
              formikFieldName={measurementsArrayFieldName}
              measurementTypeDefinition={measurementTypeDefinition}
              displayHeader={enableHeaders}
              onDelete={() => onDeleteMeasurement(measurementTypeDefinition.taxon_measurement_id)}
            />
          );
        });
      }}
    />
  );
};
