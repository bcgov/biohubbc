import AutocompleteField from 'components/fields/AutocompleteField';
import { CBQualitativeMeasurementTypeDefinition } from 'interfaces/useCritterApi.interface';

export interface ISubcountQualitativeMeasurementFieldProps {
  formikFieldName: string;
  measurementTypeDefinition: CBQualitativeMeasurementTypeDefinition;
}

/**
 * Subcount Qualitative Measurement Field component.
 *
 * @param {ISubcountQualitativeMeasurementFieldProps} props
 * @return {*}
 */
export const SubcountQualitativeMeasurementField = (props: ISubcountQualitativeMeasurementFieldProps) => {
  const { formikFieldName, measurementTypeDefinition } = props;

  const subcountQualitativeMeasurementFieldName = `${formikFieldName}.measurement_option_id`;

  return (
    <AutocompleteField
      label={measurementTypeDefinition.measurement_name}
      name={subcountQualitativeMeasurementFieldName}
      id={subcountQualitativeMeasurementFieldName}
      options={measurementTypeDefinition.options.map((option) => ({
        label: option.option_label,
        value: option.qualitative_option_id
      }))}
    />
  );
};
