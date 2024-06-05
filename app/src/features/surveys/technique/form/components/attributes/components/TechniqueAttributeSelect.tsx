import { mdiClose } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import { TechniqueAttributeValueControl } from 'features/surveys/technique/form/components/attributes/components/TechniqueAttributeValueControl';
import { TechniqueFormValues } from 'features/surveys/technique/form/components/TechniqueForm';
import { FieldArrayRenderProps, useFormikContext } from 'formik';
import { ITechniqueAttributeQualitative, ITechniqueAttributeQuantitative } from 'interfaces/useReferenceApi.interface';
import { useMemo } from 'react';

interface ICaptureTechniqueAttributeSelectProps {
  attributes: (ITechniqueAttributeQuantitative | ITechniqueAttributeQualitative)[];
  arrayHelpers: FieldArrayRenderProps;
  index: number;
}

/**
 * Returns a component for selecting ecological (ie. collection) units for a given species.
 *
 * @param {ICaptureTechniqueAttributeSelectProps} props
 * @return {*}
 */
export const TechniqueAttributeSelect = (props: ICaptureTechniqueAttributeSelectProps) => {
  const { arrayHelpers, attributes, index } = props;

  const { values, setFieldValue } = useFormikContext<TechniqueFormValues>();

  // The type definition for the currently selected attribute, if one has been selected
  const selectedAttributeTypeDefinition = useMemo(
    () =>
      values.attributes[index]
        ? attributes.find((attribute) => {
            if ('method_lookup_attribute_qualitative_id' in attribute) {
              return attribute.method_lookup_attribute_qualitative_id === values.attributes[index].attribute_id;
            }

            return attribute.method_lookup_attribute_quantitative_id === values.attributes[index].attribute_id;
          })
        : undefined,
    [attributes, index, values.attributes]
  );

  // The attribute type definitions that can be selected (ie. not already selected), which includes the currently
  // selected attribute type definition, if one has been selected.
  const filteredAttributes = useMemo(() => {
    const selectedAttributeIds = values.attributes.map((attribute) => attribute.attribute_id);

    const remainingAttributes = attributes
      .filter((attribute) => {
        if ('method_lookup_attribute_qualitative_id' in attribute) {
          return !selectedAttributeIds.includes(attribute.method_lookup_attribute_qualitative_id);
        }

        return !selectedAttributeIds.includes(attribute.method_lookup_attribute_quantitative_id);

        // return true;
      })
      .map((option) => {
        if ('method_lookup_attribute_qualitative_id' in option) {
          return {
            value: option.method_lookup_attribute_qualitative_id,
            label: option.name,
            description: option.description
          };
        }

        return {
          value: option.method_lookup_attribute_quantitative_id,
          label: option.name,
          description: option.description
        };
      });

    if (selectedAttributeTypeDefinition) {
      if ('method_lookup_attribute_qualitative_id' in selectedAttributeTypeDefinition) {
        return [
          {
            value: selectedAttributeTypeDefinition.method_lookup_attribute_qualitative_id,
            label: selectedAttributeTypeDefinition.name,
            description: selectedAttributeTypeDefinition.description
          },
          ...remainingAttributes
        ];
      }

      return [
        {
          value: selectedAttributeTypeDefinition.method_lookup_attribute_quantitative_id,
          label: selectedAttributeTypeDefinition.name,
          description: selectedAttributeTypeDefinition.description
        },
        ...remainingAttributes
      ];
    }

    return remainingAttributes;
  }, [attributes, selectedAttributeTypeDefinition, values.attributes]);

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
        id={`attributes.[${index}].attribute_id`}
        name={`attributes.[${index}].attribute_id`}
        label="Attribute"
        options={filteredAttributes}
        onChange={(_, option) => {
          if (!option?.value) {
            return;
          }

          setFieldValue(`attributes.[${index}]`, {
            attribute_id: option.value,
            attribute_type: 'method_lookup_attribute_qualitative_id' in option ? 'qualitative' : 'quantitative'
          });
        }}
        required
        sx={{
          flex: '0.5'
        }}
      />

      <Box flex="0.5">
        <TechniqueAttributeValueControl
          attributes={attributes}
          selectedAttributeTypeDefinition={selectedAttributeTypeDefinition}
          arrayHelpers={arrayHelpers}
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
