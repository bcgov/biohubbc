import { grey } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { ITechniqueAttributeQualitative } from 'interfaces/useReferenceApi.interface';
import { TechniqueQualitativeAttribute } from 'interfaces/useTechniqueApi.interface';

interface TechniqueCardQualitativeAttributesProps {
  qualitativeAttributes: TechniqueQualitativeAttribute[];
  methodAttributes: {
    qualitative: ITechniqueAttributeQualitative[];
  };
}

/**
 * Renders qualitative attributes for a technique.
 *
 * @param {TechniqueCardQualitativeAttributesProps} props
 * @returns {*}
 */
const TechniqueCardQualitativeAttributes = ({
  qualitativeAttributes,
  methodAttributes
}: TechniqueCardQualitativeAttributesProps) => {
  return (
    <>
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
            label={
              <>
                {attributeName}:&nbsp;
                <Typography component="span">{attributeValue}</Typography>
              </>
            }
            colour={grey[300]}
          />
        );
      })}
    </>
  );
};

export default TechniqueCardQualitativeAttributes;
