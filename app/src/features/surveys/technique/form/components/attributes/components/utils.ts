import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { TechniqueAttributeFormValues } from 'features/surveys/technique/form/components/TechniqueForm';
import { ITechniqueAttributeQualitative, ITechniqueAttributeQuantitative } from 'interfaces/useReferenceApi.interface';

/**
 * Given a list of mixed type attributes (qualitative and quantitative), and a list of unavailable attribute IDs, return
 * a list of mixed attribute types that do not include the unavailable attributes.
 *
 * @param {((ITechniqueAttributeQuantitative | ITechniqueAttributeQualitative)[])} allAttributeTypeDefinitions All
 * attribute type definitions.
 * @param {string[]} [unavailableAttributeIds=[]] A list of attribute IDs that should not be included in the returned
 * list of attribute type definitions.
 * @param {string} [selectedAttributeId] The ID of the selected attribute type definition, if one has been selected,
 * which should be included in the returned list of attribute type definitions.
 * @return {*}  {((ITechniqueAttributeQuantitative | ITechniqueAttributeQualitative)[])}
 */
export const getRemainingAttributes = (
  allAttributeTypeDefinitions: (ITechniqueAttributeQuantitative | ITechniqueAttributeQualitative)[],
  unavailableAttributeIds: string[] = [],
  selectedAttributeId?: string
): (ITechniqueAttributeQuantitative | ITechniqueAttributeQualitative)[] => {
  const remainingAttributeTypeDefinitions = allAttributeTypeDefinitions.filter((attributeTypeDefinition) => {
    if ('method_lookup_attribute_qualitative_id' in attributeTypeDefinition) {
      return (
        selectedAttributeId === attributeTypeDefinition.method_lookup_attribute_qualitative_id ||
        !unavailableAttributeIds.includes(attributeTypeDefinition.method_lookup_attribute_qualitative_id)
      );
    }

    return (
      selectedAttributeId === attributeTypeDefinition.method_lookup_attribute_quantitative_id ||
      !unavailableAttributeIds.includes(attributeTypeDefinition.method_lookup_attribute_quantitative_id)
    );
  });

  return remainingAttributeTypeDefinitions;
};

/**
 * Given a list of mixed type attributes (qualitative and quantitative), return an array of objects that can be used
 * with the AutoComplete component.
 *
 * @param {((ITechniqueAttributeQuantitative | ITechniqueAttributeQualitative)[])} attributes
 * @return {*}  {IAutocompleteFieldOption<string>[]}
 */
export const formatAttributesForAutoComplete = (
  attributes: (ITechniqueAttributeQuantitative | ITechniqueAttributeQualitative)[]
): IAutocompleteFieldOption<string>[] => {
  return attributes.map((option) => {
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
};

/**
 * Given a list of mixed type attributes (qualitative and quantitative), return the type of the attribute that matches
 * the provided attribute ID.
 *
 * @param {((ITechniqueAttributeQualitative | ITechniqueAttributeQuantitative)[])} allAttributes
 * @param {string} attributeId
 * @return {*}  {(TechniqueAttributeFormValues['attribute_type'] | undefined)}
 */
export const getAttributeType = (
  allAttributes: (ITechniqueAttributeQualitative | ITechniqueAttributeQuantitative)[],
  attributeId: string
): TechniqueAttributeFormValues['attribute_type'] | undefined => {
  for (const attribute of allAttributes) {
    if ('method_lookup_attribute_qualitative_id' in attribute) {
      if (attribute.method_lookup_attribute_qualitative_id === attributeId) {
        return 'qualitative';
      }
    } else {
      if (attribute.method_lookup_attribute_quantitative_id === attributeId) {
        return 'quantitative';
      }
    }
  }
};

/**
 * Given a mixed type attribute (qualitative or quantitative), return the ID of the attribute.
 *
 * @param {(ITechniqueAttributeQualitative | ITechniqueAttributeQuantitative)} attributeTypeDefinition
 * @return {*}  {string}
 */
export const getAttributeId = (
  attributeTypeDefinition: ITechniqueAttributeQualitative | ITechniqueAttributeQuantitative
): string => {
  if ('method_lookup_attribute_qualitative_id' in attributeTypeDefinition) {
    return attributeTypeDefinition.method_lookup_attribute_qualitative_id;
  }

  return attributeTypeDefinition.method_lookup_attribute_quantitative_id;
};
