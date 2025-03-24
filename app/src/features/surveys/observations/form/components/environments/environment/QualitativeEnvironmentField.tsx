import AutocompleteField from 'components/fields/AutocompleteField';
import { EnvironmentQualitativeTypeDefinition } from 'interfaces/useReferenceApi.interface';

export interface IQualitativeEnvironmentFieldProps {
  formikFieldName: string;
  environmentTypeDefinition: EnvironmentQualitativeTypeDefinition;
}

/**
 * Subcount Qualitative Measurement Field component.
 *
 * @param {IQualitativeEnvironmentFieldProps} props
 * @return {*}
 */
export const QualitativeEnvironmentField = (props: IQualitativeEnvironmentFieldProps) => {
  const { formikFieldName, environmentTypeDefinition } = props;

  const QualitativeEnvironmentFieldName = `${formikFieldName}.measurement_option_id`;

  return (
    <AutocompleteField
      label={environmentTypeDefinition.name}
      name={QualitativeEnvironmentFieldName}
      id={QualitativeEnvironmentFieldName}
      options={environmentTypeDefinition.options.map((option) => ({
        label: option.name,
        value: option.environment_qualitative_option_id
      }))}
    />
  );
};
