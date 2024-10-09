import { grey } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { ITechniqueAttributeQualitative } from 'interfaces/useReferenceApi.interface';
import { TechniqueQualitativeAttribute } from 'interfaces/useTechniqueApi.interface';
import React from 'react';

interface QualitativeAttributesProps {
  qualitativeAttributes: TechniqueQualitativeAttribute[];
  methodAttributes: {
    qualitative: ITechniqueAttributeQualitative[];
  };
}

/**
 * Renders qualitative attributes for a technique.
 *
 * @param {QualitativeAttributesProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const QualitativeAttributes: React.FC<QualitativeAttributesProps> = ({ qualitativeAttributes, methodAttributes }) => {
  return (
    <Stack gap={1} mb={2}>
      {qualitativeAttributes.map((attribute) => {
        const attributeLookup = methodAttributes.qualitative.find(
          (lookup) => lookup.method_lookup_attribute_qualitative_id === attribute.method_lookup_attribute_qualitative_id
        );

        const attributeName = attributeLookup?.name;
        const attributeValue = attributeLookup?.options.find(
          (option) =>
            option.method_lookup_attribute_qualitative_option_id ===
            attribute.method_lookup_attribute_qualitative_option_id
        )?.name;

        return (
          <AccordionStandardCard
            key={attribute.method_lookup_attribute_qualitative_id}
            label={`${attributeName}: ${attributeValue}`}
            colour={grey[300]}
          />
        );
      })}
    </Stack>
  );
};

export default QualitativeAttributes;
