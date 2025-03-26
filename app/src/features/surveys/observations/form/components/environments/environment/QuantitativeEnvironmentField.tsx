import CustomTextField from 'components/fields/CustomTextField';
import { EnvironmentQuantitativeTypeDefinition } from 'interfaces/useReferenceApi.interface';

export interface IQuantitativeEnvironmentFieldProps {
  formikFieldName: string;
  environmentTypeDefinition: EnvironmentQuantitativeTypeDefinition;
}

/**
 * Subcount Quantitative Measurement Field component.
 *
 * @param {IQuantitativeEnvironmentFieldProps} props
 * @return {*}
 */
export const QuantitativeEnvironmentField = (props: IQuantitativeEnvironmentFieldProps) => {
  const { formikFieldName, environmentTypeDefinition } = props;

  const QuantitativeEnvironmentFieldName = `${formikFieldName}.measurement_value`;

  return (
    <CustomTextField
      label={`${environmentTypeDefinition.name} ${
        environmentTypeDefinition.unit ? `(${environmentTypeDefinition.unit})` : ''
      }`}
      name={QuantitativeEnvironmentFieldName}
      other={{ type: 'number' }}
    />
  );
};
