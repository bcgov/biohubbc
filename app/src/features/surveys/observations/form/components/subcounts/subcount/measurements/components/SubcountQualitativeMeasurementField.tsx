import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { CBQualitativeMeasurementTypeDefinition } from 'interfaces/useCritterApi.interface';
import { SyntheticEvent } from 'react';

export interface ISubcountQualitativeMeasurementFieldProps<
  OptionValueType extends string | number,
  OptionType extends IAutocompleteFieldOption<OptionValueType>
> {
  formikFieldName: string;
  measurementTypeDefinition: CBQualitativeMeasurementTypeDefinition;
  onChange?: (event: SyntheticEvent<Element, Event>, option: OptionType | null) => void;
}

/**
 * Subcount Qualitative Measurement Field component.
 *
 * @param {ISubcountQualitativeMeasurementFieldProps} props
 * @return {*}
 */
export const SubcountQualitativeMeasurementField = <
  OptionValueType extends string | number,
  OptionType extends IAutocompleteFieldOption<OptionValueType>
>(
  props: ISubcountQualitativeMeasurementFieldProps<OptionValueType, OptionType>
) => {
  const { formikFieldName, measurementTypeDefinition, onChange } = props;

  const subcountQualitativeMeasurementFieldName = `${formikFieldName}.measurement_option_id`;

  return (
    <AutocompleteField
      label={measurementTypeDefinition.measurement_name}
      name={subcountQualitativeMeasurementFieldName}
      id={subcountQualitativeMeasurementFieldName}
      options={
        measurementTypeDefinition.options.map((option) => ({
          label: option.option_label,
          value: option.qualitative_option_id
        })) as OptionType[]
      }
      onChange={onChange}
    />
  );
};
