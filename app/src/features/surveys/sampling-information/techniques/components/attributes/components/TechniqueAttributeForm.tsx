import { mdiClose } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import { TechniqueAttributeValueControl } from 'features/surveys/sampling-information/techniques/components/attributes/components/TechniqueAttributeValueControl';
import {
  formatAttributesForAutoComplete,
  getAttributeId,
  getAttributeType,
  getRemainingAttributes
} from 'features/surveys/sampling-information/techniques/components/attributes/components/utils';
import {
  CreateTechniqueFormValues,
  UpdateTechniqueFormValues
} from 'features/surveys/sampling-information/techniques/components/TechniqueFormContainer';
import { FieldArrayRenderProps, useFormikContext } from 'formik';
import { ITechniqueAttributeQualitative, ITechniqueAttributeQuantitative } from 'interfaces/useReferenceApi.interface';
import { useMemo } from 'react';

interface ITechniqueAttributeFormProps {
  attributeTypeDefinitions: (ITechniqueAttributeQuantitative | ITechniqueAttributeQualitative)[];
  arrayHelpers: FieldArrayRenderProps;
  index: number;
}

/**
 * Technique attribute form.
 *
 * @template FormValues
 * @param {ITechniqueAttributeFormProps} props
 * @return {*}
 */
export const TechniqueAttributeForm = <FormValues extends CreateTechniqueFormValues | UpdateTechniqueFormValues>(
  props: ITechniqueAttributeFormProps
) => {
  const { arrayHelpers, attributeTypeDefinitions, index } = props;

  const { values, setFieldValue } = useFormikContext<FormValues>();

  // The type definition for the currently selected attribute, if one has been selected
  const selectedAttributeTypeDefinition = useMemo(
    () =>
      values.attributes[index]
        ? attributeTypeDefinitions.find((attribute) => {
            if ('method_lookup_attribute_qualitative_id' in attribute) {
              return attribute.method_lookup_attribute_qualitative_id === values.attributes[index].attribute_lookup_id;
            }

            return attribute.method_lookup_attribute_quantitative_id === values.attributes[index].attribute_lookup_id;
          })
        : undefined,
    [attributeTypeDefinitions, index, values.attributes]
  );

  // The IDs of the attributes that have already been selected, and should not be available for selection again
  const unavailableAttributeIds = useMemo(() => {
    return values.attributes.map((attribute) => attribute.attribute_lookup_id);
  }, [values.attributes]);

  // The ID of the currently selected attribute
  const selectedAttributeId = selectedAttributeTypeDefinition && getAttributeId(selectedAttributeTypeDefinition);

  // The remaining attributes that are available for selection
  const remainingAttributeTypeDefinitions = useMemo(() => {
    return getRemainingAttributes(attributeTypeDefinitions, unavailableAttributeIds, selectedAttributeId);
  }, [attributeTypeDefinitions, selectedAttributeId, unavailableAttributeIds]);

  // The remaining attributes formatted for use by the autocomplete component
  const attributesOptionsForAutocomplete = useMemo(() => {
    return formatAttributesForAutoComplete(remainingAttributeTypeDefinitions);
  }, [remainingAttributeTypeDefinitions]);

  return (
    <Card
      component={Stack}
      variant="outlined"
      flexDirection="row"
      alignItems="flex-start"
      gap={2}
      sx={{
        width: '100%',
        p: 2,
        backgroundColor: grey[100]
      }}>
      <AutocompleteField
        id={`attributes.[${index}].attribute_lookup_id`}
        name={`attributes.[${index}].attribute_lookup_id`}
        label="Attribute"
        options={attributesOptionsForAutocomplete}
        onChange={(_, option) => {
          if (!option?.value) {
            return;
          }

          setFieldValue(`attributes.[${index}]`, {
            ...values.attributes[index],
            attribute_lookup_id: option.value,
            attribute_type: getAttributeType(remainingAttributeTypeDefinitions, option.value)
          });
        }}
        required
        sx={{
          flex: '0.5'
        }}
      />

      <Box flex="0.5">
        <TechniqueAttributeValueControl
          selectedAttributeTypeDefinition={selectedAttributeTypeDefinition}
          index={index}
        />
      </Box>

      <IconButton
        data-testid={`attribute-delete-button-${index}`}
        title="Remove attribute"
        aria-label="Remove attribute"
        onClick={() => arrayHelpers.remove(index)}
        sx={{ mt: 1.125 }}>
        <Icon path={mdiClose} size={1} />
      </IconButton>
    </Card>
  );
};
