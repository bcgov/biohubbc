import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import {
  CreateTechniqueFormValues,
  UpdateTechniqueFormValues
} from 'features/surveys/sampling-information/techniques/components/TechniqueFormContainer';
import { useFormikContext } from 'formik';
import { ITechniqueAttributeQualitative, ITechniqueAttributeQuantitative } from 'interfaces/useReferenceApi.interface';

interface ITechniqueAttributeValueControlProps {
  selectedAttributeTypeDefinition?: ITechniqueAttributeQuantitative | ITechniqueAttributeQualitative;
  index: number;
}

/**
 * Returns a form control for either selecting a qualitative attribute option or entering a quantitative attribute
 * value.
 *
 * Returns null if the selected attribute type definition is not provided.
 *
 * @template FormValues
 * @param {ITechniqueAttributeValueControlProps} props
 * @return {*}
 */
export const TechniqueAttributeValueControl = <
  FormValues extends CreateTechniqueFormValues | UpdateTechniqueFormValues
>(
  props: ITechniqueAttributeValueControlProps
) => {
  const { selectedAttributeTypeDefinition, index } = props;

  const { setFieldValue } = useFormikContext<FormValues>();

  if (!selectedAttributeTypeDefinition) {
    return (
      <CustomTextField
        name={'_disabled_placeholder_field'}
        label="Value"
        other={{
          required: true,
          disabled: true,
          placeholder: 'Value'
        }}
      />
    );
  }

  if ('method_lookup_attribute_qualitative_id' in selectedAttributeTypeDefinition) {
    // Return the qualitative attribute option select component
    return (
      <AutocompleteField
        id={`attributes.[${index}].attribute_value`}
        name={`attributes.[${index}].attribute_value`}
        label={'Value'}
        options={selectedAttributeTypeDefinition.options.map((option) => ({
          label: option.name,
          value: option.method_lookup_attribute_qualitative_option_id
        }))}
        onChange={(_, option) => {
          if (!option?.value) {
            return;
          }

          setFieldValue(`attributes.[${index}].attribute_value`, option.value);
        }}
        required
        sx={{
          flex: '1 1 auto'
        }}
      />
    );
  }

  // Return the quantitative attribute value component
  return (
    <CustomTextField
      name={`attributes.[${index}].attribute_value`}
      label={selectedAttributeTypeDefinition.unit ? `Value (${selectedAttributeTypeDefinition.unit})` : 'Value'}
      other={{
        required: true,
        type: 'number',
        placeholder: 'Value'
      }}
    />
  );
};
