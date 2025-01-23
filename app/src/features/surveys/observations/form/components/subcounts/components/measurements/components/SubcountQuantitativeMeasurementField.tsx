import CustomTextField from 'components/fields/CustomTextField';
import { CBQuantitativeMeasurementTypeDefinition } from 'interfaces/useCritterApi.interface';

export interface ISubcountCountFieldProps {
  formikPrefixPath: string;
  measurementTypeDefinition: CBQuantitativeMeasurementTypeDefinition;
}

/**
 * Subcount Quantitative Measurement Field component.
 *
 * @param {ISubcountCountFieldProps} props
 * @return {*}
 */
export const SubcountQuantitativeMeasurementField = (props: ISubcountCountFieldProps) => {
  const { formikPrefixPath, measurementTypeDefinition } = props;

  const formikFieldName = formikPrefixPath ? `${formikPrefixPath}.measurement_value` : 'measurement_value';

  return (
    <CustomTextField
      label={`${measurementTypeDefinition.measurement_name} ${
        measurementTypeDefinition.unit ? `(${measurementTypeDefinition.unit})` : ''
      }`}
      name={formikFieldName}
      other={{ type: 'number' }}
    />
  );
};
