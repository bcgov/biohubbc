import { grey } from '@mui/material/colors';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { ITechniqueAttributeQuantitative } from 'interfaces/useReferenceApi.interface';
import { TechniqueQuantitativeAttribute } from 'interfaces/useTechniqueApi.interface';
import React from 'react';

interface QuantitativeAttributesProps {
  quantitativeAttributes: TechniqueQuantitativeAttribute[];
  methodAttributes: {
    quantitative: ITechniqueAttributeQuantitative[];
  };
}

/**
 * Renders quantitative attributes for a technique.
 *
 * @param {QuantitativeAttributesProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const QuantitativeAttributes: React.FC<QuantitativeAttributesProps> = ({
  quantitativeAttributes,
  methodAttributes
}) => {
  return (
    <>
      {quantitativeAttributes.map((attribute) => {
        const attributeLookup = methodAttributes.quantitative.find(
          (lookup) =>
            lookup.method_lookup_attribute_quantitative_id === attribute.method_lookup_attribute_quantitative_id
        );

        if (attributeLookup) {
          return (
            <AccordionStandardCard
              key={attribute.method_lookup_attribute_quantitative_id}
              label={`${attributeLookup.name}: ${attribute.value} ${attributeLookup.unit}`}
              colour={grey[300]}
            />
          );
        }
        return null;
      })}
    </>
  );
};

export default QuantitativeAttributes;
