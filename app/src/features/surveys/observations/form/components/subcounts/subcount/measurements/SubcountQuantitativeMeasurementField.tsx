import CustomTextField from 'components/fields/CustomTextField';
import { CBQuantitativeMeasurementTypeDefinition } from 'interfaces/useCritterApi.interface';

export interface ISubcountQuantitativeMeasurementFieldProps {
  formikFieldName: string;
  measurementTypeDefinition: CBQuantitativeMeasurementTypeDefinition;
}

/**
 * Subcount Quantitative Measurement Field component.
 *
 * @param {ISubcountQuantitativeMeasurementFieldProps} props
 * @return {*}
 */
export const SubcountQuantitativeMeasurementField = (props: ISubcountQuantitativeMeasurementFieldProps) => {
  const { formikFieldName, measurementTypeDefinition } = props;

  const subcountQuantitativeMeasurementFieldName = `${formikFieldName}.measurement_value`;

  return (
    <CustomTextField
      label={`${measurementTypeDefinition.measurement_name} ${
        measurementTypeDefinition.unit ? `(${measurementTypeDefinition.unit})` : ''
      }`}
      name={subcountQuantitativeMeasurementFieldName}
      other={{ type: 'number' }}
    />
  );
};
