import { grey } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { ITechniqueAttributeQuantitative } from 'interfaces/useReferenceApi.interface';
import { TechniqueQuantitativeAttribute } from 'interfaces/useTechniqueApi.interface';

interface TechniqueCardQuantitativeAttributesProps {
  quantitativeAttributes: TechniqueQuantitativeAttribute[];
  methodAttributes: {
    quantitative: ITechniqueAttributeQuantitative[];
  };
}

/**
 * Renders quantitative attributes for a technique.
 *
 * @param {TechniqueCardQuantitativeAttributesProps} props - The props for the component.
 * @returns {*} The rendered component.
 */
const TechniqueCardQuantitativeAttributes = ({
  quantitativeAttributes,
  methodAttributes
}: TechniqueCardQuantitativeAttributesProps) => {
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
              label={
                <>
                  {attributeLookup.name}:&nbsp;
                  <Typography component="span">
                    {attribute.value}&nbsp;({attributeLookup.unit})
                  </Typography>
                </>
              }
              colour={grey[300]}
            />
          );
        }
        return null;
      })}
    </>
  );
};

export default TechniqueCardQuantitativeAttributes;
