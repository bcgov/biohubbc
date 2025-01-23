import AutocompleteField from 'components/fields/AutocompleteField';
import { CBQualitativeMeasurementTypeDefinition } from 'interfaces/useCritterApi.interface';

export interface ISubcountCountFieldProps {
  formikPrefixPath: string;
  measurementTypeDefinition: CBQualitativeMeasurementTypeDefinition;
}

/**
 * Subcount Qualitative Measurement Field component.
 *
 * @param {ISubcountCountFieldProps} props
 * @return {*}
 */
export const SubcountQualitativeMeasurementField = (props: ISubcountCountFieldProps) => {
  const { formikPrefixPath, measurementTypeDefinition } = props;

  const formikFieldName = formikPrefixPath ? `${formikPrefixPath}.measurement_option_id` : 'measurement_option_id';

  return (
    <AutocompleteField
      label={measurementTypeDefinition.measurement_name}
      name={formikFieldName}
      id={formikFieldName}
      options={measurementTypeDefinition.options.map((option) => ({
        label: option.option_label,
        value: option.qualitative_option_id
      }))}
    />
  );
};
