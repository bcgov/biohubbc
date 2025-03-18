import CustomTextField from 'components/fields/CustomTextField';
import { CBQuantitativeMeasurementTypeDefinition } from 'interfaces/useCritterApi.interface';
import { ChangeEvent } from 'react';

export interface ISubcountQuantitativeMeasurementFieldProps {
  formikFieldName: string;
  measurementTypeDefinition: CBQuantitativeMeasurementTypeDefinition;
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

/**
 * Subcount Quantitative Measurement Field component.
 *
 * @param {ISubcountQuantitativeMeasurementFieldProps} props
 * @return {*}
 */
export const SubcountQuantitativeMeasurementField = (props: ISubcountQuantitativeMeasurementFieldProps) => {
  const { formikFieldName, measurementTypeDefinition, onChange } = props;

  const subcountQuantitativeMeasurementFieldName = `${formikFieldName}.measurement_value`;

  return (
    <CustomTextField
      label={`${measurementTypeDefinition.measurement_name} ${
        measurementTypeDefinition.unit ? `(${measurementTypeDefinition.unit})` : ''
      }`}
      name={subcountQuantitativeMeasurementFieldName}
      onChange={onChange}
      other={{ type: 'number' }}
    />
  );
};
